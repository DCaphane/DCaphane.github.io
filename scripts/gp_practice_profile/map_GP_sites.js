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
const basemap = Basemaps();
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

const mapSites = L.map("mapSites", {
  preferCanvas: true,
  // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
  center: [53.9581, -1.0643], // centre on York Hospital
  zoom: 11,
  minZoom: 6, // how far out eg. 0 = whole world
  maxZoom: 14, // how far in, eg. to the detail (max = 18)
  // https://leafletjs.com/reference-1.3.4.html#latlngbounds
  maxBounds: [
    [50.0, 1.6232], //south west
    [59.79, -10.239], //north east
  ],
  layers: baseMaps1["Black and White"], // default basemap that will appear first
  fullscreenControl: {
    // https://github.com/Leaflet/Leaflet.fullscreen
    pseudoFullscreen: true, // if true, fullscreen to page width and height
  },
});

const layerControl1 = L.control.layers(baseMaps1, null, {
  collapsed: true, // Whether or not control options are displayed
  sortLayers: true,
});
mapSites.addControl(layerControl1);

// Ward boundaries and ward groupings
const subLayerControl1 = L.control.layers(null, null, {
  collapsed: true,
  sortLayers: true,
});
mapSites.addControl(subLayerControl1);

const scaleBar1 = L.control.scale({
  // https://leafletjs.com/reference-1.4.0.html#control-scale-option
  position: "bottomleft",
  metric: true,
  imperial: true,
});
scaleBar1.addTo(mapSites);

const sidebarSites = sidebarLeft(mapSites, "sidebar2");

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

