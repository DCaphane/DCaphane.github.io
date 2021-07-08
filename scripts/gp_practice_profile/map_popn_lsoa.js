const mapPopn = mapInitialise("mapPopnLSOA");
mapPopn.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapPopn.homeButton();

const sidebarPopn = mapPopn.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarPopn.addPanel(sidebarContent.panelOverview);

const popnLegend = legendWrapper("footerMapPopn", genID.uid("popn"));

// Make global to enable subsequent change to overlay
const overlaysTreePopn = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const baseTreePopn = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stamen.TonerHybrid")
    .addTo(mapPopn.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  // http://leaflet-extras.github.io/leaflet-providers/preview/
  return {
    label: "Base Layers <i class='fa-solid fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fa-solid fa-layer-group'></i>",
        children: [
          { label: "OSM", layer: L.tileLayer.provider("OpenStreetMap.Mapnik") },
          {
            label: "OSM HOT",
            layer: L.tileLayer.provider("OpenStreetMap.HOT"),
          },
          // { label: "CartoDB", layer: L.tileLayer.provider("CartoDB.Voyager") },
          {
            label: "Water Colour",
            layer: L.tileLayer.provider("Stamen.Watercolor"),
          },
          { label: "Bright", layer: L.tileLayer.provider("Stadia.OSMBright") },
          { label: "Topo", layer: L.tileLayer.provider("OpenTopoMap") },
        ],
      },
      {
        label: "Black & White <i class='fa-solid fa-layer-group'></i>",
        children: [
          // { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron") },
          {
            label: "High Contrast",
            layer: L.tileLayer.provider("Stamen.Toner"),
          },
          {
            label: "Grey",
            layer: L.tileLayer.provider("Stadia.AlidadeSmooth"),
          },
          { label: "ST Hybrid", layer: defaultBasemap },
          {
            label: "Dark",
            layer: L.tileLayer.provider("Stadia.AlidadeSmoothDark"),
          },
          {
            label: "Jawg Matrix",
            layer: L.tileLayer.provider("Jawg.Matrix", {
              // // Requires Access Token
              accessToken:
                "phg9A3fiyZq61yt7fQS9dQzzvgxFM5yJz46sJQgHJkUdbdUb8rOoXviuaSnyoYQJ", //  biDemo
            }),
          },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

overlaysTreePopn.children[0] = overlayTrusts(); // Add selected hospitals to overlay

const mapControlPopn = L.control.layers.tree(baseTreePopn, overlaysTreePopn, {
  // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
  collapsed: true, // Whether or not control options are displayed
  sortLayers: true,
  // namedToggle: true,
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
  closedSymbol:
    "<i class='fa-solid fa-square-plus'></i> <i class='fa-solid fa-folder'></i>", // Symbol displayed on a closed node
  openedSymbol:
    "<i class='fa-solid fa-square-minus'></i> <i class='fa-solid fa-folder-open'></i>", // Symbol displayed on an opened node
});

mapControlPopn.addTo(mapPopn.map).collapseTree().collapseTree(true);

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

  // refresh Overlay Options - ensures everything is loaded
  refreshMapOverlayControls();
}

function refreshGeoChart() {
  lsoaBoundary.call(mapPopn, true); // call before recolourLSOA due to filters
  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
  overlayTrustsNational();
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
  }
);
