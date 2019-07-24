'use strict';
// https://bl.ocks.org/ndaly500/ab1e8fbe59453ae7c43c2162388dd36d
// https://github.com/square/crossfilter/wiki/API-Reference
// https://stackoverflow.com/questions/44200020/how-to-load-a-csv-file-into-crossfilter-with-d3
// https://github.com/dc-js/dc.js/wiki/Optimization-and-Performance-Tuning

console.time('ProcessTime');

// Settings

const // sqlDayZero = new Date(1900, 0, 1), // months are 0 based, 0 = Jan
	jsDayZero = new Date(0),
	// Currently see time spent in A&E up to 24 hours - set anything above 8 hours to 8
	maxDuration = +d3.timeMinute.offset(jsDayZero, 60 * 8),
	// Most formatting declared in function but this is used outside? Could just write it twice!
	formatHour12 = d3.timeFormat('%I %p'); // %I hour (12-hour clock) as a decimal number [01,12], %p - either AM or PM

var cf, all, groupTimeofDay; // used for heat key calcs

// Charting - these need to be in global scope eg. for reset
const // Time Charts
	// chtDayofWeek = dc.pieChart("#day-of-week-chart"),
	// heatmapTimeDay = dc.heatMap("#heatmapTimeDay"),
	seriesDaily = dc.lineChart('#daily-trend-chart'),
	seriesPeriod = dc.barChart('#period-trend-chart');
// Diagnosis Charts
// chtDiagMain = dc.rowChart("#diagMain-chart"),
// chtDiagnoses = dc.sunburstChart("#diagnosis-chart-wide"),
// chtComplaint = dc.sunburstChart("#complaint-chart"),
// chtAcuity = dc.pieChart("#acuity-chart"),
// // Patient Characteristic Charts
// chtAgeBand = dc.rowChart("#ageband-chart"),
// dropGPPractice = dc.selectMenu("#gppractice-drop"),
// // Other
// chtRefSource = dc.sunburstChart("#refSource-chart"),
// cBoxEDFD = dc.cboxMenu("#EDFD-cbox"), // How to build in streamed into disposal... the following should just be one
// chtDischDest = dc.sunburstChart("#dischDest-chart"),
// chtDischStatus = dc.sunburstChart("#dischStatus-chart"),
// chtDischFUP = dc.sunburstChart("#dischFUP-chart"),
// chtDrugAlcohol = dc.sunburstChart("#drugalcohol-chart"),
// chtDuration = dc.lineChart("#duration-chart"),
// boxPlotDuration = dc.boxPlot("#box-test"),
// mapLSOA = dc_leaflet.choroplethChart("#map-test");
// Import Reference Tables and Data
// https://github.com/d3/d3-fetch/blob/master/README.md#dsv

const missingSnomedCodes = Object.create(null);

// The main data

