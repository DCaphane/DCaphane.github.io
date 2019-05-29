// Tile Baselayers

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

// Open Street Map
// https://leaflet-extras.github.io/leaflet-providers/preview/

const OpenStreetMap_BlackAndWhite = L.tileLayer(
  "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
  {
    minZoom: 0,
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
);

const CartoDB_Voyager = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    minZoom: 0,
    maxZoom: 19
  }
);

// http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
let Stamen_Toner = L.tileLayer(
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

// https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
let emptyTile = L.tileLayer("", {
  zoom: 0,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let baseMaps = {
  "B&W": OpenStreetMap_BlackAndWhite,
  Plain: CartoDB_Voyager,
  Simple: Stamen_Toner,
  "No Background": emptyTile
};

let map02 = L.map("map", {
  preferCanvas: true,
  // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
  center: [53.9581, -1.0643], // centre on York Hospital
  zoom: 9,
  minZoom: 6, // how far out eg. 0 = whole world
  maxZoom: 18, // how far in, eg. to the detail (max = 18)
  // https://leafletjs.com/reference-1.3.4.html#latlngbounds
  maxBounds: [
    [50.0, 1.6232], //south west
    [59.79, -10.239] //north east
  ],
  layers: [CartoDB_Voyager], // default basemap that will appear first
  fullscreenControl: {
    // https://github.com/Leaflet/Leaflet.fullscreen
    pseudoFullscreen: true // if true, fullscreen to page width and height
  }
});

// Background and Sites layers
const layerControl = L.control
  .layers(baseMaps, null, {
    collapsed: true // Whether or not control options are displayed
  })
  .addTo(map02);

// Ward boundaries and ward groupings
const subLayerControl = L.control
  .layers(null, null, {
    collapsed: true
  })
  .addTo(map02);

const scaleBar = L.control
  .scale({
    // https://leafletjs.com/reference-1.4.0.html#control-scale-option
    position: "bottomleft",
    metric: true,
    imperial: true
  })
  .addTo(map02);

// Used to style polygons
const wardsStyle = {
  fillColor: "transparent", // fill colour
  // fillOpacity: 0.5,
  color: "#0078ff", // border colour
  opacity: 1,
  weight: 2
};

// Used to style labels
const wardsStyleLabels = {
  fillColor: "transparent", // fill colour
  // fillOpacity: 0.5,
  color: "#transparent", // border colour
  opacity: 0,
  weight: 0
};

let wardLayer, wardLayerLabels;
let geoDataPractice; // used to store Practice geo data to use in function
let highlightPractice; // used to allow removal of layer
const select = document.getElementById("selPractice");
select.addEventListener("change", function() {
  highlightFeature(select.value);
});

// Export geojson data layers as: EPSG: 4326 - WGS 84
getGeoData("Data/cyc_wards.geojson")
  .then(function(data) {
    // https://gis.stackexchange.com/questions/272490/styling-individual-features-in-a-geojson-layer
    // https://leafletjs.com/examples/choropleth/

    // This first section is used to add the ward groupings as individual layers
    addWardGroupsToMap(data, map02);
    return data;
  })
  .then(function(data) {
    // This section adds the ward layer in its entirety along with labels (permanent Tooltip)
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
      }
    }).addTo(map02);

    subLayerControl.addOverlay(wardLayer, "wards_cyc"); // Adds an overlay (checkbox entry) with the given name to the control.
    return data;
  })
  .then(function(data) {
    // This section adds the ward layer descriptions (permanent Tooltip)
    wardLayerLabels = L.geoJSON(data, {
      style: wardsStyleLabels,
      onEachFeature: function(feature, layer) {
        // https://leafletjs.com/reference-1.4.0.html#tooltip
        // layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
        layer.bindTooltip(
          function(layer) {
            return layer.feature.properties.wd17nm; // sets the tooltip text
          },
          { permanent: true, direction: "center", opacity: 0.5 }
        );
      }
    }); //.addTo(map02); // uncomment this to display initial map with labels

    subLayerControl.addOverlay(wardLayerLabels, "wards_labels"); // Adds an overlay (checkbox entry) with the given name to the control.
  });

getGeoData("Data/GPPracticeMainSites.geojson").then(function(data) {
  geoDataPractice = data; // store the data in separate variable for use in highlight function
  addDataToMap(data, map02);
});

