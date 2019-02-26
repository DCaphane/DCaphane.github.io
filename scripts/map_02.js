var map02 = L.map("mapid_02", {
  preferCanvas: true,
  // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
  center: [53.9581, -1.0643], // centre on York Hospital
  zoom: 11,
  minZoom: 6, // how far out eg. 0 = whole world
  maxZoom: 14, // how far in, eg. to the detail (max = 18)
  // https://leafletjs.com/reference-1.3.4.html#latlngbounds
  maxBounds: [
    [50.0, 1.6232], //south west
    [59.790, -10.239] //north east
  ]
}); //.setView([53.9581, -1.0643], 11);



// Tiles
// Mapbox
L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken:
      "pk.eyJ1IjoiZGNhcGgiLCJhIjoiY2l5cnU3Mnl4MDAwMDJxbXJ6bjBiYjVwdCJ9.bCjPbVwn-V7ENeDao6XYCg"
  }
).addTo(map02);

// Open Street Map
/*
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map02);
*/

// Various Markers

// https://leafletjs.com/reference-1.4.0.html#marker

// https://leafletjs.com/reference-1.0.0.html#icon

// https://github.com/pointhi/leaflet-color-markers/tree/master/img

var defaultIcon = L.Icon.extend({
  options: {
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    shadowSize: [41, 41],
    iconAnchor: [12, 41],
    shadowAnchor: [4, 41],
    popupAnchor: [1, -34]
  }
});

var greenIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
  }),
  blueIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
  }),
  redIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
  }),
  orangeIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
  }),
  yellowIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png"
  }),
  violetIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png"
  }),
  greyIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png"
  }),
  blackIcon = new defaultIcon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png"
  });

const arrIcons = [greenIcon, blueIcon, redIcon, orangeIcon, yellowIcon, violetIcon, greyIcon, blackIcon];


var marker = L.marker([53.97915, -1.10208], {
  icon: violetIcon,
  title: "testing"
}).addTo(map02);
marker.bindPopup("<b>Hello world!</b><br>I am a popup."); //.openPopup(); // default option to have popup open on start

var circle = L.circle([53.96838,-1.08269], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500
}).addTo(map02);
circle.bindPopup("I am a circle.");

var polygon = L.polygon([
  [53.98391, -1.10746],
  [53.98508, -1.10502],
  [53.98361, -1.10620],
  [53.98239,-1.10619]
]).addTo(map02);
polygon.bindPopup("I am a polygon.");

// Pop Ups
// https://leafletjs.com/reference-1.4.0.html#popup
var popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map02);
}

map02.on("click", onMapClick);


// Used to style polygons
var wardsStyle = {
  color: "#0078ff",
  weight: 2,
  opacity: 0.8
};

// Export geojson data layers as: EPSG: 4326 - WGS 84
getGeoData("Data/cyc_wards.geojson").then(function (data) {
  L.geoJSON(data, {
    style: wardsStyle,
    onEachFeature: function (feature, layer) {
      layer.bindPopup('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
      layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
    }
  }
  ).addTo(map02);
});


// Primary Care Home (marker) default styles
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
};

// https://gis.stackexchange.com/questions/179925/leaflet-geojson-changing-the-default-blue-marker-to-other-png-files
getGeoData("Data/PrimaryCareHomes.geojson").then(function(data) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: arrIcons[feature.properties.pch_no]});
    }
  }).bindPopup(function (layer) {
    return '<h1>PCH: ' + layer.feature.properties.practice_group + '</h1>'
    + '<p>Address: ' + layer.feature.properties.address_01+ '</p>'
    ;
  })
  .addTo(map02);
});


// Function to import data
async function getGeoData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

// Function to add pop up to ward areas



// try this
// https://stackoverflow.com/questions/28534705/how-to-add-two-geojson-feature-collections-in-to-two-layer-groups