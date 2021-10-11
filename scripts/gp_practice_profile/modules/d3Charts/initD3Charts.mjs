import initTrendChart from "./gpPopnTrend.mjs";
import initPopnBarChart from "./gpPopnBar.mjs";
import initChartDemog from "./demographicBar.mjs";
import {dataPopulationGP} from "../../aggregateModules.mjs"

let trendChart, barChart, demographicChart;
// create a separate module here that imports d3 modules - only this function needs to be imported here
// trend bar and demographic would need to be accessible
function initD3Charts() {
  trendChart = initTrendChart(dataPopulationGP, "cht_PopTrend");
  trendChart.chartTrendDraw();

  barChart = initPopnBarChart(dataPopulationGP, "cht_PopBar");
  barChart.fnRedrawBarChart();

  demographicChart = initChartDemog(dataPopulationGP, "cht_PopDemo");
  demographicChart.updateChtDemog();
}

export { trendChart, barChart, demographicChart, initD3Charts };
