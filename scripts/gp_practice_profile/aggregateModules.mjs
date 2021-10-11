import createTooltip from "../modules/components/tooltip.mjs";
import generateUniqueID from "../modules/functions/uniqueID.mjs";
export { default as legendWrapper } from "../modules/formatCharts/canvasLegend.mjs";
import sidebarDefaults from "./modules/gpPracticeText.mjs";
export { titleCase } from "../modules/functions/standard.mjs";
export {
  styleCCG,
  styleLsoa,
  styleWard,
  wardsStyle,
  wardsStyleLabels,
} from "../modules/formatMaps/boundaryStyles.mjs";
export { default as pcnFormatting } from "../modules/formatMaps/pcnFormatting.mjs";
export {
  chtWidthStd,
  chtHeightStd,
  chtWidthWide,
  chtHeightTall,
  chtHeightShort,
  margin,
  parseDate,
  parseDate2,
  formatPeriod,
  formatNumber,
  formatPercent1dp,
  formatPercent,
} from "../modules/formatCharts/standard.mjs";
export {
  promGeoDataGP,
  promGeoDataCYCWards,
  promGeoNationalCCGBoundaries,
  promGeoDataLsoaBoundaries,
  promGeoDataLsoaPopnCentroid,
  promHospitalDetails,
  promDataIMD,
  promDataRates,
  geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataLsoaPopnCentroid,
  geoDataNationalCCGBoundaries,
  dataIMD,
  importGeoData,
  mapLSOAbyIMD,
  dataRates,
  dataRatesMax,
} from "./modules/geoData.mjs";

export {
  dataPopulationGP,
  dataPopulationGPSummary,
  dataPopulationGPLsoa,
  arrayGPLsoaDates,
  uniquePractices,
  promDataGPPopn,
  promDataGPPopnLsoa,
} from "./modules/gpPracticePopnData.mjs";

export { userSelections } from "./modules/userSelections.mjs";
// export { default as initTrendChart } from "./modules/d3Charts/gpPopnTrend.mjs"
// export { default as initPopnBarChart } from "./modules/d3Charts/gpPopnBar.mjs"
// export {default as initChartDemog} from "./modules/d3Charts/demographicBar.mjs"
export {
  trendChart,
  barChart,
  demographicChart,
  initD3Charts,
} from "./modules/d3Charts/initD3Charts.mjs";

export const sidebarContent = sidebarDefaults();
export const newTooltip = createTooltip();
export const genID = generateUniqueID(); // genID.uid
export const practiceLookup = new Map();
