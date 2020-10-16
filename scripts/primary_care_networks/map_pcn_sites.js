const osm_bw1 = basemap.osm_bw();
const CartoDB_Voyager1 = basemap.CartoDB_Voyager();
const Stamen_Toner1 = basemap.Stamen_Toner();
const emptyTile1 = basemap.emptyTile();

const baseMaps1 = {
  "Black and White": osm_bw1,
  Default: CartoDB_Voyager1,
  Stamen_Toner: Stamen_Toner1,
  "No Background": emptyTile1,
};

const map03 = mapInitialise.mapInit("mapid_03", baseMaps1["Black and White"]);

const layerControl2 = mapInitialise.layerControl(baseMaps1);
map03.addControl(layerControl2);

// Ward boundaries and ward groupings
const subLayerControl2 = mapInitialise.subLayerControl();
map03.addControl(subLayerControl2);

const scaleBar2 = mapInitialise.scaleBar("bottomleft");
scaleBar2.addTo(map03);

var sidebarSites = mapInitialise.sidebarLeft(map03, "sidebar2");

homeButton(map03);
yorkTrust(map03);

// Panes to control zIndex of geoJson layers
map03.createPane("wardBoundaryPane");
map03.getPane("wardBoundaryPane").style.zIndex = 375;

map03.createPane("ccg03QBoundaryPane");
map03.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
ccgBoundary(map03, subLayerControl2);
wardData(map03, subLayerControl2);

getGeoData("Data/geo/pcn/primary_care_network_sites.geojson").then(function(
  data
) {
  siteData = data;
  defaultSites = L.geoJson(data, {
    pointToLayer: pcnFormatting,
    onEachFeature: function(feature, layer) {
      //console.log(layer.feature.properties.pcn_name)
      subCategories[layer.feature.properties.pcn_name] = null;
    }
  }).addTo(map03);
  map03.fitBounds(defaultSites.getBounds());
});
