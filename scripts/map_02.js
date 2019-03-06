let categories = {},
	category,
	overlayMaps = {};
// Tile Baselayers

// Mapbox
/*
let tile_MB = L.tileLayer(
	'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
	{
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken:
			'pk.eyJ1IjoiZGNhcGgiLCJhIjoiY2l5cnU3Mnl4MDAwMDJxbXJ6bjBiYjVwdCJ9.bCjPbVwn-V7ENeDao6XYCg'
	}
);
*/

// Open Street Map
// https://leaflet-extras.github.io/leaflet-providers/preview/

var OpenStreetMap_BlackAndWhite = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

let Stamen_Toner  = L.tileLayer(
	'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}',
	{
		attribution:
			'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	}
);

let baseMaps = {
  'B&W': OpenStreetMap_BlackAndWhite,
  Plain: CartoDB_Voyager,
  Simple: Stamen_Toner
};

let map02 = L.map('mapid_02', {
	preferCanvas: true,
	// https://www.openstreetmap.org/#map=9/53.9684/-1.0827
	center: [53.9581, -1.0643], // centre on York Hospital
	zoom: 11,
	minZoom: 6, // how far out eg. 0 = whole world
	maxZoom: 14, // how far in, eg. to the detail (max = 18)
	// https://leafletjs.com/reference-1.3.4.html#latlngbounds
	maxBounds: [
		[50.0, 1.6232], //south west
		[59.79, -10.239] //north east
	],
  layers: [CartoDB_Voyager] // default basemap that will appear first
});

var layerControl = L.control
	.layers(baseMaps, null, {
		collapsed: true // Whether or not control options are displayed
	})
	.addTo(map02);

var scaleBar = L.control
	.scale({
		// https://leafletjs.com/reference-1.4.0.html#control-scale-option
		position: 'bottomleft',
		metric: true,
		imperial: true
	})
	.addTo(map02);

// Used to style polygons
var wardsStyle = {
	color: '#0078ff',
	weight: 2,
	opacity: 0.6
};

let wardLayer;
// Export geojson data layers as: EPSG: 4326 - WGS 84
getGeoData('Data/cyc_wards.geojson')
	.then(function(data) {
		wardLayer = L.geoJSON(data, {
			style: wardsStyle,
			onEachFeature: function(feature, layer) {
				layer.bindPopup(
					'<h1>' +
						feature.properties.wd17nm +
						'</h1><p>Code: ' +
						feature.properties.wd17cd +
						'</p>'
				);
				// layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
			}
    }).addTo(map02);
    layerControl.addOverlay(wardLayer, 'wards_cyc'); // Adds an overlay (checkbox entry) with the given name to the control.
	});


getGeoData('Data/PrimaryCareHomes.geojson').then(function(data) {
	addDataToMap(data, map02);
});


// let allItems;
function addDataToMap(data, map) {
	L.geoJson(data, {
		pointToLayer: function(feature, latlng) {
			return L.marker(latlng, {
				icon: arrIcons[feature.properties.pch_no - 1]
			});
		},
		onEachFeature: function(feature, layer) {
			var popupText =
				'<h1>PCH: ' +
				layer.feature.properties.practice_group +
				'</h1>' +
				'<p>Address: ' +
				layer.feature.properties.address_01 +
				'</p>';
			layer.bindPopup(popupText);

			category = feature.properties.pch_no; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
			// Initialize the category array if not already set.
			if (typeof categories[category] === 'undefined') {
				categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
				layerControl.addOverlay(categories[category], category);
			}
			categories[category].addLayer(layer);
		}
	});
}

// Function to import data
async function getGeoData(url) {
	let response = await fetch(url);
	let data = await response.json();
	return data;
}

// Pop Ups
// https://leafletjs.com/reference-1.4.0.html#popup
var popup = L.popup();

function onMapClick(e) {
	popup
		.setLatLng(e.latlng)
		.setContent('You clicked the map at ' + e.latlng.toString())
		.openOn(map02);
}

// map02.on("click", onMapClick);

/* Useful Links

  https://plnkr.co/edit/H6E6q0vKwb3RPOZBWs27?p=preview

*/
