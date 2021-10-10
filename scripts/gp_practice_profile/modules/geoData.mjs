// Export geojson data layers as: EPSG: 4326 - WGS 84

export {
  geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataLsoaPopnCentroid,
  geoDataNationalCCGBoundaries,
  dataIMD,
};
export {
  promGeoDataGP,
  promGeoDataCYCWards,
  promGeoNationalCCGBoundaries,
  promGeoDataLsoaBoundaries,
  promGeoDataLsoaPopnCentroid,
  promHospitalDetails,
  promDataIMD,
  promDataRates,
};

export { importGeoData, mapLSOAbyIMD, dataRates, dataRatesMax };

let geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataLsoaPopnCentroid,
  geoDataNationalCCGBoundaries,
  dataIMD; // not geo data but only used in map chart

let dataRates, dataRatesMax;

const mapLSOAbyIMD = new Map(); // LSOAs by the main IMD decile

const promGeoDataGP = d3.json("Data/geo/gpPracticeDetailsGeo.geojson"),
  promGeoDataCYCWards = d3.json("Data/geo/cyc_wards.topojson").then((data) => {
    geoWardBoundaries = topojson.feature(data, data.objects.cyc_wards);
  }),
  promGeoNationalCCGBoundaries = d3
    .json("Data/geo/ccg_boundary_national_202104.topojson")
    .then((data) => {
      geoDataNationalCCGBoundaries = topojson.feature(
        data,
        data.objects.ccg_boundary_national_202104
      );
    }),
  promGeoDataLsoaBoundaries = d3
    .json("Data/geo/lsoa_gp_selected_simple20cp6.topojson")
    .then((data) => {
      geoLsoaBoundaries = topojson.feature(
        data,
        data.objects.lsoa_gp_selected_original
      );
    }),
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
    .csv("Data/ratesIndicators_v1.csv", processRatesData)
    .then((data) => {
      // https://observablehq.com/@d3/d3-group
      // Rates data grouped by csv and lsoa
      dataRates = d3.group(
        data,
        (d) => d.key,
        (d) => d.practice,
        (d) => d.lsoa
      );
      // the max of the counts, used for sizing the d3 circle
      dataRatesMax = d3.rollup(
        data,
        (v) => d3.max(v, (d) => d.activityU),
        (d) => d.key,
        (d) => d.practice
      );

      /*
  dataRates.keys()

    */
    });

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

function processRatesData(d) {
  return {
    key: d.Key,
    practice: d.practiceCode,
    lsoa: d.LSOA,
    activityU: +d.activityUnique,
    activityT: +d.activityTotal,
    rate: +d.DSR,
    signf: +d.Signf,
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