// testing d3.csv
const mainData = d3.csv('Data/ecds/AE_RawData_snomed_incHead.csv', function(d) {
	/*
  Capture codes not included in the lookup tables
  The below are used to log any codes that do not have a valid lookup
  Consider including in the reference tables (might need a default description/ invalid)
  */

	if (diagnosisRefObj[+d.snomed_diagnosis] === undefined) {
		if (+d.snomed_diagnosis !== 0) {
			diagnosis_set.add(+d.snomed_diagnosis);
		}
	}

	if (attdSourceRefObj[+d.snomed_attd] === undefined) {
		if (+d.snomed_attd !== 0) {
			attdSource_set.add(+d.snomed_attd);
		}
	}

	if (complaintRefObj[+d.snomed_complaint] === undefined) {
		if (+d.snomed_complaint !== 0) {
			complaint_set.add(+d.snomed_complaint);
		}
	}

	if (dischdestRefObj[+d.snomed_dischargedest] === undefined) {
		if (+d.snomed_dischargedest !== 0) {
			dischdest_set.add(+d.snomed_dischargedest);
		}
	}

	if (dischdestRefObj[+d.snomed_dischargestatus] === undefined) {
		if (+d.snomed_dischargestatus !== 0) {
			dischstatus_set.add(+d.snomed_dischargestatus);
		}
	}

	if (dischfupRefObj[+d.snomed_dischargeFU] === undefined) {
		if (+d.snomed_dischargeFU !== 0) {
			dischfup_set.add(+d.snomed_dischargeFU);
		}
	}

	if (injdrugRefObj[+d.snomed_injdrug] === undefined) {
		if (+d.snomed_injdrug !== 0) {
			injdrug_set.add(+d.snomed_injdrug);
		}
	}

	// Main Data Output
	return {
		Arrival_Date_ms: +d.Arrival_Date_ms,
		Period: +d.Period_ms,
		duration: Math.min(+d.Duration_ms, maxDuration), // Fix max duration at source
		ageBand: arrAgeBand.indexOf(d.AgeBand),
		practice:
			practiceObj[d.practice_code] !== undefined ? d.practice_code : 0,
		Diagnoses:
			diagnosisRefObj[+d.snomed_diagnosis] !== undefined
				? diagnosisRefObj[+d.snomed_diagnosis] // ie. snomed code has been found...
				: +d.snomed_diagnosis === 0
				? [0]
				: [999], // diagnosis_set.add(+d[sqlCols.diagnosis]); // log the unknown code here to update in ref tables
		DiagnosisMainGroup:
			diagnosisRefObj[+d.snomed_diagnosis] !== undefined
				? diagnosisRefObj[+d.snomed_diagnosis][0]
				: +d.snomed_diagnosis === 0
				? 0
				: 999,
		attdSource:
			attdSourceRefObj[+d.snomed_attd] !== undefined
				? attdSourceRefObj[+d.snomed_attd]
				: [0],
		Complaint:
			complaintRefObj[+d.snomed_complaint] !== undefined
				? complaintRefObj[+d.snomed_complaint]
				: [0],
		dischDest:
			dischdestRefObj[+d.snomed_dischargedest] !== undefined
				? dischdestRefObj[+d.snomed_dischargedest]
				: [0],
		dischStatus:
			dischstatusRefObj[+d.snomed_dischargestatus] !== undefined
				? dischstatusRefObj[+d.snomed_dischargestatus]
				: [0],
		dischFUP:
			dischfupRefObj[+d.snomed_dischargeFU] !== undefined
				? dischfupRefObj[+d.snomed_dischargeFU]
				: [0],
		injdrug:
			injdrugRefObj[+d.snomed_injdrug] !== undefined
				? injdrugRefObj[+d.snomed_injdrug]
				: [0]
	};
});

// let ecdsData;
// mainData.then(function(data) {
//   ecdsData = data;
// })

