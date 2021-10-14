import createTooltip from "../modules/components/tooltip.mjs";
export { genID } from "../modules/functions/uniqueID.mjs";
export { default as legendWrapper } from "../modules/formatCharts/canvasLegend.mjs";
export { sidebarContent } from "./modules/gpPracticeText.mjs";

export const newTooltip = createTooltip();

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

export { practiceLookup, gpDetails } from "./modules/gpPracticeDropdown.mjs";

export { default as userSelections } from "./modules/userSelections.mjs";

export {
  trendChart,
  barChart,
  demographicChart,
  initD3Charts,
} from "./modules/d3Charts/initD3Charts.mjs";

export {
  refreshChartsPostPracticeChange,
  refreshChartsPostDateChange,
} from "./modules/refreshCharts.mjs";

export {
  mapInitialise,
  mapOfMaps,
  mapsWithGPMain,
  mapsWithGPSites,
  mapsWithLSOA,
  mapsWithLSOAFiltered,
} from "./modules/mapInitialise.mjs";

export {
  trustSitesLoc,
  updatePopUpText,
  refreshMapOverlayControls,
  defaultHome,
  selectedTrustMarker,
  moveableMarker,
  yorkTrust,
  updateBouncingMarkers,
  styleLsoaOrangeOutline,
  highlightFeature,
  overlayPCNs,
  overlayTrusts,
  overlayWards,
  overlayLSOAbyCCG,
  overlayLSOAbyIMD,
  overlayAddSeparator,
} from "./modules/mapComponents/mapComponents.mjs";

export { refreshFilteredGPSitesOverlays } from "./modules/mapComponents/filterGPSites.mjs";
export { circlePopnIMDChart } from "./modules/mapComponents/confirm.mjs";
export {
  mapStore,
  mapMain,
  mapIMD,
  mapD3Bubble,
} from "./modules/maps/initMaps.mjs";

export { recolourIMDLayer } from "./modules/mapComponents/recolourIMDLayer.mjs";
export {
  recolourPopnLSOAIMD,
  imdLegend,
} from "./modules/mapComponents/recolourPopnLSOAIMD.mjs";

export {
  imdDomainD3,
  mapIMDDomain,
  dataRatesLookup,
} from "./modules/functions/imdDomainD3.mjs";
export {
  imdDomainDesc,
  imdDomainShort,
} from "./modules/functions/imdDropdown.mjs";

export {
  filterFunctionLsoa,
  mapsFilteredLSOA,
} from "./modules/filterFunctionsLSOA.mjs";

export {
  maxPopulation,
  actualPopulation,
} from "./modules/functions/population.mjs";

// ####################### the following need to go in their own module - here for testing only...
// Populations smaller than this to be ignored
export const minPopulationLSOA = 20;

// Keep track of maps
// Stores the map reference and the home location

// Used to keep track of the map overlay for subsequent refresh
export const mapOverlays = new Map();

// These are hard coded to provide a lookup from the key in the source data to the description
export const dataRatesKeys = new Map();
dataRatesKeys.set("AE_01", "A&E Demo");
dataRatesKeys.set("selbyUTC", "Selby UTC");
dataRatesKeys.set("testNew", "Long Description testNew");
