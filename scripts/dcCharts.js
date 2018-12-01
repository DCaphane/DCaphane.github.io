"use strict";
// https://bl.ocks.org/ndaly500/ab1e8fbe59453ae7c43c2162388dd36d
// https://github.com/square/crossfilter/wiki/API-Reference
// https://stackoverflow.com/questions/44200020/how-to-load-a-csv-file-into-crossfilter-with-d3
// https://github.com/dc-js/dc.js/wiki/Optimization-and-Performance-Tuning

console.time("ProcessTime");

// Settings
// https://dc-js.github.io/dc.js/docs/html/dc.config.html#defaultColors__anchor
// colour options: https://github.com/d3/d3-scale-chromatic
// examples: d3.schemeCategory20c, d3.schemeSet1, d3.schemeBlues[9], d3.schemeBrBG[7]
dc.config.defaultColors(d3.schemeSet2);

// d3.schemeCategory20b has been removed from D3v5
const d3SchemeCategory20b = [
  "#393b79",
  "#5254a3",
  "#6b6ecf",
  "#9c9ede",
  "#637939",
  "#8ca252",
  "#b5cf6b",
  "#cedb9c",
  "#8c6d31",
  "#bd9e39",
  "#e7ba52",
  "#e7cb94",
  "#843c39",
  "#ad494a",
  "#d6616b",
  "#e7969c",
  "#7b4173",
  "#a55194",
  "#ce6dbd",
  "#de9ed6"
];

const colourUnknown = "#bbbbbb",
  colourOldCode = "#7b615c";

// Global Variables
const arrWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  arrMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  arrAgeBand = [
    "00-04",
    "05-09",
    "10-14",
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59",
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80-84",
    "85+"
  ],
  // sqlDayZero = new Date(1900, 0, 1), // months are 0 based, 0 = Jan
  jsDayZero = new Date(0),
  // Currently see time spent in A&E up to 24 hours - set anything above 8 hours to 8
  maxDuration = +d3.timeMinute.offset(jsDayZero, 60 * 8),
  // Most formatting declared in function but this is used outside? Could just write it twice!
  formatHour12 = d3.timeFormat("%I %p"); // %I hour (12-hour clock) as a decimal number [01,12], %p - either AM or PM

let cf, all, groupTimeofDay; // used for heat key calcs

// Charting - these need to be in global scope eg. for reset
const // Time Charts
  chtDayofWeek = dc.pieChart("#day-of-week-chart"),
  heatmapTimeDay = dc.heatMap("#heatmapTimeDay"),
  seriesDaily = dc.lineChart("#daily-trend-chart"),
  seriesPeriod = dc.barChart("#period-trend-chart"),
  // Diagnosis Charts
  chtDiagMain = dc.rowChart("#diagMain-chart"),
  chtDiagnoses = dc.sunburstChart("#diagnosis-chart-wide"),
  chtComplaint = dc.sunburstChart("#complaint-chart"),
  chtAcuity = dc.pieChart("#acuity-chart"),
  // Patient Characteristic Charts
  chtAgeBand = dc.rowChart("#ageband-chart"),
  dropGPPractice = dc.selectMenu("#gppractice-drop"),
  // Other
  chtRefSource = dc.sunburstChart("#refSource-chart"),
  cBoxEDFD = dc.cboxMenu("#EDFD-cbox"), // How to build in streamed into disposal... the following should just be one
  chtDischDest = dc.sunburstChart("#dischDest-chart"),
  chtDischStatus = dc.sunburstChart("#dischStatus-chart"),
  chtDischFUP = dc.sunburstChart("#dischFUP-chart"),
  chtDrugAlcohol = dc.sunburstChart("#drugalcohol-chart"),
  chtDuration = dc.barChart("#duration-chart"),
  boxPlotDuration = dc.boxPlot("#box-test");

// Import Reference Tables and Data
// https://github.com/d3/d3-fetch/blob/master/README.md#dsv
console.time("dataImport");

const missingSnomedCodes = Object.create(null);

let diagnosisRefObj = {}; // Object that will contain snomed code (string) as key and groups as values
const map_diagnosis_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]), // map for looking up group codes to descriptions (could be object)
  // tried using map to use array as key but this doesn't appear to work, dificult to .get values when key is an array...
  diagnosis_set = new Set(); // used to log any unmatched snomed codes that may need  eg. old codes that have since been dropped

