var map01 = L.map("mapid_01", {
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

// Panes to control zIndex of geoJson layers
map01.createPane('geojsonBoundaryPane');
map01.getPane('geojsonBoundaryPane').style.zIndex = 375;


// Tiles

/* Mapbox
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
).addTo(map01);
*/

// Open Street Map

L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map01);


var circle = L.circle([53.96838,-1.08269], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500
}).addTo(map01);
circle.bindPopup("York Hospital");

var polygon = L.polygon([
  [53.98391, -1.10746],
  [53.98508, -1.10502],
  [53.98361, -1.10620],
  [53.98239,-1.10619]
]).addTo(map01);
polygon.bindPopup("The lake");

// Pop Ups
// https://leafletjs.com/reference-1.4.0.html#popup
var popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map01);
}

map01.on("click", onMapClick);


// Used to style ward boundaries
var wardsStyle = {
  color: "#0078ff",
  weight: 2,
  opacity: 0.8
};

// Export geojson data layers as: EPSG: 4326 - WGS 84
getGeoData("Data/cyc_wards.geojson").then(function (data) {
  L.geoJSON(data, {
    style: wardsStyle,
    pane: 'geojsonBoundaryPane',
    onEachFeature: function (feature, layer) {
      layer.bindPopup('<h1>' + feature.properties.wd17nm +
        '</h1><p>name: ' + feature.properties.wd17cd + '</p>');
      layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');

    }
  }
  ).addTo(map01);
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

getGeoData("Data/PrimaryCareHomes.geojson").then(function(data) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    style: function(feature) {
        switch (feature.properties.pch_no) {
            // http://colorbrewer2.org/#type=qualitative&scheme=Set1&n=7
            case 1: return {color: "#e41a1c", fillColor: "#e41a1c"};
            case 2: return {color: "#377eb8", fillColor: "#377eb8"};
            case 3: return {color: "#4daf4a", fillColor: "#4daf4a"};
            case 4: return {color: "#984ea3", fillColor: "#984ea3"};
            case 5: return {color: "#ff7f00", fillColor: "#ff7f00"};
            case 6: return {color: "#ffff33", fillColor: "#ffff33"};
            case 7: return {color: "#a65628", fillColor: "#a65628"};
        }
    }
  }).bindPopup(function (layer) {
    return '<h1>PCH: ' + layer.feature.properties.practice_group + '</h1>'
    + '<p>Address: ' + layer.feature.properties.address_01+ '</p>'
    ;
  })
  .addTo(map01);
});


// Function to import data
async function getGeoData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

// try this
// https://stackoverflow.com/questions/28534705/how-to-add-two-geojson-feature-collections-in-to-two-layer-groups