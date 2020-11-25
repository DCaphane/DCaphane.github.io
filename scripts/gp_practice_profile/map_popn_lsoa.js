mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

lsoaBoundary.call(mapPopn, true);

// GP Practice Sites - coded by PCN
geoDataPCNSites.then(function (v) {
  pcnSites.call(mapPopn);
});

Promise.all([
  dataPopulationGP,
  dataPopulationGPLsoa,
  geoDataLsoaBoundaries,
]).then((v) => {
  recolourLSOA();
  recolourIMDLayer();
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
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

  filterFunctionLsoa.call(mapPopn, true);

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
          fillColor: d3.interpolateYlGnBu(value / maxValue),
          fillOpacity: 0.9,
          weight: 1, // border
          color: "red", // border
          opacity: 1,
          dashArray: "3",
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
