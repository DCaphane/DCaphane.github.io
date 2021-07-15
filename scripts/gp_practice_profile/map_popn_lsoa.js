function recolourLSOA() {
  const maxValue =
    userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
      ? d3.max(
          dataPopulationGPLsoa
            .get(userSelections.nearestDate())
            .get(userSelections.selectedPractice)
            .values()
        )
      : d3.max(
          dataPopulationGPLsoa
            .get(userSelections.nearestDate())
            .get("All")
            .values()
        );
  /*
  const rawPopn =
    userSelections.selectedPractice !== undefined && userSelections.selectedPractice !== "All Practices"
      ? [...dataPopulationGPLsoa.get(userSelections.nearestDate()).get(userSelections.selectedPractice).values()]
      : [...dataPopulationGPLsoa.get(userSelections.nearestDate()).get("All").values()];

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
        ? dataPopulationGPLsoa
            .get(userSelections.nearestDate())
            .get(userSelections.selectedPractice)
            .get(lsoaCode)
        : dataPopulationGPLsoa
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

// Functions to initialise D3 and geo charts - run after everything has been declared...

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

Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa]).then(() => {
  initD3Charts();
});

Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa, importGeoData]).then(
  (values) => {
    initGeoCharts();
    circlePopnIMDChart = imdDomainD3();
    // Dependent on Population data...
    refreshGeoChart();

    Promise.allSettled([promHospitalDetails, promGeoDataCYCWards]).then(
      (values) => {
        // refresh Overlay Options - ensures everything is included
        refreshMapOverlayControls();
      }
    );
  }
);
