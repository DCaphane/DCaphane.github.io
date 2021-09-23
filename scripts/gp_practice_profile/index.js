"use strict";

// Load the initial data and then variations on this for subsequent filtering
let trendChart,
  barChart,
  demographicChart,
  circlePopnIMDChart,
  highlightedPractice;

const newTooltip = createTooltip();
const genID = generateUniqueID(); // genID.uid

// Store user selections
const userSelections = {
  selectedPractice: "All Practices",
  selectedPracticeName() {
    return practiceLookup.has(this.selectedPractice)
      ? titleCase(practiceLookup.get(this.selectedPractice))
      : "";
  },
  selectedPracticeCompare: "None",
  selectedPracticeCompareName() {
    return practiceLookup.has(this.selectedPracticeCompare)
      ? titleCase(practiceLookup.get(this.selectedPracticeCompare))
      : "";
  },
  selectedDate: null,
  nearestDate() {
    // Align the selected period to the nearest quarterly period
    // arrayGPLsoaDates is result of promise promDataGPPopnLsoa
    return (
      arrayGPLsoaDates.reduce(
        (p, n) =>
          Math.abs(p) > Math.abs(n - this.selectedDate)
            ? n - this.selectedDate
            : p,
        Infinity
      ) + this.selectedDate
    );
  },
};

/* Data Import */
let dataPopulationGP,
  dataPopulationGPSummary,
  dataPopulationGPLsoa,
  arrayGPLsoaDates,
  uniquePractices; // sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object

const promDataGPPopn = d3 // consider dropping locality
  .csv("Data/GP_Practice_Populations_slim.csv", processDataGPPopulation)
  .then((data) => {
    dataPopulationGP = data;

    dataPopulationGPSummary = d3.rollup(
      dataPopulationGP,
      (v) => d3.sum(v, (d) => d.Total_Pop),
      (d) => +d.Period,
      (d) => d.Practice
    );

    // default the selected date to the latest available
    userSelections.selectedDate = d3.max(data, function (d) {
      return d.Period;
    });

    // List of GP Practice codes (sorted A-Z) for use in drop down ------------------------
    uniquePractices = [...new Set(data.map((item) => item.Practice))].sort();
  });

const promDataGPPopnLsoa = d3
  .csv("Data/population_gp_lsoa.csv", processDataPopulationGPLsoa)
  .then((data) => {
    dataPopulationGPLsoa = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.population),
      (d) => d.period,
      (d) => d.practice,
      (d) => d.lsoa
    );

    // GP LSOA Population is Quarterly so not a 1:1 match with trend data
    // Will use closest value
    arrayGPLsoaDates = [...dataPopulationGPLsoa.keys()]; // use Array.from or spread syntax
  });

// Export geojson data layers as: EPSG: 4326 - WGS 84
let geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataLsoaPopnCentroid,
  geoDataNationalCCGBoundaries,
  dataIMD; // not geo data but only used in map chart

// Promises to import the geo data

const promGeoDataGP = d3.json("Data/geo/gpPracticeDetailsGeo.geojson"),
  promGeoDataCYCWards = d3.json("Data/geo/cyc_wards.topojson"),
  promGeoNationalCCGBoundaries = d3.json(
    "Data/geo/ccg_boundary_national_202104.topojson"
  ),
  promGeoDataLsoaBoundaries = d3.json(
    "Data/geo/lsoa_gp_selected_simple20cp6.topojson"
  ),
  promGeoDataLsoaPopnCentroid = d3.json(
    "Data/geo/lsoa_population_centroid_03q.geojson"
  ),
  promHospitalDetails = d3.dsv(
    /*
  details of national hospital sites
  https://www.nhs.uk/about-us/nhs-website-datasets/
  https://media.nhswebsite.nhs.uk/data/foi/Hospital.pdf
  */
    "�", // \u00AC
    "Data/geo/Hospital.csv",
    processDataHospitalSite
  ),
  promDataIMD = d3.csv("Data/imd_lsoa_ccg.csv", processDataIMD),
  promDataRates = d3
  .csv("Data/ratesIndicators.csv", processRatesData)
  .then((data) => {
    // https://observablehq.com/@d3/d3-group
    // Rates data grouped by csv and lsoa
    dataRates = d3.group(
      data,
      (d) => d.key,
      (d) => d.lsoa
    );
    // the max of the counts, used for sizing the d3 circle
    dataRatesMax = d3.rollup(
      data,
      (v) => d3.max(v, (d) => d.count),
      (d) => d.key
    );

    /*
  dataRates.keys()

    */
  });

promGeoNationalCCGBoundaries.then((data) => {
  geoDataNationalCCGBoundaries = topojson.feature(
    data,
    data.objects.ccg_boundary_national_202104
  );
});

