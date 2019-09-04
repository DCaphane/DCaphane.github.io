"use strict";
// https://bl.ocks.org/ndaly500/ab1e8fbe59453ae7c43c2162388dd36d
// https://github.com/square/crossfilter/wiki/API-Reference
// https://stackoverflow.com/questions/44200020/how-to-load-a-csv-file-into-crossfilter-with-d3
// https://github.com/dc-js/dc.js/wiki/Optimization-and-Performance-Tuning

console.time("ProcessTime");

// Settings

const // sqlDayZero = new Date(1900, 0, 1), // months are 0 based, 0 = Jan
	jsDayZero = new Date(0),
	// Currently see time spent in A&E up to 24 hours - set anything above 8 hours to 8
	maxDuration = +d3.timeMinute.offset(jsDayZero, 60 * 8),
	// Most formatting declared in function but this is used outside? Could just write it twice!
	formatHour12 = d3.timeFormat("%I %p"); // %I hour (12-hour clock) as a decimal number [01,12], %p - either AM or PM

var cf, all, groupTimeofDay; // used for heat key calcs

// Charting - these need to be in global scope eg. for reset
let // Time Charts
	chtDayofWeek,
	heatmapTimeDay,
	seriesDaily,
	seriesPeriod,
	// Diagnosis Charts
	chtDiagMain,
	chtDiagnoses,
	chtComplaint, // = dc.sunburstChart("#complaint-chart"),
	chtAcuity, // = dc.pieChart("#acuity-chart"),
	chtDrugAlcohol, // = dc.sunburstChart("#drugalcohol-chart"),
	// Patient Characteristic Charts
	chtAgeBand, // = dc.rowChart("#ageband-chart"),
	dropGPPractice, // = dc.selectMenu("#gppractice-drop"),
	chtGPPractice,
	// Other
	chtRefSource, // = dc.sunburstChart("#refSource-chart"),
	cBoxEDFD, // = dc.cboxMenu("#EDFD-cbox"), // How to build in streamed into disposal... the following should just be one
	chtDischDest, // = dc.sunburstChart("#dischDest-chart"),
	chtDischStatus, // = dc.sunburstChart("#dischStatus-chart"),
	chtDischFUP, // = dc.sunburstChart("#dischFUP-chart"),
	chtDuration, // = dc.lineChart("#duration-chart"),
	mapLSOA; // = dc_leaflet.choroplethChart("#map-lsoa"),
// Experimental
let simpleMap, boxPlotDuration; // = dc.boxPlot("#box-test"),

// Import Reference Tables and Data
// https://github.com/d3/d3-fetch/blob/master/README.md#dsv

const missingSnomedCodes = Object.create(null);

const durationBand = 5; // round duration time to eg. 10 mins

function roundDuration(n, x = 5) {
	// x is time in minutes to round to
	const ms = x * 60 * 1000; // convert to milliseconds
	return Math.floor(n / ms) * ms;
}
// The main data

async function ecdsCharts() {
	const ecdsData = await d3.csv(
		"Data/ecds/AE_RawData_snomed_incHead.csv",
		processRow // this function is applied to each row of the imported data
	);

	console.timeEnd("importTime");

	log(ecdsData.columns);

	cfOverview(ecdsData);
	timeCharts();
	diagnosisCharts();
	otherDetails();
	dischargeCharts();
	// unusedCharts();
	/*
    Drop any unused fields from csv:


  */

	dc.renderAll();
	// End of ECDS Charts
	console.timeEnd("ProcessTime");
}

ecdsCharts();

// https://stackoverflow.com/questions/49599691/how-to-load-data-from-a-csv-file-in-d3-v5?noredirect=1&lq=1
// https://stackoverflow.com/questions/49239474/load-multiple-files-using-the-d3-fetch-module

const versioning = "Current Versions";
console.groupCollapsed(versioning);
// Libraries and Versions
d3.json("https://api.github.com/repos/dc-js/dc.js/releases/latest").then(
	function(latestRelease) {
		/* jshint camelcase: false */
		/* jscs:disable */
		log(`dc.js version: ${dc.version}`);
		log(`latest dc.js stable release: ${latestRelease.tag_name}`);

		log(`Crossfilter version: ${crossfilter.version}`);
		console.groupEnd(versioning);
	}
);

function processRow(d, index, columnKeys) {
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
		Hour: +d.Hour,
		WeekdayNo: +d.WeekdayNo,
		duration: Math.min(
			roundDuration(+d.Duration_ms, durationBand),
			maxDuration
		), // Duration in mins rounded to durationBand mins. Also, fix max duration at source
		ageBand: +d.AgeBand, // arrAgeBand.indexOf(d.AgeBand),
		practice:
			practiceObj[d.practice_code] !== undefined
				? +practiceObj[d.practice_code][0] // d.practice_code, format as numeric
				: 0,
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
		complaint:
			complaintRefObj[+d.snomed_complaint] !== undefined
				? complaintRefObj[+d.snomed_complaint]
				: [0],
		acuity: +d.snomed_acuity,
		injdrug: +d.snomed_injdrug,
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
				: [0],
		commSerial: +d.Comm_Serial,
		lsoa: d.lsoa // string
	};
}

function cfOverview(ecdsData) {
	// Run the data through crossfilter and load the cf_data
	cf = crossfilter(ecdsData);
	all = cf.groupAll();

	// supplementary information, can comment out for speed...
	// how many rows?
	log(`No of Records:	${formatNumber(cf.size())}`, "info");
	// log a random record
	const random = Math.floor(Math.random() * (+cf.size() - +0)) + +0; // random number between 0 and no. records
	// console.log(ecdsData[random])
	// log(JSON.stringify(ecdsData[random]), "success"); // log(data[0], "success");// example data
	// log(JSON.stringify(ecdsData[random], null, 4), "success"); // log(data[0], "success");// example data
	const randomRecord = "Random Record";
	console.group(randomRecord);
	log(ecdsData[random]);
	console.groupEnd(randomRecord);

	const missingCodes = "Missing Snomed Codes";
	console.group(missingCodes);
	missingSnomedCodes["diagnosis"] = diagnosis_set;
	missingSnomedCodes["complaint"] = complaint_set;
	missingSnomedCodes["attdSource"] = attdSource_set;
	missingSnomedCodes["dischDest"] = dischdest_set;
	missingSnomedCodes["dischStatus"] = dischstatus_set;
	missingSnomedCodes["dischFUP"] = dischfup_set;
	missingSnomedCodes["injDrug"] = injdrug_set;
	if (debug) {
		console.log(missingSnomedCodes); // snomed codes that have not been found
	}
	console.groupEnd(missingCodes);

	let paraCounter = document.getElementById("counter");
	paraCounter.innerText =
		"All records selected. Please click on the charts to apply filters.";

	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});

	// Start of ECDS Charts

	// Used to present total number of records and number of filtered records
	dc.dataCount("#counter")
		.crossfilter(cf)
		.groupAll(all)
		.formatNumber(formatNumber)
		.html({
			some:
				"<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records" +
				" | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>", // dc.renderAll
			all:
				"All records selected. Please click on the charts to apply filters."
		});
}

