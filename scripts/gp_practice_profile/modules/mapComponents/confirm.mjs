import {
  promGeoDataGP,
  promDataGPPopn,
  promDataGPPopnLsoa,
  promHospitalDetails,
  promGeoDataCYCWards,
  promGeoDataLsoaBoundaries,
  promDataIMD,
  importGeoData,
  gpDetails,
  initD3Charts,
  filterFunctionLsoa,
  mapsWithGPMain,
  mapD3Bubble,
  refreshMapOverlayControls,
    imdDomainD3,
    updatePopUpText,
} from "../../aggregateModules.mjs";

let circlePopnIMDChart;
// Functions to create the charts runs last - after all the data is available
Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa]).then(() => {
  initD3Charts();

  Promise.allSettled([importGeoData]).then(() => {
    // The following require the above population data and the geoData
    circlePopnIMDChart = imdDomainD3({
      id: "selD3Leaf",
      thisMap: mapD3Bubble.map,
    });
    filterFunctionLsoa(true);
    //   .then(() => {
    //   recolourPopnLSOA();
    //   recolourIMDLayer(imdDomainShort);
    // });

    Promise.allSettled([promGeoDataGP, gpDetails]).then(() => {
      // Main practice site popup text. Requires practiceLookup
      // updatePopUpText(mapsWithGPMain.get(mapMain.map)[0]) // can be used to update an individual map
      for (const value of mapsWithGPMain.values()) {
        updatePopUpText(value[0]);
      }
    });
    // not sure if this is necessary...
    Promise.allSettled([
      promHospitalDetails,
      promGeoDataCYCWards,
      promGeoDataLsoaBoundaries,
      promDataIMD,
    ]).then(() => {
      // refreshes the overlaysTree to ensure everything is included and collapsed
      refreshMapOverlayControls();
    });
  });
});

export { circlePopnIMDChart };
