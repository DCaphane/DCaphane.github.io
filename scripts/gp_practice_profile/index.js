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
let dataPopulationGP, dataPopulationGPLsoa, arrayGPLsoaDates, uniquePractices; // sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object

const promDataGPPopn = d3
    .csv("Data/GP_Practice_Populations_slim.csv", processDataGPPopulation)
    .then((data) => {
      dataPopulationGP = data;

      // default the selected date to the latest available
      userSelections.selectedDate = d3.max(data, function (d) {
        return d.Period;
      });

      // List of GP Practice codes (sorted A-Z) for use in drop down ------------------------
      uniquePractices = [...new Set(data.map((item) => item.Practice))].sort();
    }),
  promDataGPPopnLsoa = d3
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
let // geo coded data
  geoDataPCN,
  geoDataPCNSites,
  geoDataCYCWards,
  geoDataCCGBoundary,
  geoDataLsoaBoundaries,
  geoDateLsoaPopnCentroid,
  dataIMD; // not geo data but only used in map chart
// Organisation Data
// hospitalDetails; -- handled in map object

// Promises to import the geo data
const promGeoDataPCN = d3.json("Data/geo/pcn/primary_care_networks.geojson"),
  promGeoDataPCNSites = d3.json(
    "Data/geo/pcn/primary_care_network_sites.geojson"
  ),
  promGeoDataCYCWards = d3.json("Data/geo/cyc_wards.geojson"),
  promGeoDataCCGBoundary = d3.json(
    "Data/geo/ccg_boundary_03Q_simple20.geojson"
  ),
  promGeoDataLsoaBoundaries = d3.json(
    "Data/geo/lsoa_gp_selected_simple20cp6.geojson"
  ),
  promGeoDateLsoaPopnCentroid = d3.json(
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
  promDataIMD = d3.csv("Data/imd_lsoa_ccg.csv", processDataIMD);
// promGPPracticeDetails = d3.json(
//   "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03Q&RelStatus=active&Limit=1000"
// );

// Upload Data
const importGeoData = (async function displayContent() {
  await Promise.allSettled([
    promGeoDataPCN,
    promGeoDataPCNSites,
    promGeoDataCYCWards,
    promGeoDataCCGBoundary,
    promGeoDataLsoaBoundaries,
    promGeoDateLsoaPopnCentroid,
    promDataIMD,
    // promHospitalDetails,
    // promGPPracticeDetails,
  ])
    .then((values) => {
      // if (values[0].status === "fulfilled") {
      geoDataPCN = values[0].value;
      // }
      geoDataPCNSites = values[1].value;
      geoDataCYCWards = values[2].value;
      geoDataCCGBoundary = values[3].value;
      geoDataLsoaBoundaries = values[4].value;
      geoDateLsoaPopnCentroid = values[5].value;
      dataIMD = values[6].value;
      // promHospitalDetails is 7
      // gpDetails = values[8].value;
    })
    .then(() => {
      // Assumption here that everything in other scripts is declared before this step...
      // console.log(geoDateLsoaPopnCentroid)
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

function initGeoCharts() {
  // from map_GP_MainSite.js
  addWardGroupsToMap.call(mapMain);
  addPracticeToMap.call(mapMain);

  // // from map_popn_lsoa.js
  gpSites();
}

function refreshGeoChart() {
  lsoaBoundary.call(mapPopn, true); // call before recolourLSOA due to filters
  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
  mapMarkersNationalTrust();
}

function refreshChartsPostPracticeChange(practice) {
  console.log(practice);
  // change the selection box dropdown to reflect clicked practice
  document.getElementById("selPractice").value = `${
    userSelections.selectedPractice
  }: ${userSelections.selectedPracticeName()}`;

  updateBouncingMarkers();
  highlightFeature(practice, mapMain, true);

  trendChart.chartTrendDraw();
  demographicChart.updateChtDemog(
    practice,
    userSelections.selectedPracticeCompare
  );

  filterGPPracticeSites.call(mapSites, true);

  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  circlePopnIMDChart.updateD3BubbleLsoa();
  barChart.fnRedrawBarChart();
  // updateTextPractice();
  // updateTextPCN();
  sidebarContent.updateSidebarText("pcnSpecific", practice);
}

function refreshChartsPostDateChange() {
  demographicChart.updateChtDemog(
    userSelections.selectedPractice,
    userSelections.selectedPracticeCompare
  );
  recolourLSOA();
  circlePopnIMDChart.updateD3BubbleLsoa();
  barChart.fnRedrawBarChart();
}

/* Functions to process the data on load */

function processDataGPPopulation(d, index, columnKeys) {
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
      latitude: +d.Latitude,
      // longitude: +d.Longitude,
      markerPosition: [+d.Latitude, +d.Longitude],
      sector: d.Sector, // nhs or independent
      organisationCode: d.OrganisationCode,
      organisationName: d.OrganisationName,
      parentODSCode: d.ParentODSCode,
      parentName: d.ParentName,
    };
  } else {
    console.log(d.OrganisationCode, d.Latitude);
  }
}

function processDataIMD(d) {
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
