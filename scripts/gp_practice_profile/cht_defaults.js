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

// Add a 'select', drop down box
const selPracticeDropDown = document.getElementById("selPractice"),
  selPracticeCompareDropDown = document.getElementById("selPracticeCompare");

// Load the initial data and then variations on this for subsequent filtering
let dataImport,
  dataLevel_01, // by period
  dataLevel_02, // by practice by period
  dataLevel_03 = [], // by age/ sex, latest period (init chart)
  dataLevel_04, // by age/ sex, by practice by period
  data_DemoInit, // used to initialise demographic data
  data_popnGPLsoa;
let arrayGPLsoaDates;
let trendChart, barChart;

let selectedPracticeCompare = "None",
  selectedDate;
// selectedPractice

// https://github.com/d3/d3-time-format
const parseDate = d3.timeParse("%b-%y"), // import format: mmm-yy
  parseDate2 = d3.timeParse("%d/%m/%Y"), // import format: dd/mm/yyyy
  formatPeriod = d3.timeFormat("%b-%y"); // presentational format eg. Apr-16
// formatNumber = d3.format(",d");

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent

// const formatNumber = function (num) {
//     return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
// };

// sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object
let uniquePractices;

// For Practice Lookups
const practiceLookup = new Map();

function practiceDetailsDropDown() {
  let urls = [
    "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03Q&RelStatus=active&Limit=1000",
    // "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03M&RelStatus=active&Limit=1000"
  ];

  urls.forEach((url) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const organisations = data.Organisations;

        organisations.forEach((d) => {
          const orgID = d["OrgId"];
          const orgName = d["Name"];

          practiceLookup.set(orgID, orgName); // add bank holiday date to the map as an integer
        });
      })
      .then(() => updateDropdowns());
  });
}

async function loadPopulationData() {
  let data = await d3.csv(
    "Data/GP_Practice_Populations_slim.csv",
    processRow // this function is applied to each row of the imported data
  );

  dataImport = data;
  setDefaults(data);
  practiceDetailsDropDown(); // requires unique list of practices created from setDefaults
  trendChart = initTrendChart(data, "cht_PopTrend")
  trendChart.chartTrendDraw()
  // dataLevel_01 = fnDataLevel01(data); // Total by Period for initial Trend Chart
  // dataLevel_02 = fnDataLevel02(data); // Practices by Period - Trend Chart Filtered
  data_DemoInit = fnDataDemoInit(data); // Total by Period and Age Band
  dataLevel_03 = data_DemoInit.get(+selectedDate); //fnDataLevel03(data_DemoInit);
  dataLevel_04 = fnDataLevel04(data); // Practices by Period by Age/Sex - Demographic Chart Filtered
  // fnChartTrendData();
  fnChartDemogData(data_DemoInit);
  barChart = initPopnBarChart(data, "cht_PopBar");
  barChart.fnRedrawBarChart();
}

async function loadPopulationGPlsoaData() {
  let data = await d3.csv(
    "Data/population_gp_lsoa.csv",
    processPopGPlsoaRow // this function is applied to each row of the imported data
  );

  data_popnGPLsoa = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d.population),
    (d) => d.period,
    (d) => d.practice,
    (d) => d.lsoa
  );

  // GP LSOA Population is Quarterly so not a 1:1 match with trend data
  // Will use closest value
  arrayGPLsoaDates = [...data_popnGPLsoa.keys()]; // use Array.from or spread syntax
}

loadPopulationData();
loadPopulationGPlsoaData();

function processRow(d, index, columnKeys) {
  // Loop through the raw data to format columns as appropriate
  return {
    Practice: d.Practice_Mapped.substring(0, 6),
    Locality: d.Locality,
    Age_Band: d.Age_Band,
    Period: +parseDate(d.Period),
    Male_Pop: +d.Male,
    Female_Pop: +d.Female,
    Total_Pop: +d.Total,
  };
}

function processPopGPlsoaRow(d, index, columnKeys) {
  return {
    period: +parseDate2(d.period),
    practice: d.practice_code,
    lsoa: d.lsoa,
    population: +d.population,
  };
}

function setDefaults(data) {
  // List of practices (sorted A-Z) for use in drop down ------------------------
  uniquePractices = [...new Set(data.map((item) => item.Practice))].sort();

  // const test = d3.group(data, d => d.Practice).keys().sort();
  // console.log(test)
  // This is hard coded to order ages in correct order
  // uniqueAgeBands = new Map([...uniqueAgeBandsOrg.entries()].sort());

  // for default initial date, use the most recent period
  selectedDate = d3.max(data, function (d) {
    return d.Period;
  });
  // console.log(selectedDate)
}

// function fnDataLevel01(data) {
//   // Total by Period for initial Trend Chart

//   const d = d3.rollup(
//     data,
//     (v) => d3.sum(v, (d) => d.Total_Pop),
//     (d) => d.Period
//   );
//   return d;
// }

// function fnDataLevel02(data) {
//   // Practices by Period - Trend Chart Filtered

//   const d = d3.rollup(
//     data,
//     (v) => d3.sum(v, (d) => d.Total_Pop),
//     (d) => d.Practice,
//     (d) => +d.Period
//   );

//   return d;
// }

function fnDataDemoInit(data) {
  // Period and Age Band - Trend Chart Filtered

  const d = d3.rollup(
    data,
    function (v) {
      return {
        total: d3.sum(v, function (d) {
          return d.Total_Pop;
        }),
        male: d3.sum(v, function (d) {
          return d.Male_Pop;
        }),
        female: d3.sum(v, function (d) {
          return d.Female_Pop;
        }),
      };
    },
    (d) => +d.Period,
    (d) => d.Age_Band
  );

  return d;
}

function fnDataLevel04(data) {
  // Practices by Period by Age/Sex - Demographic Chart Filtered

  const d = d3.rollup(
    data,
    function (v) {
      return {
        total: d3.sum(v, function (d) {
          return d.Total_Pop;
        }),
        male: d3.sum(v, function (d) {
          return d.Male_Pop;
        }),
        female: d3.sum(v, function (d) {
          return d.Female_Pop;
        }),
      };
    },
    (d) => d.Practice,
    (d) => +d.Period,
    (d) => d.Age_Band
  );

  return d;
}

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.replace(word[0], word[0].toUpperCase());
    })
    .join(" ");
}

// Function to create Title Case
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
