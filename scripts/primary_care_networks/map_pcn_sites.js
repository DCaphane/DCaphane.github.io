const baseMapPCNSite = Object.create(Basemaps);

const mapPCNSite = {
  map: mapInitialise.mapInit("mapPCNSite", baseMapPCNSite.Default),
  layerControl: mapInitialise.layerControl(baseMapPCNSite),
  subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};


mapPCNSite.map.addControl(mapPCNSite.layerControl);

// Ward boundaries and ward groupings
mapPCNSite.map.addControl(mapPCNSite.subLayerControl);

mapPCNSite.scaleBar.addTo(mapPCNSite.map);

const sidebarSites = mapPCNSite.sidebar("sidebarPCNSites");

homeButton.call(mapPCNSite);
yorkTrust.call(mapPCNSite);

// Panes to control zIndex of geoJson layers
mapPCNSite.map.createPane("wardBoundaryPane");
mapPCNSite.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapPCNSite.map.createPane("ccg03QBoundaryPane");
mapPCNSite.map.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
geoDataCCGBoundary.then(function (v) {
  ccgBoundary(v, mapPCNSite, true);
});

geoDataCYCWards.then(function (v) {
  addWardData(v, mapPCNSite);
});

geoDataPCNSites.then(function (v) {
  pcnSites2.call(mapPCNSite);
});


function pcnSites2(zoomToExtent = false) {
  const map = this.map;
  geoDataPCNSites.then(function (v) {
    defaultSites = L.geoJson(v, {
      pointToLayer: pcnFormatting,
      // onEachFeature: function (feature, layer) {
      //   //console.log(layer.feature.properties.pcn_name)
      //   subCategories[layer.feature.properties.pcn_name] = null;
      // },
    });

    defaultSites.addTo(map);
    // mapWithSites.set(map, sitesLayer);
    if (zoomToExtent) {
      map.fitBounds(defaultSites.getBounds());
    }
  });
}


// getGeoData("Data/geo/pcn/primary_care_network_sites.geojson").then(function (
//   data
// ) {
//   siteData = data;
//   defaultSites = L.geoJson(data, {
//     pointToLayer: pcnFormatting,
//     onEachFeature: function (feature, layer) {
//       //console.log(layer.feature.properties.pcn_name)
//       subCategories[layer.feature.properties.pcn_name] = null;
//     },
//   }).addTo(mapPCNSite.map);
//   mapPCNSite.map.fitBounds(defaultSites.getBounds());
// });
