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
let data_popnGPLsoa,
  arrayGPLsoaDates,
  trendChart,
  barChart,
  demographicChart,
  uniquePractices; // sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object

const practiceLookup = new Map();
const newTooltip = createTooltip();

let selectedPractice,
  selectedPracticeCompare = "None",
  selectedDate;

// https://github.com/d3/d3-time-format
const parseDate = d3.timeParse("%b-%y"), // import format: mmm-yy
  parseDate2 = d3.timeParse("%d/%m/%Y"), // import format: dd/mm/yyyy
  formatPeriod = d3.timeFormat("%b-%y"), // presentational format eg. Apr-16
  formatNumber = d3.format(",d");

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent

// const formatNumber = function (num) {
//     return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
// };

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

const dataPopulationGP = (async function () {
  const data = await d3.csv(
    "Data/GP_Practice_Populations_slim.csv",
    // this function is applied to each row of the imported data
    function (d, index, columnKeys) {
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
  );

  // dataImport = data;
  setDefaults(data);
  practiceDetailsDropDown(); // requires unique list of practices created from setDefaults
  trendChart = initTrendChart(data, "cht_PopTrend");
  trendChart.chartTrendDraw();

  demographicChart = initChartDemog(data, "cht_PopDemo");
  demographicChart.updateChtDemog();

  barChart = initPopnBarChart(data, "cht_PopBar");
  barChart.fnRedrawBarChart();

  return;
})();

const dataPopulationGPLsoa = (async function () {
  const data = await d3.csv(
    "Data/population_gp_lsoa.csv",
    // this function is applied to each row of the imported data
    function (d, index, columnKeys) {
      return {
        period: +parseDate2(d.period),
        practice: d.practice_code,
        lsoa: d.lsoa,
        population: +d.population,
      };
    }
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

  return;
})();

const dataIMD = (async function () {
  return await d3.csv("Data/imd_lsoa_ccg.csv", function (d, index, columnKeys) {
    return {
      lsoa: d.LSOA_code_2011,
      imdRank: +d.Index_of_Multiple_Deprivation_IMD_Rank,
      imdDecile: +d.Index_of_Multiple_Deprivation_IMD_Decile,
      incomeRank: +d.Income_Rank,
      employmentRank: +d.Employment_Rank,
      educationRank: +d.Education_Skills_and_Training_Rank,
      healthRank: +d.Health_Deprivation_and_Disability_Rank,
      crimeRank: +d.Crime_Rank,
      housingRank: +d.Barriers_to_Housing_and_Services_Rank,
      livingEnvironRank: +d.Living_Environment_Rank,
      incomeChildRank: +d.Income_Deprivation_Affecting_Children_Index_Rank,
      incomeOlderRank: +d.Income_Deprivation_Affecting_Older_People_Rank,
      childRank: +d.Children_and_Young_People_Subdomain_Rank,
      adultSkillsRank: +d.Adult_Skills_Subdomain_Rank,
      geogRank: +d.Geographical_Barriers_Subdomain_Rank,
      barriersRank: +d.Wider_Barriers_Subdomain_Rank,
      indoorsRank: +d.Indoors_Subdomain_Rank,
      outdoorsRank: +d.Outdoors_Subdomain_Rank,
      totalPopn: +d.Total_population_mid_2015,
      dependentChildren: +d.Dependent_Children_aged_0_15_mid_2015,
      popnMiddle: +d.Population_aged_16_59_mid_2015,
      popnOlder: +d.Older_population_aged_60_and_over_mid_2015,
      popnWorking: +d.Working_age_population_18_59_64,
    };
  });
})();



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