mainData
	.then((ecdsData) => {
		console.timeEnd('importTime');
		// console.log(data);

		// Run the data through crossfilter and load the cf_data
		cf = crossfilter(ecdsData);
		all = cf.groupAll();

		// Used to present total number of records and number of filtered records
		// not currently working?
		dc.dataCount('#counter')
			.crossfilter(cf)
			.groupAll(all)
			.formatNumber(formatNumber)
			.html({
				some:
					'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
					" | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>", // dc.renderAll
				all:
					'All records selected. Please click on the charts to apply filters.'
			});

		return ecdsData;
	})
	.then((ecdsData) => {
		/* Time Related Charting */

		// Daily and Period Charts are closely linked

		var dimDaily = cf.dimension(function(d) {
				return +d.Arrival_Date_ms;
			}),
			groupDaily = dimDaily.group();

		// https://stackoverflow.com/questions/31808718/dc-js-barchart-first-and-last-bar-not-displaying-fully
		// check what the first set of square brackets are for
		let minDateTS = dimDaily.bottom(1)[0]['Arrival_Date_ms'],
			maxDateTS = dimDaily.top(1)[0]['Arrival_Date_ms'];

		let minDate = new Date(minDateTS),
			maxDate = new Date(maxDateTS);

		// minDate.setHours(minDate.getHours() - 1);
		// maxDate.setHours(maxDate.getHours() + 1);

		var dimPeriod = cf.dimension(function(d) {
				return d.Period;
			}),
			groupPeriod = dimPeriod.group();

		seriesDaily
			.useViewBoxResizing(true)
			.width(chtWidthStd)
			.height(chtHeightShort)
			.margins({ top: 0, right: 20, bottom: 60, left: 40 })
			.dimension(dimPeriod)
			.group(groupDaily)
			.x(
				d3
					.scaleTime()
					.domain([
						minDateTS - 1000 * 60 * 60 * 24 * 3,
						maxDateTS + 1000 * 60 * 60 * 24 * 3
					]) // add & remove one day in ms
					.range([
						d3.timeDay.offset(minDate, -3),
						d3.timeDay.offset(maxDate, 3)
					])
			) // add a bit to the max date here
			//
			// .round(d3.timeMonth.round)
			// .xUnits(d3.timeMonths)
			.rangeChart(seriesPeriod) // https://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html#rangeChart__anchor
			.curve(d3.curveLinear)
			.elasticX(false) // set this to false with range series so that the dates align
			.elasticY(true)
			.renderArea(true)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.renderLabel(false)
			.brushOn(false)
			.xyTipsOn(true) // This is ignored if the chart brush is on
			.dotRadius(5)
			.renderDataPoints({
				radius: 2,
				fillOpacity: 0.8,
				strokeOpacity: 0.0
			})
			.title(function(d) {
				// const day = new Date(d.key).getDay()
				const day = arrWeekDays[+formatWeekdayNo(d.key)];
				if (bankHolidayMap.has(d.key)) {
					return [
						day + ', ' + formatDaily(d.key),
						bankHolidayMap.get(d.key),
						"Att'd: " + formatNumber(d.value)
					].join('\n');
				} else {
					return [
						day + ', ' + formatDaily(d.key),
						"Att'd: " + formatNumber(d.value)
					].join('\n');
				}
			})
			.mouseZoomable(true) // use mouse scroll to zoom in and out
			.controlsUseVisibility(true)
			.turnOnControls(true)
			// colour testing
			// https://dc-js.github.io/dc.js/docs/html/dc.colorMixin.html
			// https://stackoverflow.com/questions/43056664/dc-js-scatter-chart-with-dot-color-based-on-counts
			.colorAccessor(function(d) {
				// console.log(d.x + '\n' + +formatWeekdayNo(d.x)); // + '\n' + test[+formatWeekdayNo(d.x)])
				// console.log(+formatWeekdayNo(d.x))
				if (bankHolidayMap.has(d.x)) {
					return 2; // bank holiday
				} else if (+formatWeekdayNo(d.x) === 1) {
					return 1; // 1 = Monday
				} else {
					return 0; // every other day
				}
			})
			// colours per day of week, starting sunday (first point sets colour for the area/ line. Separate colour to identify Mon)
			.colors(
				d3
					.scaleOrdinal()
					.domain([0, 1, 2]) // regular day, Monday, Bank Holiday
					.range(['#377eb8', '#e41a1c', '#ff8c00'])
			) // blue, red, yellow
			// need to add some padding around top
			// https://groups.google.com/forum/#!topic/dc-js-user-group/USgVVs4w7IU
			// https://github.com/dc-js/dc.js/issues/1203
			.yAxisPadding(10).yAxisMin = function() {
			return 0;
		};

		// http://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html
		seriesDaily
			.xAxis()
			// https://stackoverflow.com/questions/49178363/why-does-my-d3-charts-x-axis-include-the-first-of-every-month-as-a-tick-even-th/49178975#49178975
			//.ticks(d3.timeDay.filter(d => d3.timeDay.count(0, d) % 7 === 0))
			//.ticks(d3.timeDay.every(14))
			.tickFormat(formatDaily);

		seriesDaily.render();

		// rotate x-axis 90 degrees - need to adjust x/y to align appropriately
		seriesDaily.on('renderlet.a', function(chart) {
			chart
				.selectAll('g.x text')
				.attr('dx', '-30')
				.attr('dy', '-5')
				.attr('transform', 'rotate(-90)');
		});

		// https://stackoverflow.com/questions/51610885/how-to-change-date-format-value-in-filter-text-dc-js
		seriesDaily.filterPrinter(function(filters) {
			const dateStart = new Date(
				dc.utils.printSingleValue(filters[0][0])
			);
			const dateEnd = d3.timeDay.offset(
				new Date(dc.utils.printSingleValue(filters[0][1])),
				-1
			);
			return formatDaily(dateStart) + ' to ' + formatDaily(dateEnd);
		});

		seriesPeriod
			.useViewBoxResizing(true)
			.width(chtWidthStd)
			.height(chtHeightShort)
			.margins({
				top: 5,
				right: 40,
				bottom: 40,
				left: 40
			})
			.dimension(dimPeriod)
			.group(groupPeriod)
			.x(
				d3
					.scaleTime()
					.domain([minDateTS - 1000 * 60 * 60 * 24, maxDateTS]) // add & remove one day in ms
					.range([
						d3.timeDay.offset(minDate, -1),
						maxDate
						// d3.timeDay.offset(maxDate, 1)
					])
			)
			.xUnits(d3.timeMonths)
			.round(d3.timeMonth.round) // set filter brush rounding
			// round the bars to days to make the brush snap, so you cant select half a bar.
			// Somehow, only get this to work with .centerBar(false)
			.alwaysUseRounding(true)
			// .elasticX(false)
			.elasticY(true)
			.renderHorizontalGridLines(true)
			//.renderLabel(false)
			.brushOn(true)
			.mouseZoomable(false)
			.centerBar(false)
			//.barPadding(0.3)
			//.outerPadding(50)
			//.gap(30)
			.title(function(d) {
				return [d.key, formatNumber(d.value)].join(': ');
			})
			//.mouseZoomable(false) // use mouse scroll to zoom in and out
			.controlsUseVisibility(true)
			.turnOnControls(true)
			.xAxisPadding(10);

		// http://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html
		seriesPeriod
			.xAxis()
			.tickFormat(function(d) {
				// console.log(d);
				return formatPeriod(new Date(d));
			})
			.ticks(d3.timeMonth.every(1));

		// rotate x-axis 90 degrees - need to adjust x/y to align appropriately
		seriesPeriod.on('renderlet.a', function(chart) {
			chart
				.selectAll('g.x text')
				.attr('dx', '-22')
				.attr('dy', '5')
				.attr('transform', 'rotate(-90)');
		});

		// https://stackoverflow.com/questions/51610885/how-to-change-date-format-value-in-filter-text-dc-js
		// might be able to tidy this up - just using filter and formatting it...
		seriesPeriod.filterPrinter(function(filters) {
			const dateStart = new Date(
				dc.utils.printSingleValue(filters[0][0])
			);
			const dateEnd = d3.timeDay.offset(
				new Date(dc.utils.printSingleValue(filters[0][1])),
				-1
			);
			return formatDaily(dateStart) + ' to ' + formatDaily(dateEnd);
		});

		seriesPeriod.render();

		document.getElementById('bl-sectime').style.display = 'none';
		document.getElementById('sectime').style.visibility = 'visible';

		console.timeEnd('ProcessTime');
		return ecdsData;
	})
	// .then(ecdsData => {

	//   return ecdsData;
	// })
	.then(ecdsData => {
		// supplementary information, can comment out for speed...
		// how many rows?
		console.log(
			'%cNo of Records: %s',
			'color: blue; background: white',
			formatNumber(cf.size())
		);
		// log a random record
		const random = Math.floor(Math.random() * (+cf.size() - +0)) + +0; // random number between 0 and no. records
		console.log(ecdsData[random]); // console.log(data[0]);// example data

		missingSnomedCodes['diagnosis'] = diagnosis_set;
		missingSnomedCodes['complaint'] = complaint_set;
		missingSnomedCodes['attdSource'] = attdSource_set;
		missingSnomedCodes['dischDest'] = dischdest_set;
		missingSnomedCodes['dischStatus'] = dischstatus_set;
		missingSnomedCodes['dischFUP'] = dischfup_set;
		missingSnomedCodes['injDrug'] = injdrug_set;
		console.warn(missingSnomedCodes); // snomed codes that have not been found
	});

