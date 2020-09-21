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
let dataLevel_01, // by period
  dataLevel_02, // by practice by period
  dataLevel_03 = [], // by age/ sex, latest period (init chart)
  dataLevel_04, // by age/ sex, by practice by period
  data_DemoInit; // used to initialise demographic data

let selectedPracticeCompare = "None",
  selectedDate;
// selectedPractice

const parseDate = d3.timeParse("%b-%y"), // import format
  formatPeriod = d3.timeFormat("%b-%y"); // presentational format eg. Apr-16
// formatNumber = d3.format(",d");

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent

// sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object
let uniquePracticesOrg = new Map(),
  uniquePractices;

// For Practice Lookups
const practiceLookup = new Map();
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
    });
});

// let uniqueAgeBandsOrg = new Map(),
//   uniqueAgeBands;

// Format the data as appropriate

async function loadData() {
  let data = await d3.csv(
    "Data/GP_Practice_Populations.csv",
    processRow // this function is applied to each row of the imported data
  );

  setDefaults(data);
  dataLevel_01 = fnDataLevel01(data); // // Total by Period for initial Trend Chart
  dataLevel_02 = fnDataLevel02(data); // Practices by Period - Trend Chart Filtered
  data_DemoInit = fnDataDemoInit(data); // // Total by Period and Age Band
  dataLevel_03 = data_DemoInit.get(+selectedDate); //fnDataLevel03(data_DemoInit);
  dataLevel_04 = fnDataLevel04(data); // Practices by Period by Age/Sex - Demographic Chart Filtered
  fnChartTrendData();
  fnChartDemogData(data_DemoInit);
  updateDropdowns();
}
loadData();

function processRow(d, index, columnKeys) {
  // Loop through the raw data to:
  // i. identify unique practices
  let practiceItem = d.Practice_Mapped.substring(0, 6);
  if (!uniquePracticesOrg.has(practiceItem)) {
    uniquePracticesOrg.set(practiceItem, false);
  }

  // ii. unique age bands (is this used?)
  // let ageItem = d.Age_Band;
  // if (!uniqueAgeBandsOrg.has(ageItem)) {
  //   uniqueAgeBandsOrg.set(ageItem, false);
  // }

  // iii. format columns as appropriate
  return {
    Practice: practiceItem, // d.Practice_Mapped
    Locality: d.Locality,
    Age_Band: d.Age_Band,
    Period: +(parseDate(d.Period)),
    Male_Pop: +d.Male,
    Female_Pop: +d.Female,
    Total_Pop: +d.Total,
  };
}

function setDefaults(data) {
  // List of practices (sorted A-Z) for use in drop down ------------------------
  uniquePractices = new Map([...uniquePracticesOrg.entries()].sort());
  uniquePracticesOrg.clear();

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

function fnDataLevel01(data) {
  // Total by Period for initial Trend Chart

  const d = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => d.Period
  );
  return d;
}

function fnDataLevel02(data) {
  // Practices by Period - Trend Chart Filtered

  const d = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => d.Practice,
    (d) => +d.Period
  );

  return d;
}

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

// function fnDataLevel03(data) {
//   // const d = data.forEach(function (d) {
//   //   d.Period = new Date(d.key);
//   //   // d.Population = d.values;
//   //   if (d.Period.getTime() === selectedDate.getTime()) {
//   //     // comparing dates
//   //     Array.prototype.push.apply(dataLevel_03, d.values);
//   //     //dataLevel_03.push(d.values);
//   //   }
//   // });

//   // console.log(data)
//   // console.log(selectedDate)
//   // console.log(d);
//   return data.get(+selectedDate)
// }

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
  // console.log(d)
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

// function formatDataStructure(dataLevel_00) {
//   return data_DemoInit;
// }