// let allItems;
function addDataToMap(data, map) {
  let categories = {},
    category;

  L.geoJson(data, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    pointToLayer: function(feature, latlng) {
      // Use different marker styles depending on eg. practice groupings
      switch (feature.properties.locality) {
        case "Central":
          return L.marker(latlng, {
						icon: arrMarkerIcons[0],
						riseOnHover: true
          });
        case "North":
          return L.marker(latlng, {
						icon: arrCircleIcons[1],
						riseOnHover: true
          });
        case "South":
          return L.marker(latlng, {
            icon: arrDoughnutIcons[2],
						riseOnHover: true
          });
        default:
          return L.marker(latlng, {
            icon: arrMarkerIcons[3],
						riseOnHover: true
          });
      }
    },
    onEachFeature: function(feature, layer) {
      const popupText =
        "<h3>Code: " +
        layer.feature.properties.practice_code +
        "</h3>" +
        "<p>" + layer.feature.properties.practice_name +
        "</p>";
      layer.bindPopup(popupText);
      layer.on("mouseover", function(e) {
        this.openPopup();
      });
      layer.on("mouseout", function(e) {
        this.closePopup();
      });
      layer.on("click", function(e) {
        // update other charts
        selectedPractice = feature.properties.practice_code, // change the practice to whichever was clicked
          practiceName = feature.properties.practice_name;
        console.log(selectedPractice + " - " + practiceName);
        document.getElementById("selPractice").value = selectedPractice; // change the selection box dropdown to reflect clicked practice
				highlightFeature(selectedPractice);
				chartPopulationTrend(selectedPractice);
        chartDemographics(selectedPractice, selectedDate);
        chartDemographicsCompare(selectedPracticeCompare, selectedDate);
      });

      category = feature.properties.locality; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (typeof categories[category] === "undefined") {
        categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
        layerControl.addOverlay(categories[category], "PCH: " + category);
      }
      categories[category].addLayer(layer);
    }
  });
}

function addWardGroupsToMap(data, map) {
  let categories = {},
    category;

  L.geoJson(data, {
    style: style,
    onEachFeature: function(feature, layer) {
      category = feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (typeof categories[category] === "undefined") {
        categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
        subLayerControl.addOverlay(
          categories[category],
          "Ward Group: " + category
        );
      }
      categories[category].addLayer(layer);
    }
  });
}

// Separate marker for York Trust
L.marker([53.96838, -1.08269], {
  icon: L.BeautifyIcon.icon({
    iconShape: "circle",
    icon: "h-square",
    borderColor: "red",
    backgroundColor: "transparent",
    textColor: "rgba(255,0,0)" // Text color of marker icon
  }),
  zIndexOffset: 1000,
  draggable: false
})
  .addTo(map02)
  .bindPopup("York Hospital");

// Function to import data
async function getGeoData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

/* Pop Ups
// https://leafletjs.com/reference-1.4.0.html#popup
const popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map02);
}

map02.on("click", onMapClick);
*/

// for colouring ward groupings (choropleth)
function getColor(d) {
  return d > 7
    ? "#800026"
    : d > 6
    ? "#BD0026"
    : d > 5
    ? "#E31A1C"
    : d > 4
    ? "#FC4E2A"
    : d > 3
    ? "#FD8D3C"
    : d > 2
    ? "#FEB24C"
    : d > 1
    ? "#FED976"
    : "#FFEDA0";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.pcn_ward_group),
    weight: 2,
    opacity: 1,
    color: "red",
    dashArray: "3",
    fillOpacity: 0.7
  };
}

/* Useful Links

  // how to populate layers with async
  https://plnkr.co/edit/H6E6q0vKwb3RPOZBWs27?p=preview

  // Add an 'All Points' option that syncs
  https://jsfiddle.net/qkvo7hav/7/
*/

// Home Button
// https://github.com/CliffCloud/Leaflet.EasyButton
const home = {
  lat: 53.9581,
  lng: -1.0643,
  zoom: 11
};

L.easyButton(
  "fa-home",
  function(btn, map) {
    map.setView([home.lat, home.lng], home.zoom);
  },
  "Zoom To Home"
).addTo(map02);

function highlightFeature(selPractice) {
  if (typeof highlightPractice !== "undefined") {
    map02.removeLayer(highlightPractice);
  }

  highlightPractice = L.geoJSON(geoDataPractice, {
    pointToLayer: function(feature, latlng) {
      if (feature.properties.practice_code === selPractice) {
        return (markerLayer = L.marker(latlng, {
					icon: arrHighlightIcons[5],
					zIndexOffset: -5
        }));
      }
    }
  });

  map02.addLayer(highlightPractice);
}