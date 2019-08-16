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
	// chtComplaint = dc.sunburstChart("#complaint-chart"),
	// chtAcuity = dc.pieChart("#acuity-chart"),
	// // Patient Characteristic Charts
	chtAgeBand, // = dc.rowChart("#ageband-chart"),
	dropGPPractice, // = dc.selectMenu("#gppractice-drop"),
	// // Other
	chtRefSource, // = dc.sunburstChart("#refSource-chart"),
	// cBoxEDFD = dc.cboxMenu("#EDFD-cbox"), // How to build in streamed into disposal... the following should just be one
	// chtDischDest = dc.sunburstChart("#dischDest-chart"),
	// chtDischStatus = dc.sunburstChart("#dischStatus-chart"),
	// chtDischFUP = dc.sunburstChart("#dischFUP-chart"),
	// chtDrugAlcohol = dc.sunburstChart("#drugalcohol-chart"),
	// chtDuration = dc.lineChart("#duration-chart"),
	// boxPlotDuration = dc.boxPlot("#box-test"),
	mapLSOA, // = dc_leaflet.choroplethChart("#map-lsoa");
	simpleMap;
// Import Reference Tables and Data
// https://github.com/d3/d3-fetch/blob/master/README.md#dsv

const missingSnomedCodes = Object.create(null);

// Geography Tables
let refGeogLSOAsCentroids;

async function geogLSOACentroids() {
  refGeogLSOAsCentroids = await d3.json("Data/geo/03Q_lsoa_centroid.geojson");
}
geogLSOACentroids();


// The main data

async function ecdsCharts() {
	const ecdsData = await d3.csv(
		"Data/ecds/AE_RawData_snomed_incHead.csv",
		processRow // this function is applied to each row of the imported data
	);

	console.timeEnd("importTime");

	log(ecdsData.columns);

	cfOverview(ecdsData);
	geogCharts();

	// unusedCharts();
	/*
    Drop from csv:


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
		duration: Math.min(+d.Duration_ms, maxDuration), // Fix max duration at source
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
				: [0],
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

let centre, projection1, projection2, projection3, projection4;

function geogCharts() {
	console.time("Geog Charts");

	const dimLSOA = cf.dimension(function(d) {
			return d.lsoa;
		}),
		groupLSOA = dimLSOA.group();

	/*
    https://dc-js.github.io/dc.js/docs/html/dc.geoChoroplethChart.html
    https://steemit.com/utopian-io/@faad/tutorial-11-dive-into-dc-js-a-javascript-library-geo-choropleth-chart
    http://dc-js.github.io/dc.js/vc/index.html
    https://dc-js.github.io/dc.js/docs/html/dc.geoChoroplethChart.html
    */
	simpleMap = dc.geoChoroplethChart("#map-simple");

	centre = d3.geoCentroid(refGeogLSOAs);

	projection1 = d3
		.geoMercator()
		.center(centre)
		.scale(14500)
		.translate([80, 200]);

	/* Trying to understand projections
    https://bost.ocks.org/mike/map/
    http://projectionwizard.org/
    Projection Explorer:
        https://bl.ocks.org/d3indepth/f7ece0ab9a3df06a8cecd2c0e33e54ef
      https://github.com/d3/d3-geo/blob/master/README.md#
      https://github.com/d3/d3-geo-projection
    */

	projection2 = d3 // guess work
		.geoAlbers()
		.center(centre)
		.rotate([2.5, 0])
		.parallels([50, 60])
		.translate([-550, 195])
		.scale(29000);

	projection3 = d3 // this works
		.geoAlbers()
		.center(centre) // this is calculated from geojson
		.rotate([0, 0]) // supply these values to overwrite any defaults
		.translate([chtWidthStd / 2, chtHeightStd / 2])
		.scale(29000);
	// log("Default Albers Projection Scale: " + projection3.scale());

	/*
projection 4 is centred on York Trust
the centre of the ccg geog area is -1.0313272398263678, 54.03629165507173
*/

	projection4 = d3 // similar to projection3 but principal can be applied in general
		.geoAlbers()
		.center([0, centre[1]])
		.rotate([-centre[0], 0])
		//.parallels([55, 56])
		.translate([chtWidthStd / 2, chtHeightStd / 2])
		.scale(29000);

	simpleMap
		//.useViewBoxResizing(true)
		.width(chtWidthStd) // chtWidthStd
		.height(chtHeightStd) // chtHeightStd
		.dimension(dimLSOA)
		.group(groupLSOA)
		.projection(projection4)
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

	console.timeEnd("Geog Charts");
}

function unusedCharts() {
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
