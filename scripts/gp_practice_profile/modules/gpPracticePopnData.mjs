import { parseDate, parseDate2 } from "../../modules/formatCharts/standard.mjs";

export {
  dataPopulationGP,
  dataPopulationGPSummary,
  dataPopulationGPLsoa,
  arrayGPLsoaDates,
  uniquePractices,
};

export { promDataGPPopn, promDataGPPopnLsoa };

let dataPopulationGP,
  dataPopulationGPSummary,
  dataPopulationGPLsoa,
  arrayGPLsoaDates,
  uniquePractices; // sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object

const promDataGPPopn = d3
  .csv("Data/GP_Practice_Populations_slim.csv", processDataGPPopulation)
  .then((data) => {
    dataPopulationGP = data;

    dataPopulationGPSummary = d3.rollup(
      dataPopulationGP,
      (v) => d3.sum(v, (d) => d.Total_Pop),
      (d) => +d.Period,
      (d) => d.Practice
    );

    // List of GP Practice codes (sorted A-Z) for use in drop down ------------------------
    uniquePractices = [...new Set(data.map((item) => item.Practice))].sort();

    return data;
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
