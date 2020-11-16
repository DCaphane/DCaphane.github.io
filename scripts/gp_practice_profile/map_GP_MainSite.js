const mapMain = {
  map: mapInitialise.mapInit("mapMain"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapMain.scaleBar.addTo(mapMain.map);

const sidebarPCN = mapMain.sidebar("sidebar");

homeButton.call(mapMain);

// Panes to control zIndex of geoJson layers
mapMain.map.createPane("wardBoundaryPane");
mapMain.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapMain.map.createPane("ccgBoundaryPane");
mapMain.map.getPane("ccgBoundaryPane").style.zIndex = 374;

// ccgBoundary.call(mapMain, true);
addWardGroupsToMap.call(mapMain);

// update to addPCNToMap2.call(mapMain);
addPracticeToMap.call(mapMain);

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightPractice !== "undefined") {
    map.map.removeLayer(highlightPractice);
  }

  geoDataPCN.then(function (v) {
    // geoDataGPMain
    highlightPractice = L.geoJSON(v, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.practice_code === selPractice) {
          return (markerLayer = L.marker(latlng, {
            icon: arrHighlightIcons[5],
            zIndexOffset: -5,
          }));
        }
      },
    });

    map.map.addLayer(highlightPractice);
    if (zoomToExtent) {
      map.map.fitBounds(highlightPractice.getBounds());
    }
  });
}

// Make global to enable subsequent change to overlay
const overlaysTreeMain = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

// Promise.all([geoDataPCN, geoDataCYCWards]).then(
//   (values) => {

const baseTreeMain = (function () {
  const defaultBasemap = L.tileLayer
    .provider("OpenStreetMap.Mapnik")
    .addTo(mapMain.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  return {
    label: "Base Layers <i class='fas fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fas fa-layer-group'></i>;",
        children: [
          { label: "OSM", layer: defaultBasemap },
          {
            label: "CartoDB",
            layer: L.tileLayer.provider("CartoDB.Voyager"),
          },
          {
            label: "Water Colour",
            layer: L.tileLayer.provider("Stamen.Watercolor"),
          },
        ],
      },
      {
        label: "Black & White <i class='fas fa-layer-group'></i>",
        children: [
          { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron") },
          { label: "B&W", layer: L.tileLayer.provider("Stamen.Toner") },
          {
            label: "ST Hybrid",
            layer: L.tileLayer.provider("Stamen.TonerHybrid"),
          },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

overlaysTreeMain.children[1] = overlayTrusts();

const mapControlMain = L.control.layers.tree(baseTreeMain, overlaysTreeMain, {
  // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
  collapsed: true, // Whether or not control options are displayed
  sortLayers: true,
  // namedToggle: true,
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
  closedSymbol:
    "<i class='far fa-plus-square'></i> <i class='far fa-folder'></i>", // Symbol displayed on a closed node
  openedSymbol:
    "<i class='far fa-minus-square'></i> <i class='far fa-folder-open'></i>", // Symbol displayed on an opened node
});

mapControlMain
  .addTo(mapMain.map)
  // .setOverlayTree(overlaysTreeMain)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true); // true to collapse the overlays tree
// .expandSelected(true); // expand selected option in the overlays tree
