mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

const popnLegend = legendWrapper("footerMapPopn", genID.uid("popn"));

function recolourLSOA() {
  const maxValue =
    userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
      ? d3.max(
          data_popnGPLsoa
            .get(userSelections.nearestDate())
            .get(userSelections.selectedPractice)
            .values()
        )
      : d3.max(
          data_popnGPLsoa.get(userSelections.nearestDate()).get("All").values()
        );
  /*
  const rawPopn =
    userSelections.selectedPractice !== undefined && userSelections.selectedPractice !== "All Practices"
      ? [...data_popnGPLsoa.get(userSelections.nearestDate()).get(userSelections.selectedPractice).values()]
      : [...data_popnGPLsoa.get(userSelections.nearestDate()).get("All").values()];

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

  layersMapLSOA.get("voyCCGPopn").eachLayer(function (layer) {
    const lsoaCode = layer.feature.properties.lsoa;

    let value =
      userSelections.selectedPractice !== undefined &&
      userSelections.selectedPractice !== "All Practices"
        ? data_popnGPLsoa
            .get(userSelections.nearestDate())
            .get(userSelections.selectedPractice)
            .get(lsoaCode)
        : data_popnGPLsoa
            .get(userSelections.nearestDate())
            .get("All")
            .get(lsoaCode);

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
          <p>${userSelections.selectedPractice}</p>
          <p>${formatPeriod(userSelections.nearestDate())}</p>
      Pop'n: ${formatNumber(value)}
      `
    );
  });
}

// Function to initialise geo charts - run after everything has been declared...
// consider if promise (to wait for importGeoData needs to be run here...)

function refreshGeoChart() {
  lsoaBoundary.call(mapPopn, true); // call before recolourLSOA due to filters
  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
}

importPopnData.then(() => {
  initD3Charts();
});

Promise.allSettled([importPopnData, importGeoData]).then((values) => {
  addNationalTrustSites();
  initGeoCharts();
  bubbleTest = imdDomainD3();
  // Dependent on Population data...
  refreshGeoChart();
});