function timeCharts() {
	/* Time Related Charting */
	console.time("timeCharts");
	// Daily and Period Charts are closely linked

	var dimDaily = cf.dimension(function(d) {
			return +d.Arrival_Date_ms;
		}),
		groupDaily = dimDaily.group();

	// https://stackoverflow.com/questions/31808718/dc-js-barchart-first-and-last-bar-not-displaying-fully
	// check what the first set of square brackets are for
	let minDateTS = dimDaily.bottom(1)[0]["Arrival_Date_ms"],
		maxDateTS = dimDaily.top(1)[0]["Arrival_Date_ms"];

	let minDate = new Date(minDateTS),
		maxDate = new Date(maxDateTS);

	// minDate.setHours(minDate.getHours() - 1);
	// maxDate.setHours(maxDate.getHours() + 1);

	var dimPeriod = cf.dimension(function(d) {
			return d.Period;
		}),
		groupPeriod = dimPeriod.group();

	// chtDayofWeek = dc.pieChart("#day-of-week-chart"),

	seriesDaily = dc.lineChart("#daily-trend-chart");
	seriesPeriod = dc.barChart("#period-trend-chart"); // Used in seriesDaily

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
					day + ", " + formatDaily(d.key),
					bankHolidayMap.get(d.key),
					"Att'd: " + formatNumber(d.value)
				].join("\n");
			} else {
				return [
					day + ", " + formatDaily(d.key),
					"Att'd: " + formatNumber(d.value)
				].join("\n");
			}
		})
		.mouseZoomable(true) // use mouse scroll to zoom in and out
		.controlsUseVisibility(true)
		.turnOnControls(true)
		// colour testing
		// https://dc-js.github.io/dc.js/docs/html/dc.colorMixin.html
		// https://stackoverflow.com/questions/43056664/dc-js-scatter-chart-with-dot-color-based-on-counts
		.colorAccessor(function(d) {
			// log(d.x + '\n' + +formatWeekdayNo(d.x)); // + '\n' + test[+formatWeekdayNo(d.x)])
			// log(+formatWeekdayNo(d.x))
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
				.range(["#377eb8", "#e41a1c", "#ff8c00"])
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

	//   seriesDaily.render();

	// rotate x-axis 90 degrees - need to adjust x/y to align appropriately
	seriesDaily.on("renderlet.a", function(chart) {
		chart
			.selectAll("g.x text")
			.attr("dx", "-30")
			.attr("dy", "-5")
			.attr("transform", "rotate(-90)");
	});

	// https://stackoverflow.com/questions/51610885/how-to-change-date-format-value-in-filter-text-dc-js
	seriesDaily.filterPrinter(function(filters) {
		const dateStart = new Date(dc.utils.printSingleValue(filters[0][0]));
		const dateEnd = d3.timeDay.offset(
			new Date(dc.utils.printSingleValue(filters[0][1])),
			-1
		);
		return formatDaily(dateStart) + " to " + formatDaily(dateEnd);
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
			return [d.key, formatNumber(d.value)].join(": ");
		})
		//.mouseZoomable(false) // use mouse scroll to zoom in and out
		.controlsUseVisibility(true)
		.turnOnControls(true)
		.xAxisPadding(10);

	// http://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html
	seriesPeriod
		.xAxis()
		.tickFormat(function(d) {
			// log(d);
			return formatPeriod(new Date(d));
		})
		.ticks(d3.timeMonth.every(1));

	// rotate x-axis 90 degrees - need to adjust x/y to align appropriately
	seriesPeriod.on("renderlet.a", function(chart) {
		chart
			.selectAll("g.x text")
			.attr("dx", "-22")
			.attr("dy", "5")
			.attr("transform", "rotate(-90)");
	});

	// https://stackoverflow.com/questions/51610885/how-to-change-date-format-value-in-filter-text-dc-js
	// might be able to tidy this up - just using filter and formatting it...
	seriesPeriod.filterPrinter(function(filters) {
		const dateStart = new Date(dc.utils.printSingleValue(filters[0][0]));
		const dateEnd = d3.timeDay.offset(
			new Date(dc.utils.printSingleValue(filters[0][1])),
			-1
		);
		return formatDaily(dateStart) + " to " + formatDaily(dateEnd);
	});

	//   seriesPeriod.render();

	// Heatmap
	const dimTimeofDay = cf.dimension(function(d) {
		return [d.Hour, d.WeekdayNo];
	});
	// declared in global scope
	groupTimeofDay = dimTimeofDay.group();

	// For some reason,had to swap order of dimTimeofDay ([hour, day] rather than [day, hour])
	// Without this, clicking on either axis filtered the other axis

	heatmapTimeDay = dc.heatMap("#heatmapTimeDay");

	heatmapTimeDay
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightShort * 0.75)
		.dimension(dimTimeofDay)
		.group(groupTimeofDay)
		.keyAccessor(function(d) {
			return d.key[0];
		}) // columns, hours
		.valueAccessor(function(d) {
			return d.key[1];
		}) // rows, days
		.colorAccessor(function(d) {
			return d.value;
		})
		.colors(d3.scaleSequential(d3.interpolateOrRd)) // https://github.com/d3/d3-scale-chromatic
		.calculateColorDomain()
		// the preRedraw below is used to recalculate colours when filters are applied
		// if the colours have absolute meaning then remove this
		// https://stackoverflow.com/questions/36038808/dc-js-heatmap-colour-range-not-getting-updated-after-filter-applied
		.on("preRedraw", function() {
			heatmapTimeDay.calculateColorDomain();
		})
		.title(function(d) {
			const now = new Date(1900, 0, 1, d.key[0]);
			return [
				"Day: " + arrWeekDays[d.key[1]],
				"Hour: " + formatHour12(now),
				"Att'd: " + formatNumber(d.value)
			].join("\n");
		})
		// Days of Week
		.rowsLabel(function(d) {
			return arrWeekDays[d];
		})
		.rowOrdering(d3.descending)
		// Time, 24 Hour Clock
		.colsLabel(function(d) {
			let pm = d > 12;
			if (d % 3 === 0) {
				return String(d > 12 ? d - 12 : d) + (pm ? " PM" : " AM");
			} else {
				return d > 12 ? d - 12 : d;
			}
		})
		.colOrdering(d3.ascending)
		.xBorderRadius(1) // 6.75 is the default
		.yBorderRadius(1)
		.controlsUseVisibility(true)
		.turnOnControls(true);
	// .render();
	// legend: https://github.com/dc-js/dc.js/issues/964
	//.legend(dc.legend()) // can't get this to appear

	// https://dc-js.github.io/dc.js/docs/html/dc.baseMixin.html
	heatmapTimeDay.on("renderlet.b", function() {
		heatKey();
	});

	// Testing - heatMap Key
	// https://stackoverflow.com/questions/31441536/is-there-a-way-to-make-a-key-or-legend-for-a-heat-map-with-dc-js
	// console.log(groupTimeofDay.all())

	// https://github.com/crossfilter/crossfilter/wiki/API-Reference#group_top
	// console.log(groupTimeofDay.top(1)); // returns an array containing the object [{key: [hour, day], value: x}], in this case, highest value (top(1))

	// heatKey(10); // initial heatmap scale

	// heatmap Key - Testing
	// https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3
	// https://bl.ocks.org/caravinden/eb0e5a2b38c8815919290fa838c6b63b
	// https://codepen.io/greaney/pen/xLGdBq

	// create a simple horizontal bar, colour will be a given
	// only x-axis needs to change

	// https://stackoverflow.com/questions/31441536/is-there-a-way-to-make-a-key-or-legend-for-a-heat-map-with-dc-js
	// https://stackoverflow.com/questions/49739119/legend-with-smooth-gradient-and-corresponding-labels
	// https://bl.ocks.org/d3indepth/de07fcf34538cd6f8459e17038563ed3

	// Testing to move x-axis to the top
	// https://github.com/dc-js/dc.js/issues/1208

	// heatmapTimeDay
	// .xAxis(d3.axisTop());
	// end of testing
	// rotate x-axis 90 degrees - need to adjust x/y to align appropriately

	// padding is added to top and bottom (for y-axis, left and right for x)

	const dimRefSource = cf.dimension(function(d) {
			return d.attdSource;
		}),
		groupRefSource = dimRefSource.group();

	chtRefSource = dc.sunburstChart("#refSource-chart");

	chtRefSource
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(100)
		.dimension(dimRefSource)
		.group(groupRefSource)
		.title(function(d) {
			return [
				map_attdSource_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.label(function(d) {
			return map_attdSource_groups.get(+d.path.join(""))[0];
		})
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_attdSource_groups.get(d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	const dimWeekdayNo = cf.dimension(function(d) {
		return d.WeekdayNo;
	});
	// const groupWeekday = dimWeekday.group();
	// const groupWeekdayNo = dimWeekdayNo.group(); // dimension on day of week
	const groupWeekdayAvg = dimWeekdayNo.group().reduce(
		function(p, v) {
			// reduceAdd
			const day = v.Arrival_Date_ms; // .getTime()
			p.map.set(day, p.map.has(day) ? p.map.get(day) + 1 : 1);
			//p.avg = average_map(p.map);
			return p;
		},
		function(p, v) {
			// reduceRemove
			const day = v.Arrival_Date_ms; // .getTime() // d3.timeDay(v[0])
			p.map.set(day, p.map.has(day) ? p.map.get(day) - 1 : 0);
			//p.avg = average_map(p.map);
			return p;
		},
		function() {
			// reduceInitial
			// need some way of counting dates in filter range
			return { map: d3.map() }; // , counter: 0 };
		}
	);

	chtDayofWeek = dc.rowChart("#day-of-week-chart");
	// Don't need this since in heatmap but for demo only using daily average
	chtDayofWeek
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.dimension(dimWeekdayNo) // dimWeekdayNo
		.group(groupWeekdayAvg) // groupWeekdayNo
		.valueAccessor(function(d) {
			// console.log(d)
			return average_map(d.value.map);
		}) // return kv.value.avg;
		.ordering(function(d) {
			return d.key;
		})
		.title(function(d) {
			return [
				arrWeekDays[d.key],
				formatNumber(average_map(d.value.map))
			].join(": ");
		})
		.label(function(d) {
			return [
				arrWeekDays[d.key],
				formatNumber(average_map(d.value.map))
			].join(": ");
		})
		.elasticX(true)
		.ordinalColors(d3.schemeSpectral[7])
		.turnOnControls(true)
		.controlsUseVisibility(true);

	/* not required since can click directly on heatmap labels to filter by day
  chtDayofWeek // only works on certain chart types eg. pie
    .legend(
        dc.htmlLegend()
            .container('#test-legend')
            .legendText(function (d, i) { return arrWeekDays[d.name]; })
            .horizontal(true)
            .highlightSelected(true)
    )
    ;
  */

	// need to format the filterPrinter for the day chart {probably won't need but for testing...}
	chtDayofWeek.filterPrinter(function(filters) {
		return filters
			.sort()
			.map(function(f) {
				return arrWeekDays[f];
			})
			.join(", ");
	});

	document.getElementById("bl-sectime").style.display = "none";
	document.getElementById("sectime").style.visibility = "visible";

	console.timeEnd("timeCharts");
}

function diagnosisCharts() {
	console.time("chartGroup2");

	// Diagnosis Charts
	// https://dc-js.github.io/dc.js/examples/sunburst.html
	// https://dc-js.github.io/dc.js/docs/html/dc.sunburstChart.html

	const dimDiagMain = cf.dimension(function(d) {
			return d.DiagnosisMainGroup;
		}),
		groupDiagMain = dimDiagMain.group();

	// Diagnosis Charts
	chtDiagMain = dc.rowChart("#diagMain-chart");

	chtDiagMain
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		// .margins({ top: 10, right: 50, bottom: 30, left: 40 })
		.dimension(dimDiagMain)
		.group(groupDiagMain)
		//.colors(d3.scaleOrdinal(d3SchemeCategory20b))
		.ordering(function(d) {
			return -d.value;
		}) // sort descending
		.label(function(d) {
			return [
				map_diagnosis_groups.get(+d.key)[0],
				formatNumber(d.value)
			].join(": ");
		})
		.title(function(d) {
			return [
				map_diagnosis_groups.get(+d.key)[0],
				formatNumber(d.value)
			].join(": ");
		})
		.elasticX(true)
		.colorAccessor(function(d) {
			return +d.key;
		})
		.colors(function(d) {
			if (d !== undefined) {
				return map_diagnosis_groups.get(+d)[1];
				// return mapColours.get(d);
			}
		})
		.turnOnControls()
		.controlsUseVisibility(true);
	// .render();

	const dimDiagnoses = cf.dimension(function(d) {
			return d.Diagnoses;
		}),
		groupDiagnoses = dimDiagnoses.group();

	chtDiagnoses = dc.sunburstChart("#diagnosis-chart-wide");

	chtDiagnoses
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(40)
		.dimension(dimDiagnoses)
		.group(groupDiagnoses)
		// https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
		// .ordering(function(d) {
		//   return -d.value;
		// })
		.title(function(d) {
			// d.path gives the parent keys too as an array, log(d.path[0])
			// log(+d.path.join(''))
			// log(d.path.join('')) // convert array, [11, 12, 13] to string (struggle to retrieve key from map when an array)
			return [
				map_diagnosis_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.emptyTitle("test")
		.label(function(d) {
			return [
				map_diagnosis_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		// .legend(dc.legend())
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_diagnosis_groups.get(+d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	chtAcuity = dc.pieChart("#acuity-chart");

	const dimAcuity = cf.dimension(function(d) {
			return d.acuity;
		}),
		groupAcuity = dimAcuity.group();

	chtAcuity
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.slicesCap(12) // one for each month - can show top X, rest will be grouped as other
		.innerRadius(70)
		.dimension(dimAcuity)
		.group(groupAcuity)
		.ordering(function(d) {
			return acuityRefObj[d.key];
		})
		.label(function(d) {
			return acuityRefObj[d.key];
		})
		.title(function(d) {
			return [acuityRefObj[d.key], formatNumber(d.value)].join(": ");
		})
		// .ordinalColors(d3.schemeSpectral[6])
		.ordinalColors([
			colourUnknown,
			"#fc8d59",
			"#fee08b",
			"#e6f598",
			"#99d594",
			"#3288bd"
		])
		.drawPaths(false)
		.turnOnControls(true)
		.controlsUseVisibility(true);

	chtComplaint = dc.sunburstChart("#complaint-chart");

	const dimComplaint = cf.dimension(function(d) {
			return d.complaint;
		}),
		groupComplaint = dimComplaint.group();

	chtComplaint
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(100)
		.dimension(dimComplaint)
		.group(groupComplaint)
		// https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
		//.ordering(function (d) { return d.value; })
		// .legend(dc.legend())
		.title(function(d) {
			// console.log(+chtDr.path.join(''));
			return [
				map_complaint_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.label(function(d) {
			return map_complaint_groups.get(+d.path.join(""))[0];
		})
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_complaint_groups.get(+d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	chtDrugAlcohol = dc.sunburstChart("#drugalcohol-chart");

	const dimDrugAlcohol = cf.dimension(function(d) {
			return d.injdrug;
		}),
		groupDrugAlcohol = dimDrugAlcohol.group();

	chtDrugAlcohol
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(100)
		.dimension(dimDrugAlcohol)
		.group(groupDrugAlcohol)
		// https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
		//.ordering(function (d) { return d.value; })
		// .legend(dc.legend())
		.title(function(d) {
			return [
				map_injdrug_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.label(function(d) {
			return map_injdrug_groups.get(+d.path.join(""))[0];
		})
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_injdrug_groups.get(+d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	document.getElementById("bl-secdiag").style.display = "none";
	document.getElementById("secdiag").style.visibility = "visible";

	console.timeEnd("chartGroup2");
}

function otherDetails() {
	console.time("Other Charts");

	dropGPPractice = dc.selectMenu("#gppractice-drop");

	const dimGPPractice = cf.dimension(function(d) {
			return d.practice;
		}),
		groupGPPractice = dimGPPractice.group();

	dropGPPractice
		.useViewBoxResizing(true)
		.width(chtWidthWide)
		.height(chtHeightStd)
		.dimension(dimGPPractice)
		.group(groupGPPractice) //dimGPPractice.group()
		.multiple(false)
		// .numberVisible(18) // number of rows when multiple set to true
		.turnOnControls()
		.controlsUseVisibility(true)
		.promptText("Select All Practices")
		.order(function(a, b) {
			return b.value > a.value ? 1 : a.value > b.value ? -1 : 0;
		})
		.title(function(d) {
			if (+d.key !== 0) {
				const pCode = practiceArr[d.key - 1],
					pDetails = practiceObj[pCode];

				return [
					pCode,
					pDetails[1],
					pDetails[2],
					formatNumber(d.value)
				].join(": ");
			} else {
				return "Other: " + formatNumber(d.value);
			}
		});

	chtGPPractice = dc.bubbleChart("#cht_PracticeBubble");

	/*
  https://dc-js.github.io/dc.js/docs/html/dc.bubbleMixin.html
  https://dc-js.github.io/dc.js/docs/html/dc.bubbleChart.html

  Domains (y-axis and colour) are hard coded - how to determine max, pluck values?
  After applying a filter, why do some bubbles become negative - additional function required?
  colours need work
  
  */

	chtGPPractice
		.width(chtWidthWide)
		.height(chtHeightStd)
		.margins({
			top: 40,
			right: 0,
			bottom: 2, // hides x-axis labels
			left: 40
		})
		.transitionDuration(500)
		.dimension(dimGPPractice)
		.group(groupGPPractice)
		// .keyAccessor(function(d) {
		//   if (d.key === 0) {
		//     return 'Other'
		//   } else {
		//   return practiceArr[d.key - 1]; // x-axis, label
		//   // return practicePopn.get(practiceArr[d.key - 1]) // x-axis, population
		//   }
		// })
		// X-Axis
		.x(
			d3
				.scaleBand()
				.range([0, chtWidthWide])
				.round(true)
				.padding(5000) // no effect, how to space circles out?
		)
		//.x(d3.scaleLinear().domain([minPopn, maxPopn * 1.1]))
		.xUnits(dc.units.ordinal)
		.xAxisPadding(3)
		.elasticX(true)
		// Y-Axis
		.valueAccessor(function(d) {
			return d.value; // y-axis, attendances
		})
		.y(d3.scaleLinear().domain([0, 20000]))
		.yAxisPadding(3000)
		.elasticY(true)
		// All things radius
		.radiusValueAccessor(function(d) {
			return practicePopn.get(practiceArr[d.key - 1]); // radius size
		})
		.maxBubbleRelativeSize(0.06) // Get or set the maximum relative size of a bubble to the length of x axis. Default is 0.3
		.minRadius(1) // This will be used to initialize the radius scale's range
		.minRadiusWithLabel(10) // If a bubble's radius is less than this value then no label will be rendered.
		.r(d3.scaleSqrt())
		.elasticRadius(true)
		.sortBubbleSize(true)
		// Colours
		.colors(d3.scaleSequential(d3.interpolateRainbow))
		.colorDomain([0, 20000]) //d3.extent(data, function(d) { return d.value; })
		.colorAccessor(function(d) {
			return d.value;
		})
		.title(function(d) {
			if (d.key !== 0) {
				const pCode = practiceArr[d.key - 1],
					pDetails = practiceObj[pCode],
					pop = practicePopn.get(pCode);

				return [
					pCode + ": " + pDetails[1],
					"Locality: " + pDetails[2],
					"Attd: " + formatNumber(d.value),
					"Popn: " + formatNumber(pop)
				].join("\n");
			} else {
				return "Other: " + formatNumber(d.value);
			}
		})
		//.renderLabel(true)
		.label(function(d) {
			if (+d.key !== 0) {
				const pCode = practiceArr[d.key - 1];
				return pCode;
			} else {
				return "Other ";
			}
		});

	// Patient Characteristics

	const dimAgeBand = cf.dimension(function(d) {
			return d.ageBand;
		}),
		groupAgeBand = dimAgeBand.group();

	chtAgeBand = dc.rowChart("#ageband-chart");

	chtAgeBand
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightTall)
		// .margins({ top: 10, right: 50, bottom: 30, left: 40 })
		.dimension(dimAgeBand)
		.group(groupAgeBand)
		.ordering(function(d) {
			return -d.key; // arrAgeBand.length - arrAgeBand.indexOf(d.key)
		}) // how to sort this?
		.label(function(d) {
			// const ageBand = [pad(d.key * 5, 2), pad((d.key * 5) + 4, 2)].join("-"); // 85-89 should be 85+
			// log([ageBand, formatNumber(+d.value)].join(": "));
			return [arrAgeBand[d.key], formatNumber(+d.value)].join(": ");
		})
		.title(function(d) {
			return [arrAgeBand[d.key], formatNumber(+d.value)].join(": ");
		})
		.elasticX(true)
		// .colorAccessor(function(d, i){return d.value;})
		.ordinalColors(d3SchemeCategory20b)
		.turnOnControls(true)
		.controlsUseVisibility(true);

	const dimLSOA = cf.dimension(function(d) {
			return d.lsoa;
		}),
		groupLSOA = dimLSOA.group();

	mapLSOA = dc_leaflet.choroplethChart("#map-lsoa");

	// https://github.com/dc-js/dc.leaflet.js
	// note issue with pop ups described here:
	//     https://github.com/dc-js/dc.leaflet.js/issues/22
	// http://bl.ocks.org/KatiRG/cccd23dd7a830da0de5c
	// https://leafletjs.com/examples/choropleth/

	// Dynamic Colour Domain
	// https://groups.google.com/forum/#!topic/dc-js-user-group/6_EzrHSRQ30

	mapLSOA.on("preRender", function(chart) {
		chart.colorDomain(
			d3.extent(chart.group().all(), chart.valueAccessor())
		);
	});
	mapLSOA.on("preRedraw", function(chart) {
		chart.colorDomain(
			d3.extent(chart.group().all(), chart.valueAccessor())
		);
	});

	// https://github.com/yurukov/dc.leaflet.js/blob/master/README.md
	mapLSOA
		.useViewBoxResizing(true)
		.width(600) // When you pass null when calling .width() and .height(), it will use width and height of the anchor element
		.height(570)
		.dimension(dimLSOA)
		.group(groupLSOA)
		.geojson(refGeogLSOAs)
		// .colorCalculator(function (d) { return d ? mapLSOA.colors()(d) : '#ccc'; })
		// https://github.com/d3/d3-scale-chromatic/blob/master/README.md
		.colors(d3.scaleQuantize().range(d3.schemeYlOrRd[7])) // d3.schemeBlues[7]
		.colorDomain([
			d3.min(groupLSOA.all(), dc.pluck("value")),
			d3.max(groupLSOA.all(), dc.pluck("value"))
		])
		.colorAccessor(function(d) {
			return d.value;
		})
		// .map() //not sure what this does..., get map object?
		.mapOptions(
			// https://leafletjs.com/reference-1.3.4.html#map-option
			{
				// https://www.openstreetmap.org/#map=9/53.9684/-1.0827
				center: [53.96838, -1.08269], // centre on York Hospital
				zoom: 9,
				minZoom: 6, // how far out eg. 0 = whole world
				maxZoom: 18, // how far in, eg. to the detail (max = 18)
				// https://leafletjs.com/reference-1.3.4.html#latlngbounds
				maxBounds: [
					[50.0, 1.6232], //south west
					[59.79, -10.239] //north east
				]
			}
		)
		// .title(function(d) {
		//   return ["lsoa: " + d.key,
		//           "Value: " + formatNumber(d.value)
		// ].join("\n");
		// })
		.featureKeyAccessor(function(feature) {
			return feature.properties.lsoa11cd;
		})
		.featureOptions({
			// formatting of feature layer
			weight: 1, // stroke width
			opacity: 1, // stroke opacity
			color: "black", // stroke colour
			// dashArray: "3", // stroke dash pattern
			fillOpacity: 0.5
		})
		// Issue with popups described here: https://github.com/dc-js/dc.js/issues/608
		// With brushOn set to false, pop up appears on click but filter will not apply
		// With brushOn set to true (default), pop up will not appear but filter works
		.brushOn(true)
		.renderPopup(true)
		.popup(function(d, feature) {
			return feature.properties.lsoa11cd + ": " + d.value;
		})
		.legend(dc_leaflet.legend().position("bottomright"))
		.turnOnControls()
		.controlsUseVisibility(true);

	// should be covered by streamed option...
	cBoxEDFD = dc.cboxMenu("#EDFD-cbox");

	const dimEDFD = cf.dimension(function(d) {
			return d.commSerial;
		}),
		groupEDFD = dimEDFD.group(); // shouldn't be needed with below

	cBoxEDFD
		.useViewBoxResizing(true)
		.dimension(dimEDFD)
		.group(groupEDFD)
		.multiple(true)
		//.numberVisible(3)
		.promptText("Select All")
		.order(function(a, b) {
			return b.value > a.value ? 1 : a.value > b.value ? -1 : 0;
		})
		.title(function(d) {
			if (d.key === 0) {
				return ["Not Streamed: ", formatNumber(d.value)].join("");
			} else {
				return ["EDFD: ", formatNumber(d.value)].join("");
			}
		})
		.turnOnControls()
		.controlsUseVisibility(true)
		.render();

	document.getElementById("bl-secpatient").style.display = "none";
	document.getElementById("secpatient").style.visibility = "visible";

	console.timeEnd("Other Charts");
}

function dischargeCharts() {
	console.time("chartDischarge");

	chtDischDest = dc.sunburstChart("#dischDest-chart");

	const dimDischDest = cf.dimension(function(d) {
			return d.dischDest;
		}),
		groupDischDest = dimDischDest.group();

	chtDischDest
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(100)
		.dimension(dimDischDest)
		.group(groupDischDest)
		// https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
		//.ordering(function (d) { return d.value; })
		// .legend(dc.legend())
		.title(function(d) {
			return [
				map_dischdest_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.label(function(d) {
			return map_dischdest_groups.get(+d.path.join(""))[0];
		})
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_dischdest_groups.get(+d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	chtDischStatus = dc.sunburstChart("#dischStatus-chart");

	const dimDischStatus = cf.dimension(function(d) {
			return d.dischStatus;
		}),
		groupDischStatus = dimDischStatus.group();

	chtDischStatus
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(100)
		.dimension(dimDischStatus)
		.group(groupDischStatus)
		// https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
		//.ordering(function (d) { return d.value; })
		// .legend(dc.legend())
		.title(function(d) {
			return [
				map_dischstatus_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.label(function(d) {
			return map_dischstatus_groups.get(+d.path.join(""))[0];
		})
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_dischstatus_groups.get(+d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	chtDischFUP = dc.sunburstChart("#dischFUP-chart");

	const dimDischFUP = cf.dimension(function(d) {
			return d.dischFUP;
		}),
		groupDischFUP = dimDischFUP.group();

	chtDischFUP
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.innerRadius(100)
		.dimension(dimDischFUP)
		.group(groupDischFUP)
		// https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
		//.ordering(function (d) { return d.value; })
		// .legend(dc.legend())
		.title(function(d) {
			return [
				map_dischfup_groups.get(+d.path.join(""))[0],
				formatNumber(d.value)
			].join(": ");
		})
		.label(function(d) {
			return map_dischfup_groups.get(+d.path.join(""))[0];
		})
		.colorAccessor(function(d) {
			return +d.path.join("");
		})
		.colors(function(d) {
			return map_dischfup_groups.get(+d)[1];
		})
		.turnOnControls()
		.controlsUseVisibility(true);

	chtDuration = dc.lineChart("#duration-chart");

	const dimDuration = cf.dimension(function(d) {
			return d.duration; // cuts off at max of 8 hours (done in return object)
		}),
		groupDuration = dimDuration.group();

	// consider turning this into a line chart (for speed)
	chtDuration
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightShort)
		.margins({
			top: 10,
			right: 20,
			bottom: 40,
			left: 40
		})
		.dimension(dimDuration)
		.group(groupDuration)
		.x(
			d3.scaleTime().domain([0, 1000 * 60 * 60 * 8])
			// .range([new Date(0), new Date(0).setHours(4, 15)]) // hours and minutes
		)
		.xUnits(d3.timeMinutes)
		.round(d3.timeMinute.every(Math.max(durationBand, 5))) // chart shows each minute but brush will snap to nearest 5 mins
		.curve(d3.curveLinear)
		.renderArea(true)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.renderLabel(false)
		.brushOn(true)
		.xyTipsOn(true)
		//.renderDataPoints({fillOpacity: 0.8, strokeOpacity: 0.0, radius: 0.25})
		.elasticX(false) // have to turn this off to set domain
		.elasticY(true)
		.mouseZoomable(false)
		.title(function(d) {
			return [d.key, formatNumber(d.value)].join(": ");
		})
		.controlsUseVisibility(true)
		.turnOnControls(true)
		.xAxisPadding(0);

	chtDuration
		.xAxis()
		.tickFormat(function(d) {
			let date = new Date(d); // jsDayZero.setMilliseconds(d)
			return formatDuration(date);
		})
		.ticks(d3.timeMinute.every(30));

	chtDuration.filterPrinter(function(filters) {
		return (
			formatDuration(filters[0][0]) +
			" to " +
			formatDuration(filters[0][1])
		);
	});

	// rotate x-axis 90 degrees - need to adjust x/y to align appropriately
	chtDuration.on("renderlet.a", function(chart) {
		chart
			.selectAll("g.x text")
			.attr("dx", "-20")
			.attr("dy", "-5")
			.attr("transform", "rotate(-90)");
	});

	document.getElementById("bl-secdisch").style.display = "none";
	document.getElementById("secdisch").style.visibility = "visible";

	console.timeEnd("chartDischarge");
}

function unusedCharts() {
	console.time("chartExperimental");

	const dimWeekdayNo = cf.dimension(function(d) {
		return d.WeekdayNo;
	});
	// const groupWeekday = dimWeekday.group();
	// const groupWeekdayNo = dimWeekdayNo.group(); // dimension on day of week
	const groupWeekdayAvg = dimWeekdayNo.group().reduce(
		function(p, v) {
			// reduceAdd
			const day = v.Arrival_Date_ms; // .getTime()
			p.map.set(day, p.map.has(day) ? p.map.get(day) + 1 : 1);
			//p.avg = average_map(p.map);
			return p;
		},
		function(p, v) {
			// reduceRemove
			const day = v.Arrival_Date_ms; // .getTime() // d3.timeDay(v[0])
			p.map.set(day, p.map.has(day) ? p.map.get(day) - 1 : 0);
			//p.avg = average_map(p.map);
			return p;
		},
		function() {
			// reduceInitial
			// need some way of counting dates in filter range
			return { map: d3.map() }; // , counter: 0 };
		}
	);

	chtDayofWeek = dc.pieChart("#day-of-week-chart");
	// Don't need this since in heatmap but for demo only using daily average
	chtDayofWeek
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.dimension(dimWeekdayNo) // dimWeekdayNo
		.group(groupWeekdayAvg) // groupWeekdayNo
		.valueAccessor(function(d) {
			// console.log(d)
			return average_map(d.value.map);
		}) // return kv.value.avg;
		.slicesCap(12) // one for each month - can show top X, rest will be grouped as other
		.innerRadius(70)
		.ordering(function(d) {
			return d.key;
		})
		.title(function(d) {
			return [
				arrWeekDays[d.key],
				formatNumber(average_map(d.value.map))
			].join(": ");
		})
		.label(function(d) {
			return [
				arrWeekDays[d.key],
				formatNumber(average_map(d.value.map))
			].join(": ");
		})
		.drawPaths(false)
		// .colorAccessor(function(d, i){return d.value;})
		// .ordinalColors(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628'])
		.ordinalColors(d3.schemeSpectral[7])
		// .colors()
		// .colorDomain()
		.turnOnControls(true)
		.controlsUseVisibility(true);

	/* not required since can click directly on heatmap labels to filter by day
chtDayofWeek // only works on certain chart types eg. pie
  .legend(
      dc.htmlLegend()
          .container('#test-legend')
          .legendText(function (d, i) { return arrWeekDays[d.name]; })
          .horizontal(true)
          .highlightSelected(true)
  )
  ;
*/

	// need to format the filterPrinter for the day chart {probably won't need but for testing...}
	chtDayofWeek.filterPrinter(function(filters) {
		return filters
			.sort()
			.map(function(f) {
				return arrWeekDays[f];
			})
			.join(", ");
	});

	// Box Plot showing duration by day of week
	boxPlotDuration = dc.boxPlot("#box-test");

	// The array here needs to be an int rather than a time
	let groupArrayDuration = dimWeekdayNo.group().reduce(
		function(p, v) {
			p.push(v.duration);
			return p;
		},
		function(p, v) {
			p.splice(p.indexOf(v.duration), 1);
			return p;
		},
		function() {
			return [];
		}
	);

	// .yAxisPadding(10) // // padding is added to top and bottom (for y-axis, left and right for x)
	// the below removes the impact of the paddings at the bottom
	// .yAxisMin = function () { return 0; }
	// temporary to consider
	boxPlotDuration
		.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightShort)
		.margins({
			top: 0,
			right: 20,
			bottom: 30,
			left: 40
		})
		.dimension(dimWeekdayNo)
		.group(groupArrayDuration) // pass in an array here
		// .renderDataPoints(false)
		.showOutliers(false) //, if true, adds around a second to processing time
		.yAxisLabel("Duration (hrs:mins)")
		// .xAxisLabel("Weekday")
		// the below is to format the displayed values
		.tickFormat(function(d) {
			const date = new Date(d);
			return formatDuration(date);
		})
		.elasticX(true)
		.elasticY(true)
		//.yAxisMax = function() {
		//	return 1000 * 60 * 60 * 8;
		//}
		.turnOnControls()
		.controlsUseVisibility(true);

	// https://github.com/d3/d3-axis

	boxPlotDuration.xAxis().tickFormat(function(d) {
		return arrWeekDays[d];
	});

	const arrTicks = [],
		ticks = 48,
		int = 1000 * 60 * 30; // tick marks every 30 mins
	for (let i = 0; i <= ticks; i++) {
		arrTicks.push(i * int);
	}

	boxPlotDuration
		.yAxis()
		.tickFormat(function(d) {
			let date = new Date(d);
			return formatDuration(date);
		})
		// rather than arrTicks, can we use time.every 15 mins? didn't previously work but does mins have to be 1000 * 60 * eg. 30mins
		// .ticks(d3.timeMinute.every(30)) // can't get this to work
		// .tickArguments([d3.timeMinute.every(30)])
		.tickValues(arrTicks);

	boxPlotDuration.render();

	boxPlotDuration.filterPrinter(function(filters) {
		return filters
			.sort()
			.map(function(f) {
				return arrWeekDays[f];
			})
			.join(", ");
	});

	/*
    https://dc-js.github.io/dc.js/docs/html/dc.geoChoroplethChart.html
    https://steemit.com/utopian-io/@faad/tutorial-11-dive-into-dc-js-a-javascript-library-geo-choropleth-chart
    http://dc-js.github.io/dc.js/vc/index.html
    https://dc-js.github.io/dc.js/docs/html/dc.geoChoroplethChart.html
    */
	simpleMap = dc.geoChoroplethChart("#map-simple");

	// nb. this dimLSOA is declared in another function
	const dimLSOA = cf.dimension(function(d) {
			return d.lsoa;
		}),
		groupLSOA = dimLSOA.group();

	const centre = d3.geoCentroid(refGeogLSOAs),
		projection1 = d3
			.geoMercator()
			.center(centre)
			.scale(14500)
			.translate([80, 200]),
		/* Trying to understand projections
   https://bost.ocks.org/mike/map/
   http://projectionwizard.org/
   Projection Explorer:
       https://bl.ocks.org/d3indepth/f7ece0ab9a3df06a8cecd2c0e33e54ef
     https://github.com/d3/d3-geo/blob/master/README.md#
     https://github.com/d3/d3-geo-projection
   */

		projection2 = d3
			.geoAlbers()
			.center(centre)
			.rotate([2.5, 0])
			.parallels([50, 60])
			.translate([-550, 195])
			.scale(29000);

	simpleMap
		//.useViewBoxResizing(true)
		.width(chtWidthStd)
		.height(chtHeightStd)
		.dimension(dimLSOA)
		.group(groupLSOA)
		.projection(projection2)
		.overlayGeoJson(refGeogLSOAs.features, "lsoa", function(d) {
			return d.properties.lsoa11cd;
		})
		// .colors(d3.scaleQuantize().range(d3.schemeYlOrRd[7])) // d3.schemeBlues[7]
		.colors(
			d3
				.scaleQuantize()
				.range([
					"#E2F2FF",
					"#C4E4FF",
					"#9ED2FF",
					"#81C5FF",
					"#6BBAFF",
					"#51AEFF",
					"#36A2FF",
					"#1E96FF",
					"#0089FF",
					"#0061B5"
				])
		)
		.colorDomain([
			d3.min(groupLSOA.all(), dc.pluck("value")),
			d3.max(groupLSOA.all(), dc.pluck("value"))
		])
		.colorCalculator(function(d) {
			return d ? simpleMap.colors()(d) : "#ccc";
		})
		.valueAccessor(function(kv) {
			// log(kv);
			return kv.value;
		})
		.title(function(d) {
			return (
				"lsoa: " +
				d.key +
				"\nAttd: " +
				formatNumber(d.value ? d.value : 0)
			);
		});

	document.getElementById("bl-sectest").style.display = "none";
	document.getElementById("sectest").style.visibility = "visible";

	console.timeEnd("chartExperimental");
}

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

const heatmapLegend = d3
	.select("#legend")
	.append("svg")
	.attr("viewBox", "0 5 200 20") // height + margin.top + margin.bottom
	.attr("transform", "translate(" + 50 + "," + 5 + ")"); // (height / 2)

function heatKey(noCells) {
	//console.trace();
	//debugger;
	// https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi

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
	const label = "Heatmap Max and Min {key: [hour, day], value: x}";
	console.groupCollapsed(label);
	log(heatmapTDmax, "info"); // returns the object only {key: [hour, day], value: x}
	// log(heatmapTDmax.key); // to extract the key only, [hour, day]
	// log(heatmapTDmax.value); // to extract the value only, x

	// Using the below to return the last record
	let heatmapTDmin = heatmapGroup[groupTimeofDay.size() - 1]; // +Object.keys(heatmapGroup).length;
	log(heatmapTDmin, "info");
	console.groupEnd(label);

	let heatmapTDRange = heatmapTDmax.value - heatmapTDmin.value;
	// from a number between 0 and 1, returns a value between the min and max values
	const heatmapTDScale = d3.interpolateRound(
		heatmapTDmin.value,
		heatmapTDmax.value
	);

	if (noCells === undefined) {
		// log(heatmapTDRange)
		if (heatmapTDRange > 100) {
			noCells = 10;
		} else {
			noCells = 5;
		}
	}

	for (let i = 0; i < noCells; i++) {
		arrCells.push(i / (noCells - 1));
	}
	// log(arrCells);

	// update this to join transition (d3.v5 - see practice profile charts as example)
	// https://stackoverflow.com/questions/52337854/interactive-update-does-not-work-in-heatmap
	// https://observablehq.com/@d3/selection-join
	// heatmap Legend

	// d3 transition
	const t = d3
		.transition()
		.duration(500) // 750 too slow and results in incomplete transition
		.ease(d3.easeBounce);

	/*
https://bl.ocks.org/mbostock/3808234
https://stackoverflow.com/questions/24912274/d3-update-data-with-multiple-elements-in-a-group

*/

	// JOIN new data with old elements.
	var heatCellGroup = heatmapLegend
		.selectAll("g")
		.data(arrCells, (d, i) => i);

	// EXIT old elements not present in new data.
	heatCellGroup
		.exit()
		.transition(t)
		.attr("transform", "translate(0, 30)") // rect drop down
		.remove();

	// enter selection
	var heatCellGroup = heatCellGroup.enter().append("g");
	heatCellGroup.append("rect").attr("class", "heatCell");
	heatCellGroup.append("text").attr("class", "heatCellLabel");
	heatCellGroup.append("svg:title").attr("class", "heatCellHover"); //simple tooltip

	// update selection -- this will also contain the newly appended elements
	// don't appear to need this
	// heatCellGroup.select("rect")
	//   .attr("class", "heatCell");

	// ENTER new elements present in new data.
	heatCellGroup
		.enter()
		.append("rect")
		.attr("class", "heatCell");

	heatCellGroup
		.enter()
		.append("text")
		.attr("class", "heatCellLabel");

	heatCellGroup
		.enter()
		.append("svg:title")
		.attr("class", "heatCellHover");

	heatmapLegend
		.selectAll(".heatCell")
		.data(arrCells)
		// .attr("width", 9)
		// .attr("height", 0)
		// .attr('opacity', 0)
		.attr("y", 7)
		// for mouseover event
		.style("stroke-width", 0.5)
		.style("stroke-opacity", 0)
		.style("stroke", "black")
		.on("mouseover", function(d) {
			d3.select(this).style("stroke-opacity", 1);
		})
		.on("mouseout", function(d) {
			d3.select(this).style("stroke-opacity", 0);
		})
		.transition(t)
		.delay(function(d, i) {
			// a different delay for each rect
			return i * 50;
		})
		// .attr('opacity', 1)
		.attr("transform", function(d, i) {
			return "translate(" + i * 10 + ")";
		})
		.attr("width", 9)
		.attr("height", 9)
		.style("fill", function(d) {
			return sequentialScale(d);
		});

	heatmapLegend
		.selectAll(".heatCellLabel")
		.data(arrCells)
		.text(function(d) {
			return heatmapTDScale(d);
		})
		.attr("font-size", "0.2em")
		.attr("fill", "#999")
		.style("opacity", function(d, i) {
			if (i % 2 === 0 || i === noCells - 1) {
				return 1;
			} else {
				return 0.2;
			}
		})
		.attr("x", 0)
		.attr("text-anchor", "start")
		.attr("dx", 1)
		.attr("y", 0)
		.transition(t)
		.delay(function(d, i) {
			// a different delay for each label
			return i * 50;
		})
		.attr("x", function(d, i) {
			return i * 10;
		})
		.attr("y", 22);

	// Simple tooltip
	heatmapLegend
		.selectAll(".heatCellHover")
		.data(arrCells)
		.text(function(d) {
			return heatmapTDScale(d);
		});

	// Insert text into html
	document.getElementById("heatDayMax").textContent =
		arrWeekDays[heatmapTDmax.key[1]];
	document.getElementById("heatTimeMax").textContent = formatHour12(
		new Date(0).setHours(heatmapTDmax.key[0])
	);

	document.getElementById("heatDayMin").textContent =
		arrWeekDays[heatmapTDmin.key[1]];
	document.getElementById("heatTimeMin").textContent = formatHour12(
		//new Date(1900, 0, 1, heatmapTDmin.key[0], 0, 0, 0)
		new Date(0).setHours(heatmapTDmin.key[0])
	);
	//log('Why do i run twice?', "warning");
}

// will be use to create age band descriptions eg. 0 becomes 00-04
function pad(str, max) {
	str = str.toString();
	return str.length < max ? pad("0" + str, max) : str;
}
