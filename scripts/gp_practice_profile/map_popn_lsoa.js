mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

const popnLegend = legendWrapper("footerMapPopn", "popnLegend");

lsoaBoundary.call(mapPopn, true);
gpSites();

// (function addSitesToMap() {
//   const maps = [mapSites]; // maps to add sites to: mapPopn

//   for (const map of maps) {
//     gpSites.call(map);
//   }

//   // Add to overlay control
//   // const ol = overlayPCNs(layersMapGPSites);
//   // overlaysTreeSites.children[2] = ol;
//   // overlaysTreePopn.children[4] = ol;

//   // mapControlSites
//   // .setOverlayTree(overlaysTreeSites)
//   // .collapseTree() // collapse the baselayers tree
//   // // .expandSelected() // expand selected option in the baselayer
//   // .collapseTree(true);
// })();

Promise.all([
  dataPopulationGP,
  dataPopulationGPLsoa,
  geoDataLsoaBoundaries,
]).then((v) => {
  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
  imdDomainD3();
});

// addPracticeToMap(mapPopn, layerControl2);
// geoDataGPMain.then(function(v){
//   addPracticeToMap(v, mapPopn, layerControl2)
// })

/*
GP by LSOA population data published quarterly
Use the below to match the selected dates to the quarterly dates
Function to determine nearest value in array
*/
const nearestValue = (arr, val) =>
  arr.reduce(
    (p, n) => (Math.abs(p) > Math.abs(n - val) ? n - val : p),
    Infinity
  ) + val;

function recolourLSOA() {
  const nearestDate = nearestValue(arrayGPLsoaDates, selectedDate);
  const maxValue =
    selectedPractice !== undefined && selectedPractice !== "All Practices"
      ? d3.max(data_popnGPLsoa.get(nearestDate).get(selectedPractice).values())
      : d3.max(data_popnGPLsoa.get(nearestDate).get("All").values());
  /*
  const rawPopn =
    selectedPractice !== undefined && selectedPractice !== "All Practices"
      ? [...data_popnGPLsoa.get(nearestDate).get(selectedPractice).values()]
      : [...data_popnGPLsoa.get(nearestDate).get("All").values()];

  const maxValue = d3.max(rawPopn);
  const colour = d3.scaleSequentialQuantile()
    .domain(rawPopn)
  .interpolator(d3.interpolateBlues)
*/
  filterFunctionLsoa.call(mapPopn, true);
  // refreshMapPopnLegend(maxValue);
  popnLegend.legend({
    color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
    title: "Population",
    width: 600,
    marginLeft: 50,
  });

  geoDataLsoaBoundaries.then(function () {
    layersMapLSOA.get("voyCCGPopn").eachLayer(function (layer) {
      const lsoaCode = layer.feature.properties.lsoa;

      let value =
        selectedPractice !== undefined && selectedPractice !== "All Practices"
          ? data_popnGPLsoa.get(nearestDate).get(selectedPractice).get(lsoaCode)
          : data_popnGPLsoa.get(nearestDate).get("All").get(lsoaCode);

      if (value === undefined) {
        value = 0;
      }

      if (value > minPopulationLSOA) {
        layer.setStyle({
          // https://github.com/d3/d3-scale-chromatic
          fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
          fillOpacity: 0.9,
          weight: 1, // border
          color: "white", // border
          opacity: 1,
          // dashArray: "3",
        });
      } else {
        layer.setStyle({
          // no (transparent) background
          fillColor: "#ff0000", // background
          fillOpacity: 0, // transparent
          weight: 0, // border
          color: "red", // border
          opacity: 0,
        });
      }

      layer.bindPopup(
        `<h3>${layer.feature.properties.lsoa}</h3>
          <p>${selectedPractice}</p>
          <p>${formatPeriod(nearestDate)}</p>
      Pop'n: ${formatNumber(value)}
      `
      );
    });
  });
}
