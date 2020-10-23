const baseMapMain = Object.create(Basemaps);

const mapMain = {
  map: mapInitialise.mapInit("mapMain", baseMapMain["Black and White"]),
  layerControl: mapInitialise.layerControl(baseMapMain),
  subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName)
  }
};

mapMain.map.addControl(mapMain.layerControl);

// Ward boundaries and ward groupings
mapMain.map.addControl(mapMain.subLayerControl);

mapMain.scaleBar.addTo(mapMain.map);

const sidebarPCN = mapMain.sidebar("sidebar");

homeButton.call(mapMain);
yorkTrust.call(mapMain);

// Panes to control zIndex of geoJson layers
mapMain.map.createPane("wardBoundaryPane");
mapMain.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapMain.map.createPane("ccg03QBoundaryPane");
mapMain.map.getPane("ccg03QBoundaryPane").style.zIndex = 374;

geoDataCCGBoundary.then(function (v) {
  ccgBoundary(v, mapMain, true); // .map, subLayerControl
});

geoDataCYCWards.then(function (v) {
  addWardData(v, mapMain);
});

geoDataGPMain.then(function (v) {
  addPracticeToMap(v, mapMain);
});

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightPractice !== "undefined") {
    map.map.removeLayer(highlightPractice);
  }

  geoDataGPMain.then(function (v) {
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