promGeoDataLsoaBoundaries.then((data) => {
  geoLsoaBoundaries = topojson.feature(
    data,
    data.objects.lsoa_gp_selected_original
  );
});

promGeoDataCYCWards.then((data) => {
  geoWardBoundaries = topojson.feature(data, data.objects.cyc_wards);
});

// Upload Data
const importGeoData = (async function displayContent() {
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promGeoDataLsoaPopnCentroid,
    promDataIMD,
    promDataRates,
  ]).then((values) => {
    // if (values[0].status === "fulfilled") {
    // geoDataLsoaBoundaries = topojson.feature(values[0].value, values[0].value.objects.lsoa_gp_selected_simple20cp6)
    // }
    geoDataLsoaPopnCentroid = values[1].value;
    dataIMD = values[2].value;
  });
})();

function initD3Charts() {
  trendChart = initTrendChart(dataPopulationGP, "cht_PopTrend");
  trendChart.chartTrendDraw();

  barChart = initPopnBarChart(dataPopulationGP, "cht_PopBar");
  barChart.fnRedrawBarChart();

  demographicChart = initChartDemog(dataPopulationGP, "cht_PopDemo");
  demographicChart.updateChtDemog();
}

function refreshChartsPostPracticeChange(practice) {
  console.log({ selectedPractice: practice });
  // change the selection box dropdown to reflect clicked practice
  document.getElementById("selPractice").value = `${
    userSelections.selectedPractice
  }: ${userSelections.selectedPracticeName()}`;

  filterGPPracticeSites();
  filterFunctionLsoa(true); // zoom to filtered lsoa
  // .then(() => {
  //   recolourPopnLSOA();
  //   recolourIMDLayer(imdDomainShort);
  // });

  trendChart.chartTrendDraw();

  demographicChart.updateChtDemog(
    practice,
    userSelections.selectedPracticeCompare
  );

  circlePopnIMDChart.updateD3BubbleLsoa();

  barChart.fnRedrawBarChart();

  // updateTextPractice();
  // updateTextPCN();
  updateBouncingMarkers();

  highlightFeature(practice, mapMain, false);

  sidebarContent.updateSidebarText("pcnSpecific", practice);
}

function refreshChartsPostDateChange() {
  for (const value of mapsWithGPMain.values()) {
    updatePopUpText(value[0]);
  }
  demographicChart.updateChtDemog(
    userSelections.selectedPractice,
    userSelections.selectedPracticeCompare
  );
  filterFunctionLsoa(true); // zoom to filtered lsoa

  circlePopnIMDChart.updateD3BubbleLsoa();
  barChart.fnRedrawBarChart();
}

/* Functions to process the data on load */

function processDataGPPopulation(d, index, columnKeys) {
  // Loop through the raw data to format columns as appropriate
  return {
    Practice: d.Practice_Mapped.substring(0, 6),
    // Locality: d.Locality,
    Age_Band: d.Age_Band,
    Period: +parseDate(d.Period),
    Male_Pop: +d.Male,
    Female_Pop: +d.Female,
    Total_Pop: +d.Total,
  };
}

function processDataPopulationGPLsoa(d) {
  return {
    period: +parseDate2(d.period),
    practice: d.practice_code,
    lsoa: d.lsoa,
    population: +d.population,
  };
}

function processDataHospitalSite(d) {
  if (!isNaN(+d.Latitude)) {
    return {
      // latitude: +d.Latitude,
      // longitude: +d.Longitude,
      markerPosition: [+d.Latitude, +d.Longitude],
      sector: d.Sector, // nhs or independent
      organisationCode: d.OrganisationCode,
      organisationName: d.OrganisationName,
      parentODSCode: d.ParentODSCode,
      parentName: d.ParentName,
    };
  } else {
    console.log({ orgCode: d.OrganisationCode, invalidLatitude: d.Latitude });
  }
}

const mapLSOAbyIMD = new Map(); // LSOAs by the main IMD decile

function processDataIMD(d) {
  mapLSOAbyIMD.set(
    d.LSOA_code_2011,
    +d.Index_of_Multiple_Deprivation_IMD_Decile
  );

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
}

// Rates Testing
let dataRates, dataRatesMax;



function processRatesData(d) {
  return {
    key: d.Key,
    lsoa: d.LSOA,
    count: +d.Count,
    rate: +d.Rate,
    signf: d.Signf,
  };
}

// // These would be hard coded to provide a lookup from the data key to the description
const dataRatesKeys = new Map();
dataRatesKeys.set("AE_01", "Long Description AE_01");
dataRatesKeys.set("test02", "Long Description test02");
dataRatesKeys.set("testNew", "Long Description testNew");