Papa.parse("Data/ecds_ref_tables/ref_diagnosis.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    diagnosisRefObj = d.data.reduce(
      (obj, item) => (
        (obj[item.SNOMED_Code] = [item.Sort1, item.Sort2, item.Sort3]), obj
      ),
      {}
    );
    //test = Object.entries(d);
    /*
            Destructuring Assignment
            Unpack the original array of objects into objects with the SNOMED_Code as the key for lookup
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        */

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2, s3; // variables to contain Sort1, Sort2 and Sort 3 only from full table
      ({ s1, s2, s3 } = {
        s1: d.Sort1,
        s2: d.Sort2,
        s3: d.Sort3
      }); // unpack the selected variables

      // Create a map key with the Sort descriptions for chart lookups

      const strS2 = "" + s1 + s2,
        strS3 = "" + s1 + s2 + s3;

      if (!map_diagnosis_groups.has(s1)) {
        map_diagnosis_groups.set(s1, [d.ECDS_Group1, sunburstColours(s1)]);
      } // eg. 11 (int format rather than string)

      if (!map_diagnosis_groups.has(+strS2)) {
        map_diagnosis_groups.set(+strS2, [
          d.ECDS_Group2,
          sunburstColours(strS2)
        ]);
      } // eg. 1112

      if (!map_diagnosis_groups.has(+strS3)) {
        map_diagnosis_groups.set(+strS3, [
          d.ECDS_Group3,
          sunburstColours(strS3)
        ]);
      } // eg. 111213
    });
  }
});

let acuityRefObj = {};
const acuity_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_acuity.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    acuityRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = item.ECDS_Description), obj),
      {}
    );
    acuityRefObj[0] = "0 - Unknown";
  }
});

let attdSourceRefObj = {};
const map_attdSource_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  attdSource_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_attd_source.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    attdSourceRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_attdSource_groups.has(s1)) {
        map_attdSource_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_attdSource_groups.has(+strS2)) {
        map_attdSource_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let complaintRefObj = {};
const map_complaint_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  complaint_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_complaint.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    complaintRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_complaint_groups.has(s1)) {
        map_complaint_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_complaint_groups.has(+strS2)) {
        map_complaint_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let dischdestRefObj = {};
const map_dischdest_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  dischdest_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_discharge_destination.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    dischdestRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_dischdest_groups.has(s1)) {
        map_dischdest_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_dischdest_groups.has(+strS2)) {
        map_dischdest_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let dischfupRefObj = {};
const map_dischfup_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  dischfup_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_discharge_followup.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    dischfupRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );
    dischfupRefObj[3780001] = [91];

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_dischfup_groups.has(s1)) {
        map_dischfup_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_dischfup_groups.has(+strS2)) {
        map_dischfup_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let dischstatusRefObj = {};
const map_dischstatus_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  dischstatus_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_discharge_status.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    dischstatusRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );
    dischstatusRefObj[182992009] = [11];

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;
      // Create a map key with the Sort descriptions for chart lookups
      if (!map_dischstatus_groups.has(s1)) {
        map_dischstatus_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_dischstatus_groups.has(+strS2)) {
        map_dischstatus_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let injdrugRefObj = {};
const map_injdrug_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  injdrug_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds_ref_tables/ref_inj_drug.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    injdrugRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;
      // Create a map key with the Sort descriptions for chart lookups
      if (!map_injdrug_groups.has(s1)) {
        map_injdrug_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_injdrug_groups.has(+strS2)) {
        map_injdrug_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

// Practice Look Up
let practiceObj = {},
  practiceArr = [];

Papa.parse("Data/ref_gppractice.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    // https://stackoverflow.com/questions/19874555/how-do-i-convert-array-of-objects-into-one-object-in-javascript
    // https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7
    practiceObj = d.data.reduce(
      (obj, item) => (
        (obj[item.PracticeCode_Mapped] = [
          item.ID, // PapaParse auto set to int
          item.Practice_Name,
          item.Locality
        ]),
        obj
      ),
      {}
    );

    // Returns the practice codes as an array for subsequent lookup
    practiceArr = Object.keys(practiceObj);
  }
});

// Bank Holiday Testing
// https://medium.com/@nkhilv/how-to-use-the-javascript-fetch-api-to-get-uk-bank-holidays-step-by-step-dbb4357236ff

