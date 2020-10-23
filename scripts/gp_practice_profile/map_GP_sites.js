const baseMapSites = Object.create(Basemaps);

const mapSites = {
  map: mapInitialise.mapInit("mapSites", baseMapSites.Default),
  layerControl: mapInitialise.layerControl(baseMapSites),
  subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapSites.map.addControl(mapSites.layerControl);

// Ward boundaries and ward groupings
mapSites.map.addControl(mapSites.subLayerControl);

mapSites.scaleBar.addTo(mapSites.map);

const sidebarSites = mapSites.sidebar("sidebar2");

homeButton.call(mapSites);
yorkTrust.call(mapSites);

// Panes to control zIndex of geoJson layers
mapSites.map.createPane("wardBoundaryPane");
mapSites.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapSites.map.createPane("ccg03QBoundaryPane");
mapSites.map.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
geoDataCCGBoundary.then(function (v) {
  ccgBoundary(v, mapSites, true);
});

geoDataCYCWards.then(function (v) {
  addWardData(v, mapSites);
});

// GP Practice Sites - coded by PCN
geoDataPCNSites.then(function (v) {
  pcnSites.call(mapSites);
});