// https://stackoverflow.com/questions/49599691/how-to-load-data-from-a-csv-file-in-d3-v5?noredirect=1&lq=1
// https://stackoverflow.com/questions/49239474/load-multiple-files-using-the-d3-fetch-module

// Libraries and Versions
d3.json('https://api.github.com/repos/dc-js/dc.js/releases/latest').then(
	function(latestRelease) {
		/* jshint camelcase: false */
		/* jscs:disable */
		console.log(
			'%cdc.js version: %s',
			'color: blue; background: white',
			dc.version
		);
		console.log('latest dc.js stable release: ' + latestRelease.tag_name);
	}
);
console.log(
	'%cCrossfilter version: %s',
	'color: blue; background: white',
	crossfilter.version
);

// Supporting Functions
// Used to calculate average by day of the week (overkill but to understand!)
// https://stackoverflow.com/questions/28855309/dc-js-and-crossfilter-reduce-average-counts-per-day-of-week
function average_map(m) {
	let sum = 0,
		counter = 0;
	m.each(function(v, k) {
		// value, key this way round in .each
		sum += v;
		if (v > 0) {
			counter += 1;
		}
	});
	// return m.size() ? sum / m.size() : 0;
	return counter > 0 ? sum / counter : 0;
}

function heatKey(noCells) {
	//console.trace();
	//debugger;
	// https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
	const margin = {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		width = 200 - margin.left - margin.right,
		height = 20 - margin.top - margin.bottom;
	let arrCells = [];

	// from a number between 0 and 1, return a colour from the colour scale
	const sequentialScale = d3
		.scaleSequential()
		.domain([0, 1])
		.interpolator(d3.interpolateOrRd);

	// this sorts the day time in dscending order
	const heatmapGroup = groupTimeofDay.top(groupTimeofDay.size()); // 24 hours by 7 days = 168 - this returns an array of all records, # sorted descending #

	// Returns the top record
	let heatmapTDmax = heatmapGroup[0];
	console.log(heatmapTDmax); // returns the object only {key: [hour, day], value: x}
	// console.log(heatmapTDmax.key); // to extract the key only, [hour, day]
	// console.log(heatmapTDmax.value); // to extract the value only, x

	// Using the below to return the last record
	let heatmapTDmin = heatmapGroup[groupTimeofDay.size() - 1]; // +Object.keys(heatmapGroup).length;
	console.log(heatmapTDmin);

	let heatmapTDRange = heatmapTDmax.value - heatmapTDmin.value;
	// from a number between 0 and 1, returns a value between the min and max values
	const heatmapTDScale = d3.interpolateRound(
		heatmapTDmin.value,
		heatmapTDmax.value
	);

	if (noCells === undefined) {
		// console.log(heatmapTDRange)
		if (heatmapTDRange > 100) {
			noCells = 10;
		} else {
			noCells = 5;
		}
	}

	for (let i = 0; i < noCells; i++) {
		arrCells.push(i / (noCells - 1));
	}
	// console.log(arrCells);

	d3.select('#legend')
		.selectAll('svg')
		//.data(arrCells)
		//.exit()
		.remove();

	let svg = d3
		.select('#legend')
		.append('svg')
		// .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (60)); // height + margin.top + margin.bottom
		.attr('viewBox', '0 5 200 20'); // height + margin.top + margin.bottom

	let heatKeyCells = svg
		.selectAll('g')
		.data(arrCells)
		.enter()
		.append('g')
		.attr('transform', 'translate(' + 5 + ',' + 5 + ')'); // (height / 2)

	heatKeyCells
		.append('rect')
		.attr('x', function(d, i) {
			return i * 10;
		})
		.attr('class', 'heatCell')
		.attr('y', 0)
		.attr('width', 9)
		.attr('height', 9)
		.style('fill', function(d) {
			return sequentialScale(d);
		});

	heatKeyCells
		.append('text')
		.text(function(d, i) {
			if (i % 2 === 0 || i === noCells - 1) {
				return heatmapTDScale(d);
			}
		})
		.attr('class', 'heatLabel')
		.merge(heatKeyCells)
		.attr('x', function(d, i) {
			return i * 10;
		})
		.attr('dx', 5)
		.attr('y', 15)
		.attr('font-size', '0.15em')
		.attr('fill', '#009')
		.attr('text-anchor', 'middle');

	// Insert text into html
	document.getElementById('heatDayMax').textContent =
		arrWeekDays[heatmapTDmax.key[1]];
	document.getElementById('heatTimeMax').textContent = formatHour12(
		new Date(0).setHours(heatmapTDmax.key[0])
	);

	document.getElementById('heatDayMin').textContent =
		arrWeekDays[heatmapTDmin.key[1]];
	document.getElementById('heatTimeMin').textContent = formatHour12(
		//new Date(1900, 0, 1, heatmapTDmin.key[0], 0, 0, 0)
		new Date(0).setHours(heatmapTDmin.key[0])
	);
	console.warn('Why do i run twice?');
}