let bankHolidayMap = new Map();

fetch("https://www.gov.uk/bank-holidays.json")
  .then(response => response.json())
  .then(data => {
    // console.log(data)
    let england = data["england-and-wales"].events; // England bank holidays only

    england.forEach(d => {
      const [year, month, date] = d.date.split("-");
      const bankHol = new Date(year, month - 1, date);
      bankHolidayMap.set(+bankHol, d.title); // add bank holiday date to the map as an integer
    });
  });

// The main data
//d3.csv("Data/AE_RawData_snomed.csv").then(

Papa.parse("Data/AE_RawData_snomed.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    console.timeEnd("dataImport");
    // Formatting
    const parseDate = d3.utcParse("%Y-%m-%d %H:%M:%S.%L"), // import format, previously timeParse
      // https://github.com/d3/d3-time-format/blob/master/README.md#timeParse
      formatDaily = d3.timeFormat("%d-%b-%y"),
      formatPeriod = d3.timeFormat("%b-%y"),
      // formatMonth = d3.timeFormat('%b'), // %m - month as a decimal number [01,12]
      formatMonthNo = d3.timeFormat("%m"),
      // formatWeekday = d3.timeFormat('%a'),
      // %w - Sunday-based weekday as a decimal number [0,6]
      formatWeekdayNo = d3.timeFormat("%u"), // %u - Monday-based (ISO 8601) weekday as a decimal number [1,7]
      // consider week number for weekly trends?
      // formatHour24 = d3.timeFormat('%H'), // %H - hour (24-hour clock)
      // formatTime = d3.timeFormat("%H:%M"),
      formatNumber = d3.format(",d"), // for display purposes
      formatDuration = d3.utcFormat("%H:%M");
    // timeScaleDuration = d3
    // 	.scaleTime()
    // 	.domain([
    // 		sqlDayZero,
    // 		d3.timeDay.offset(sqlDayZero, 1)
    // 	]) // d3.timeDay.ceil(sqlDayZero)
    // 	.range([0, 60 * 24]);
    // timeScaleDuration.invert(200) ie. 200 minutes = 3hrs and 20 mins
    // Mon Jan 01 1900 03:20:00

    const chtWidthStd = 400,
      chtHeightStd = 400,
      chtWidthWide = 500,
      chtHeightTall = 700,
      chtHeightShort = 250;
    console.time("parseTime");

    d.data.forEach(function(d) {
      // Time formatting
      d.Arrival_DateTime = parseDate(d.Arrival_DateTime);
      // Subsequent Time Derived Fields
      d.Daily = +d3.timeDay(d.Arrival_DateTime); // + turns date into an integer (time in ms since 1970, jsDayZero)
      d.Period = +d3.timeMonth(d.Arrival_DateTime); // new Date(d.Arrival_DateTime.getFullYear(), d.Arrival_DateTime.getMonth(), 1);
      d.Month = +formatMonthNo(d.Arrival_DateTime) - 1;
      d.WeekdayNo = +formatWeekdayNo(d.Arrival_DateTime);
      d.Hour = +d.Arrival_DateTime.getHours(); // +formatHour12(d.Arrival_DateTime);
      // d.Arrival_DateTime = +d.Arrival_DateTime;
      d.Arrival_DateTime = null;

      d.AgeBand = arrAgeBand.indexOf(d.AgeBand);

      if (practiceObj[d.practice_code] !== undefined) {
        d.practiceID = +practiceObj[d.practice_code][0];
      } else {
        d.practiceID = 0;
      }
      // Diagnosis Analysis
      if (diagnosisRefObj[+d.snomed_diagnosis] !== undefined) {
        // ie. snomed code has been found...
        d.Diagnoses = diagnosisRefObj[+d.snomed_diagnosis];
        d.DiagnosisMainGroup = diagnosisRefObj[+d.snomed_diagnosis][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_diagnosis === 0) {
          // null diagnosis returned in original data
          d.Diagnoses = [0];
          d.DiagnosisMainGroup = 0;
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.Diagnoses = [999];
          d.DiagnosisMainGroup = 999;
          // The below is used to log any diagnosis codes that do not have a valid lookup. Consider adding for reference
          diagnosis_set.add(+d.snomed_diagnosis);
        }
      }

      if (attdSourceRefObj[+d.snomed_attd] !== undefined) {
        // ie. snomed code has been found...
        d.attdSource = attdSourceRefObj[+d.snomed_attd];
        // d.ComplaintMainGroup = complaintRefObj[d.snomed_complaint][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_attd === 0) {
          d.attdSource = [0];
          // .ComplaintMainGroup = ["0"];
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.attdSource = [0];
          // d.ComplaintMainGroup = [0];
          // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
          attdSource_set.add(+d.snomed_attd);
        }
      }

      if (complaintRefObj[d.snomed_complaint] !== undefined) {
        // ie. snomed code has been found...
        d.Complaint = complaintRefObj[+d.snomed_complaint];
        // d.ComplaintMainGroup = complaintRefObj[d.snomed_complaint][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_complaint === 0) {
          d.Complaint = [0];
          // .ComplaintMainGroup = ["0"];
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.Complaint = [0];
          // d.ComplaintMainGroup = [0];
          // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
          complaint_set.add(d.snomed_complaint);
        }
      }

      if (dischdestRefObj[d.snomed_dischargedest] !== undefined) {
        // ie. snomed code has been found...
        d.dischDest = dischdestRefObj[d.snomed_dischargedest];
        // d.ComplaintMainGroup = complaintRefObj[d.snomed_complaint][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_dischargedest === 0) {
          d.dischDest = [0];
          // .ComplaintMainGroup = ["0"];
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.dischDest = [0];
          // d.ComplaintMainGroup = [0];
          // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
          dischdest_set.add(d.snomed_dischargedest);
        }
      }

      if (dischstatusRefObj[d.snomed_dischargestatus] !== undefined) {
        // ie. snomed code has been found...
        d.dischStatus = dischstatusRefObj[d.snomed_dischargestatus];
        // d.ComplaintMainGroup = complaintRefObj[d.snomed_complaint][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_dischargestatus === 0) {
          d.dischStatus = [0];
          // .ComplaintMainGroup = ["0"];
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.dischStatus = [0];
          // d.ComplaintMainGroup = [0];
          // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
          dischstatus_set.add(d.snomed_dischargestatus);
        }
      }

      if (dischfupRefObj[d.snomed_dischargeFU] !== undefined) {
        // ie. snomed code has been found...
        d.dischFUP = dischfupRefObj[d.snomed_dischargeFU];
        // d.ComplaintMainGroup = complaintRefObj[d.snomed_complaint][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_dischargeFU === 0) {
          d.dischFUP = [0];
          // .ComplaintMainGroup = ["0"];
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.dischFUP = [0];
          // d.ComplaintMainGroup = [0];
          // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
          dischfup_set.add(d.snomed_dischargeFU);
        }
      }

      if (injdrugRefObj[d.snomed_injdrug] !== undefined) {
        // ie. snomed code has been found...
        d.injdrug = injdrugRefObj[d.snomed_injdrug];
        // d.ComplaintMainGroup = complaintRefObj[d.snomed_complaint][0];
      } else {
        // code not found in ref table look up - investigate
        if (d.snomed_injdrug === 0) {
          d.injdrug = [0];
          // .ComplaintMainGroup = ["0"];
        } else {
          // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
          d.injdrug = [0];
          // d.ComplaintMainGroup = [0];
          // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
          injdrug_set.add(d.injdrug);
        }
      }
    });

    missingSnomedCodes["diagnosis"] = diagnosis_set;
    missingSnomedCodes["complaint"] = complaint_set;
    missingSnomedCodes["attdSource"] = attdSource_set;
    missingSnomedCodes["dischDest"] = dischdest_set;
    missingSnomedCodes["dischStatus"] = dischstatus_set;
    missingSnomedCodes["dischFUP"] = dischfup_set;
    missingSnomedCodes["injDrug"] = injdrug_set;
    console.log(missingSnomedCodes); // snomed codes that have not been found

    console.timeEnd("parseTime");

    // Run the data through crossfilter and load the cf_data
    cf = crossfilter(d.data);
    all = cf.groupAll();

    // how many rows?
    console.log("No of Records: " + formatNumber(cf.size()));
    // log a random record
    const random = Math.floor(Math.random() * (+cf.size() - +0)) + +0; // random number between 0 and no. records
    console.log(d.data[random]); // console.log(d.data[0]);// example data

    // Used to present total number of records and number of filtered records
    dc.dataCount("#counter")
      .dimension(cf)
      .group(all)
      .formatNumber(formatNumber)
      .html({
        some:
          "<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records" +
          " | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>", // dc.renderAll
        all:
          "All records selected. Please click on the charts to apply filters."
      });

    // Dimensions

    // Diagnosis Dimensions

    // Patient Characteristics

    // Other

    // Check dimensions
    // console.log(dimPeriod.top(Infinity));

    //const dateRange = [minDate, maxDate];
    // console.log(dateRange)

    // Crossfilter on a dimension
    // let minDuration = (dimDuration.bottom(1)[0]["Duration"]),
    //     maxDuration = (dimDuration.top(1)[0]["Duration"]);
    //
    // let durationRange = [minDuration, maxDuration];
    // console.log(dimDuration.top(1)[0]["Duration"])

    // Crossfilter functions based on diagnosis
    // console.log(dimPeriod.top(5))
    // dimWeekday.filter(function (d) { return d === 'Mon'; });
    // console.log(dimWeekday.top(5))
    // Remove filter
    // dimWeekday.filterAll()

    // groupDaily.all();
    // console.log(groupDaily.top(10));

    // Check Group
    // console.log(groupTimeofDay.all());

    /* Charting */

    // Daily and Period Charts are closely linked

    const dimDaily = cf.dimension(function(d) {
        return d.Daily;
      }),
      groupDaily = dimDaily.group();

    // https://stackoverflow.com/questions/31808718/dc-js-barchart-first-and-last-bar-not-displaying-fully
    const minDateTS = dimDaily.bottom(1)[0]["Daily"],
      maxDateTS = dimDaily.top(1)[0]["Daily"];

    const minDate = new Date(minDateTS),
      maxDate = new Date(maxDateTS);

    minDate.setHours(minDate.getHours() - 1);
    maxDate.setHours(maxDate.getHours() + 1);

    const dimPeriod = cf.dimension(function(d) {
        return d.Period;
      }),
      groupPeriod = dimPeriod.group();

    seriesDaily
      .useViewBoxResizing(true)
      .width(chtWidthStd)
      .height(chtHeightShort)
      .margins({
        top: 0,
        right: 20,
        bottom: 60,
        left: 40
      })
      .dimension(dimPeriod)
      .group(groupDaily)
      .x(
        d3
          .scaleTime()
          .domain([
            d3.timeDay.offset(minDate, -1),
            d3.timeDay.offset(maxDate, 1)
          ]) // add a bit to the max date here
      )
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
      // colours per day of week, starting sunday (first point sets colour for the area/ line. Separate colour to identfy Mon)
      .colors(
        d3
          .scaleOrdinal()
          .domain([0, 1, 2]) // regular day, Monday, Bank Holiday
          .range(["#377eb8", "#e41a1c", "#ff8c00"]) // blue, red, yellow
      )
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
          .domain([
            d3.timeDay.offset(minDate, -1),
            d3.timeDay.offset(maxDate, 10)
          ]) // add a bit to the max date here
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
        // console.log(d);
        return formatPeriod(d);
      })
      .ticks(d3.timeMonth.every(1));

    // rotate x-axis 90 degrees - need to adjust x/y to align appropriately
    seriesPeriod.on("renderlet.a", function(chart) {
      chart
        .selectAll("g.x text")
        .attr("dx", "-22")
        .attr("dy", "15")
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

    seriesPeriod.render();

    const dimWeekdayNo = cf.dimension(function(d) {
      return d.WeekdayNo;
    });
    // const groupWeekday = dimWeekday.group();
    // const groupWeekdayNo = dimWeekdayNo.group(); // dimension on day of week
    const groupWeekdayAvg = dimWeekdayNo.group().reduce(
      function(p, v) {
        // reduceAdd
        const day = v.Daily; // .getTime()
        p.map.set(day, p.map.has(day) ? p.map.get(day) + 1 : 1);
        //p.avg = average_map(p.map);
        return p;
      },
      function(p, v) {
        // reduceRemove
        const day = v.Daily; // .getTime() // d3.timeDay(v[0])
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
          arrWeekDays[d.key], formatNumber(average_map(d.value.map))
        ].join(": ");
      })
      .label(function(d) {
        return [
          arrWeekDays[d.key], formatNumber(average_map(d.value.map))
        ].join(": ");
      })
      .drawPaths(false)
      // .colorAccessor(function(d, i){return d.value;})
      // .ordinalColors(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628'])
      .ordinalColors(d3.schemeSpectral[7])
      // .colors()
      // .colorDomain()
      .turnOnControls(true)
      .controlsUseVisibility(true)
      .render();

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

    const dimTimeofDay = cf.dimension(function(d) {
      return [d.Hour, d.WeekdayNo];
    });
    // declared in global scope
    groupTimeofDay = dimTimeofDay.group();

    // For some reason,had to swap order of dimTimeofDay ([hour, day] rather than [day, hour])
    // Without this, clicking on either axis filtered the other axis
    heatmapTimeDay
      .useViewBoxResizing(true)
      .width(chtWidthStd)
      .height(chtHeightShort * 0.75)
      .dimension(dimTimeofDay)
      .group(groupTimeofDay)
      .keyAccessor(function(d) {
        return +d.key[0];
      }) // columns, hours
      .valueAccessor(function(d) {
        return +d.key[1];
      }) // rows, days
      .colorAccessor(function(d) {
        return +d.value;
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
        return arrWeekDays[+d];
      }) //
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
      .xBorderRadius(0) // 6.75 is the default
      .yBorderRadius(0)
      .controlsUseVisibility(true)
      .turnOnControls(true)
      .render();
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
      return map_attdSource_groups.get(+d)[1];
    })
    .turnOnControls()
    .controlsUseVisibility(true)
    .render();





    document.getElementById("bl-sectime").style.display = "none";
    document.getElementById("sectime").style.visibility = "visible";

    // Diagnosis Charts
    // https://dc-js.github.io/dc.js/examples/sunburst.html
    // https://dc-js.github.io/dc.js/docs/html/dc.sunburstChart.html

    const dimDiagMain = cf.dimension(function(d) {
        return d.DiagnosisMainGroup;
      }),
      groupDiagMain = dimDiagMain.group();

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
        return [map_diagnosis_groups.get(d.key)[0], formatNumber(d.value)].join(
          ": "
        );
      })
      .title(function(d) {
        return [map_diagnosis_groups.get(d.key)[0], formatNumber(d.value)].join(
          ": "
        );
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
      .controlsUseVisibility(true)
      .render();

    const dimDiagnoses = cf.dimension(function(d) {
        return d.Diagnoses;
      }),
      groupDiagnoses = dimDiagnoses.group();

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
        // d.path gives the parent keys too as an array, console.log(d.path[0])
        // console.log(+d.path.join(''))
        // console.log(d.path.join('')) // convert array, [11, 12, 13] to string (struggle to retrieve key from map when an array)
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
      .controlsUseVisibility(true)
      .render();

    const dimAcuity = cf.dimension(function(d) {
        return d.snomed_acuity;
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
      .ordinalColors(d3.schemeSpectral[6])
      .drawPaths(false)
      .turnOnControls(true)
      .controlsUseVisibility(true)
      .render();

    const dimComplaint = cf.dimension(function(d) {
        return d.Complaint;
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
      .controlsUseVisibility(true)
      .render();

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
      .controlsUseVisibility(true)
      .render();

    document.getElementById("bl-secdiag").style.display = "none";
    document.getElementById("secdiag").style.visibility = "visible";

    // Patient Characteristics

    const dimAgeBand = cf.dimension(function(d) {
        return d.AgeBand;
      }),
      groupAgeBand = dimAgeBand.group();

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
        return [arrAgeBand[d.key], formatNumber(+d.value)].join(": ");
      })
      .title(function(d) {
        return [arrAgeBand[d.key], formatNumber(+d.value)].join(": ");
      })
      .elasticX(true)
      // .colorAccessor(function(d, i){return d.value;})
      .ordinalColors(d3SchemeCategory20b)
      .turnOnControls(true)
      .controlsUseVisibility(true)
      .render();

    const dimGPPractice = cf.dimension(function(d) {
        return d.practiceID;
      }),
      groupGPPractice = dimGPPractice.group();

    dropGPPractice
      .useViewBoxResizing(true)
      .width(chtWidthWide)
      .height(chtHeightStd)
      .dimension(dimGPPractice)
      .group(groupGPPractice) //dimGPPractice.group()
      .multiple(true)
      .numberVisible(18)
      .turnOnControls()
      .controlsUseVisibility(true)
      .promptText("Select All")
      .order(function(a, b) {
        return b.value > a.value ? 1 : a.value > b.value ? -1 : 0;
      })
      .title(function(d) {
        if (+d.key !== 0) {
          const pCode = practiceArr[d.key - 1],
            pDetails = practiceObj[pCode];

          return [pCode, pDetails[1], pDetails[2], formatNumber(d.value)].join(
            ": "
          );
        } else {
          return "Other: " + formatNumber(d.value);
        }
      })
      .render();

    const dimEDFD = cf.dimension(function(d) {
        return d.Comm_Serial;
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
      .controlsUseVisibility(true)
      .render();

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
      .controlsUseVisibility(true)
      .render();

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
      .controlsUseVisibility(true)
      .render();

    document.getElementById("bl-secdisch").style.display = "none";
    document.getElementById("secdisch").style.visibility = "visible";

    const dimDuration = cf.dimension(function(d) {
        return d3.min([d.Duration_ms, maxDuration]); // cut off at eg. 8 hours
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
        d3
          .scaleTime()
          .domain([0, 1000 * 60 * 60 * 8])
          .range([new Date(0), new Date(0).setHours(4, 15)]) // hours and minutes
      )
      .xUnits(d3.timeMinutes)
      .round(d3.timeMinute.every(5)) // chart shows each minute but brush will snap to nearest 5 mins
      // Somehow, only get this to work with .centerBar(false)
      .alwaysUseRounding(true)
      .elasticX(false) // have to turn this off to set domain
      .elasticY(true)
      // .renderHorizontalGridLines(true)
      // .renderLabel(false)
      .brushOn(true)
      .mouseZoomable(false)
      .centerBar(false)
      // .barPadding(100) // can't see what this does
      //.outerPadding(20)
      //.gap(30)
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
        formatDuration(filters[0][0]) + " to " + formatDuration(filters[0][1])
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

    chtDuration.render();

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Using_map_to_reformat_objects_in_an_array
    // from an array of objects, return the object values as an array
    // https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array
    // test = groupDaily.all().map(a => a.value);
    // https://stackoverflow.com/questions/42109965/crossfilter-double-grouping-where-key-is-the-value-of-another-reduction

    // The array here needs to be an int rather than a time
    let groupArrayDuration = dimWeekdayNo.group().reduce(
      function(p, v) {
        p.push(d3.min([v.Duration_ms, maxDuration]));
        return p;
      },
      function(p, v) {
        p.splice(p.indexOf(d3.min([v.Duration_ms, maxDuration])), 1);
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
      .showOutliers(false) //, if true, addas around a second to processing time
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

    document.getElementById("bl-sectest").style.display = "none";
    document.getElementById("sectest").style.visibility = "visible";

    // dc.renderAll();
    // heatKey();

    // to load with filters already displayed,this needs to go below the render
    // look into whether best to renderAll or separately...
    //seriesPeriod
    // .filter([minDate.setHours(minDate.getHours() +1), maxDate]);
    //.filter(dc.filters.RangedFilter(minDate, maxDate));

    // bouncing-loader
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
    // document.getElementsByClassName(
    //   "bouncing-loader"
    // )[0].style.display = "none";

    // https://medium.com/@jsdevray/5-ways-to-loop-over-dom-elements-from-queryselectorall-in-javascript-55bd66ca4128
    // Below returns HTMLColection - difficult to work with...
    //let dcCharts = document.getElementsByClassName('dcCharts'); // document.getElementById('article-right').getElementsByClassName('dcCharts')
    //

    //for (let i = 0; i < dcCharts.length; i++) {
    //   dcCharts[i].style.display = "block";
    //

    // Returns a static NodeList that can be iterated over directly
    // https://developer.mozilla.org/en-US/docs/Web/API/NodeList
    // https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/querySelectorAll
    // let dcCharts = document.querySelectorAll('.dcCharts');
    // dcCharts.forEach(dcChart => {
    //     dcChart.style.display = "block";
    // });

    // initially hidden whilst loading, then set to block to display
    // document.querySelectorAll(".dcCharts").forEach(dcChart => {
    //   dcChart.style.display = "block";
    // });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    /* Testing - update the heatmapKey after applying a filter to any chart
                    // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
                                        dc.chartRegistry.list().forEach(function (chart) {
                                            chart.on('filtered', function () {
                                                // your event listener code goes here.
                                                // All this code appears to run twice...
                                                heatKey();
                                            });
                                        });
                    */

    // End Timing
    console.timeEnd("ProcessTime");
  }
});

// https://stackoverflow.com/questions/49599691/how-to-load-data-from-a-csv-file-in-d3-v5?noredirect=1&lq=1
// https://stackoverflow.com/questions/49239474/load-multiple-files-using-the-d3-fetch-module

// Libraries and Versions
d3.json("https://api.github.com/repos/dc-js/dc.js/releases/latest").then(
  function(latestRelease) {
    /* jshint camelcase: false */
    /* jscs:disable */
    console.log("dc.js version: " + dc.version);
    console.log("latest dc.js stable release: " + latestRelease.tag_name);
  }
);
console.log("Crossfilter version: " + crossfilter.version);

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

  d3.select("#legend")
    .selectAll("svg")
    //.data(arrCells)
    //.exit()
    .remove();

  let svg = d3
    .select("#legend")
    .append("svg")
    // .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (60)); // height + margin.top + margin.bottom
    .attr("viewBox", "0 5 200 20"); // height + margin.top + margin.bottom

  let heatKeyCells = svg
    .selectAll("g")
    .data(arrCells)
    .enter()
    .append("g")
    .attr("transform", "translate(" + 5 + "," + 5 + ")"); // (height / 2)

  heatKeyCells
    .append("rect")
    .attr("x", function(d, i) {
      return i * 10;
    })
    .attr("class", "heatCell")
    .attr("y", 0)
    .attr("width", 9)
    .attr("height", 9)
    .style("fill", function(d) {
      return sequentialScale(d);
    });

  heatKeyCells
    .append("text")
    .text(function(d, i) {
      if (i % 2 === 0 || i === noCells - 1) {
        return heatmapTDScale(d);
      }
    })
    .attr("class", "heatLabel")
    .merge(heatKeyCells)
    .attr("x", function(d, i) {
      return i * 10;
    })
    .attr("dx", 5)
    .attr("y", 15)
    .attr("font-size", "0.15em")
    .attr("fill", "#009")
    .attr("text-anchor", "middle");

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
  console.log("Why do i run twice?");
}

// optional function to adjust hcl parameters
function saturate(colour, k = 1) {
  const { h, c, l } = d3.hcl(colour);
  return d3.hcl(h, c + 18 * k, l);
}

function sunburstColours(inColour) {
  // Base Colours (originally designed around diagnosis codes)
  // http://colorbrewer2.org/?type=sequential&scheme=BuPu&n=9#type=qualitative&scheme=Paired&n=12
  const mapColours = new Map([
    [11, "#a6cee3"],
    [21, "#1f78b4"],
    [31, "#b2df8a"],
    [35, "#b2df8a"], // new
    [41, "#33a02c"],
    [51, "#fb9a99"],
    [55, "#fb9a99"], // new
    [61, "#e31a1c"],
    [71, "#fdbf6f"],
    [75, "#fdbf6f"], // new
    [81, "#ff7f00"],
    [91, "#cab2d6"],
    [97, "#6a3d9a"],
    [99, "#ffff99"],
    [0, "#808080"], // unknown, grey
    [999, "#ffff00"] // old code, grey
  ]);

  // Sunburst Colours
  // http://bl.ocks.org/sathomas/4a3b74228d9cb11eb486
  let colour, // Main colour based on top layer key (eg. s1 = 11)
    startColour,
    endColour;

  const colours = d3
    .scaleLinear()
    .interpolate(d3.interpolateHcl)
    .domain([10, 90]);

  // Take the inputted string eg. 111213 and split in to two characters ['11', '12', '13']
  const arr = String(inColour).match(/.{1,2}/g);

  // Base Colour
  colour = startColour = endColour = d3.hcl(mapColours.get(+arr[0])); // lightGreenFirstPalette[x]

  if (arr.length === 1) {
    return colour;
  } else {
    for (let i = 2; i <= arr.length; i++) {
      (startColour = startColour.darker()), (endColour = endColour.brighter());
    }

    colours.range([startColour, endColour]);
    return colours(arr[arr.length - 1]); //  the last item in the array
  }
}
