"use strict";

const chtWidthStd = 400,
  chtHeightStd = 400,
  chtWidthWide = 500,
  chtHeightTall = 700,
  chtHeightShort = 250;

const margin = {
  top: 50,
  right: 10,
  bottom: 150,
  left: 85,
};

// Load the initial data and then variations on this for subsequent filtering
// let uniquePractices; // sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object

// const practiceLookup = new Map();
// const newTooltip = createTooltip();

// let selectedPractice,
//   selectedPracticeCompare = "None",
//   selectedDate;

// https://github.com/d3/d3-time-format
// const parseDate = d3.timeParse("%b-%y"), // import format: mmm-yy
//   parseDate2 = d3.timeParse("%d/%m/%Y"), // import format: dd/mm/yyyy
//   formatPeriod = d3.timeFormat("%b-%y"), // presentational format eg. Apr-16
//   formatNumber = d3.format(",d");

// const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
//   formatPercent = d3.format(".0%"); // rounded percent

const formatNumber = function (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};


// const dataPopulationGP = (async function loadPopulationData() {
//   const data = await d3.csv(
//     "Data/GP_Practice_Populations_slim.csv",
//     processRow // this function is applied to each row of the imported data
//   );

  // dataImport = data;
  // setDefaults(data);
  // practiceDetailsDropDown(); // requires unique list of practices created from setDefaults


//   return;
// })();


// function processRow(d, index, columnKeys) {
//   // Loop through the raw data to format columns as appropriate
//   return {
//     Practice: d.Practice_Mapped.substring(0, 6),
//     Locality: d.Locality,
//     Age_Band: d.Age_Band,
//     Period: +parseDate(d.Period),
//     Male_Pop: +d.Male,
//     Female_Pop: +d.Female,
//     Total_Pop: +d.Total,
//   };
// }

// function processPopGPlsoaRow(d, index, columnKeys) {
//   return {
//     period: +parseDate2(d.period),
//     practice: d.practice_code,
//     lsoa: d.lsoa,
//     population: +d.population,
//   };
// }

// function setDefaults(data) {
//   // List of practices (sorted A-Z) for use in drop down ------------------------
//   uniquePractices = [...new Set(data.map((item) => item.Practice))].sort();

//   // const test = d3.group(data, d => d.Practice).keys().sort();
//   // console.log(test)
//   // This is hard coded to order ages in correct order
//   // uniqueAgeBands = new Map([...uniqueAgeBandsOrg.entries()].sort());

//   // for default initial date, use the most recent period
//   selectedDate = d3.max(data, function (d) {
//     return d.Period;
//   });
//   // console.log(selectedDate)
// }

// function titleCase(str) {
//   return str
//     .toLowerCase()
//     .split(" ")
//     .map(function (word) {
//       return word.replace(word[0], word[0].toUpperCase());
//     })
//     .join(" ");
// }

// // Function to create Title Case
// String.prototype.toProperCase = function () {
//   return this.replace(/\w\S*/g, function (txt) {
//     return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//   });
// };
