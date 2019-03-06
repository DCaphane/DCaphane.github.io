let categories = {},
  category,
  categoryArray;
overlayMaps = {};
// Tile Baselayers

// Mapbox
let tile_MB = L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken:
      "pk.eyJ1IjoiZGNhcGgiLCJhIjoiY2l5cnU3Mnl4MDAwMDJxbXJ6bjBiYjVwdCJ9.bCjPbVwn-V7ENeDao6XYCg"
  }
);

// Open Street Map
// https://leaflet-extras.github.io/leaflet-providers/preview/
let tile_OSM01 = L.tileLayer(
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}",
  {
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abcd",
    minZoom: 0,
    maxZoom: 20,
    ext: "png"
  }
);

let baseMaps = {
  tile_MB: tile_MB,
  tile_OSM01: tile_OSM01
};

let map02 = L.map("mapid_02", {
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
  layers: [tile_OSM01]
});

var layerControl = L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map02);

var scaleBar = L.control
  .scale({
    // https://leafletjs.com/reference-1.4.0.html#control-scale-option
    position: "bottomleft",
    metric: true,
    imperial: true
  })
  .addTo(map02);

// Used to style polygons
var wardsStyle = {
  color: "#0078ff",
  weight: 2,
  opacity: 0.6
};

let wardLayer;
// Export geojson data layers as: EPSG: 4326 - WGS 84
getGeoData("Data/cyc_wards.geojson")
  .then(function(data) {
    wardLayer = L.geoJSON(data, {
      style: wardsStyle,
      onEachFeature: function(feature, layer) {
        layer.bindPopup(
          "<h1>" +
            feature.properties.wd17nm +
            "</h1><p>Code: " +
            feature.properties.wd17cd +
            "</p>"
        );
        // layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
      }
    }).addTo(map02);
  })
  .then(() => {
    layerControl.addOverlay(wardLayer, "wards_cyc"); // Adds an overlay (checkbox entry) with the given name to the control.
  });

// https://gis.stackexchange.com/questions/179925/leaflet-geojson-changing-the-default-blue-marker-to-other-png-files
// https://leafletjs.com/examples/layers-control/
// https://stackoverflow.com/questions/49196123/how-can-i-add-multiple-overlay-layers-in-leaflet-js-having-three-categories-at-t
let allItems;
getGeoData("Data/PrimaryCareHomes.geojson")
  .then(function(data) {
    allItems = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: arrIcons[feature.properties.pch_no - 1]
        })//.addTo(map02);
      },
      onEachFeature: onEachFeature
    })//.addTo(map02);
  })
  .then(() =>{
    // Option to turn on/ off all points at once
    layerControl.addOverlay(allItems, "All");
  })  
  .then(() => {
    for (var categoryName in categories) {
      categoryArray = categories[categoryName];
      //overlayMaps[categoryName] = L.layerGroup(categoryArray).addTo(map02);
      layerControl.addOverlay(L.layerGroup(categoryArray), categoryName);
      console.log(L.layerGroup(categoryArray))
    }
  });

/*
categories {object} used to create an object with key = category, value is array
category variable, used to store the distinct feature eg. phc_no, practice_group etc
categoryArray
*/

function onEachFeature(feature, layer) {
  // Use function onEachFeature in your L.geoJson initialization.
  layer.bindPopup(
    "<h1>PCH: " +
      layer.feature.properties.practice_group +
      "</h1>" +
      "<p>Address: " +
      layer.feature.properties.address_01 +
      "</p>"
  );
  //layer.setIcon(arrIcons[feature.properties.pch_no - 1]);

  category = feature.properties.pch_no; // practice_group
  // Initialize the category array if not already set.
  if (typeof categories[category] === "undefined") {
    categories[category] = [];
  }
  categories[category].push(layer);
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
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map02);
}

// map02.on("click", onMapClick);


/* Useful Links


// this works
https://stackoverflow.com/questions/39545791/leaflet-map-getting-specific-data-of-geojson-file-with-button
  https://plnkr.co/edit/H6E6q0vKwb3RPOZBWs27?p=preview

https://gis.stackexchange.com/questions/264788/creating-toggle-layers-in-leaflet
  https://plnkr.co/edit/rf2JDe3RfF9p8Xm3Ga98?p=preview



*/