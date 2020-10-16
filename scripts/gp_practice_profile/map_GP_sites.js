// Open Street Map (osm)
// https://leaflet-extras.github.io/leaflet-providers/preview/

// Tile Baselayers (Backgrounds)

// Mapbox
/*
let tile_MB = L.tileLayer(
	'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
	{
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken:
			'addKeyHere'
	}
);
*/

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

const mapSites = mapInitialise.mapInit("mapSites", CartoDB_Voyager1);

const layerControl1 = mapInitialise.layerControl(baseMaps1);
mapSites.addControl(layerControl1);

// Ward boundaries and ward groupings
const subLayerControl1 = mapInitialise.subLayerControl();
mapSites.addControl(subLayerControl1);

const scaleBar1 = mapInitialise.scaleBar("bottomleft");
scaleBar1.addTo(mapSites);

const sidebarSites = mapInitialise.sidebarLeft(mapSites, "sidebar2");

homeButton(mapSites);
yorkTrust(mapSites);

// Panes to control zIndex of geoJson layers
mapSites.createPane("wardBoundaryPane");
mapSites.getPane("wardBoundaryPane").style.zIndex = 375;

mapSites.createPane("ccg03QBoundaryPane");
mapSites.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
ccgBoundary(mapSites, subLayerControl1);
wardData(mapSites, subLayerControl1);

getGeoData("Data/geo/pcn/primary_care_network_sites.geojson").then(function (
  data
) {
  siteData = data;
  defaultSites = L.geoJson(data, {
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      //console.log(layer.feature.properties.pcn_name)
      subCategories[layer.feature.properties.pcn_name] = null;
    },
  }).addTo(mapSites);
  mapSites.fitBounds(defaultSites.getBounds());
});
