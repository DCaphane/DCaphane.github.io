// Export geojson data layers as: EPSG: 4326 - WGS 84

let selectedPractice,
  practiceName,
  practicePopulation,
  selectedPCN,
  subCategories = {},
  subCategory,
  siteData,
  defaultSites,
  lsoaLayer,
  geoDataPractice, // used to store Practice geo data to use in function
  highlightPractice; // used to allow removal of layer
/*
Reusable map components:
	https://stackoverflow.com/questions/53594814/leaflet-multiple-maps-on-same-page
*/

// Controls
// Background and Sites layers

/* Add a sidebar
https://github.com/nickpeihl/leaflet-sidebar-v2
*/

const formatNumber = function (num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const basemap = Basemaps();
const mapInitialise = defaultMapSetUp();

// Formatting Styles
function styleWard(feature) {
  return {
    fillColor: getColourWard(feature.properties.pcn_ward_group),
    weight: 2,
    opacity: 1,
    color: "red",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

// for colouring ward groupings (choropleth)
function getColourWard(d) {
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

function addWardGroupsToMap(data, map, control) {
  let categories = {},
    category;

  L.geoJson(data, {
    style: styleWard,
    pane: "wardBoundaryPane",
    onEachFeature: function (feature, layer) {
      category = feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (typeof categories[category] === "undefined") {
        categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
        control.addOverlay(categories[category], "Ward Group: " + category);
      }
      categories[category].addLayer(layer);
    },
  });
}

const styleCCG = {
  color: "#00ff78",
  weight: 2,
  opacity: 0.6,
};

// Used to style polygons
const wardsStyle = {
  fillColor: "transparent", // fill colour
  // fillOpacity: 0.5,
  color: "#0078ff", // border colour
  opacity: 1,
  weight: 2,
};

// Used to style labels
const wardsStyleLabels = {
  fillColor: "transparent", // fill colour
  // fillOpacity: 0.5,
  color: "#transparent", // border colour
  opacity: 0,
  weight: 0,
};

// Separate marker for York Trust
const yorkTrust = (map) => {
  return L.marker([53.96838, -1.08269], {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "h-square",
      borderColor: "red",
      backgroundColor: "transparent",
      textColor: "rgba(255,0,0)", // Text color of marker icon
    }),
    zIndexOffset: 1000,
    draggable: false,
  })
    .addTo(map)
    .bindPopup("York Hospital");
};

// Home Button
// https://github.com/CliffCloud/Leaflet.EasyButton
const home = {
  lat: 53.9581,
  lng: -1.0643,
  zoom: 11,
};

const homeButton = (map) => {
  return L.easyButton(
    "fa-home",
    function (btn, map) {
      map.setView([home.lat, home.lng], home.zoom);
    },
    "Zoom To Home"
  ).addTo(map);
};

// Function to import data
async function getGeoData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

async function addPracticeToMap(map, control) {
  const data = await getGeoData("Data/geo/GPPracticeMainSites.geojson");
  geoDataPractice = data;

  let categories = {},
    category;

  const practiceMain = L.geoJson(data, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    pointToLayer: function (feature, latlng) {
      // Use different marker styles depending on eg. practice groupings
      switch (feature.properties.locality) {
        case "Central":
          return L.marker(latlng, {
            icon: arrMarkerIcons[0],
            riseOnHover: true,
          });
        case "North":
          return L.marker(latlng, {
            icon: arrCircleIcons[1],
            riseOnHover: true,
          });
        case "South":
          return L.marker(latlng, {
            icon: arrDoughnutIcons[2],
            riseOnHover: true,
          });
        default:
          return L.marker(latlng, {
            icon: arrMarkerIcons[3],
            riseOnHover: true,
          });
      }
    },
    onEachFeature: function (feature, layer) {
      const popupText =
        "<h3>Code: " +
        layer.feature.properties.practice_code +
        "</h3>" +
        "<p>" +
        layer.feature.properties.practice_name +
        "</p>";
      layer.bindPopup(popupText);
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });
      layer.on("click", function (e) {
        // update other charts
        (selectedPractice = feature.properties.practice_code), // change the practice to whichever was clicked
          (practiceName = feature.properties.practice_name);
        // console.log(selectedPractice + " - " + practiceName);
        document.getElementById("selPractice").value = selectedPractice; // change the selection box dropdown to reflect clicked practice
        refreshChartsPostPracticeChange(selectedPractice);
      });

      category = feature.properties.locality; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (typeof categories[category] === "undefined") {
        categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
        layerControl.addOverlay(categories[category], "PCH: " + category);
      }
      categories[category].addLayer(layer);
    },
  });
  map.fitBounds(practiceMain.getBounds());
}

async function addPCNToMap(map, control) {
  const data = await getGeoData("Data/geo/pcn/primary_care_networks.geojson");

  let categories = {},
    category;

  const pcnSites = L.geoJson(data, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      const popupText =
        "<h3>" +
        layer.feature.properties.pcn_name +
        "</h3>" +
        "<p>" +
        layer.feature.properties.practice_code +
        ": " +
        layer.feature.properties.practice_name +
        "<br>Clinical Director: " +
        layer.feature.properties.clinical_director +
        "<br>Population: " +
        formatNumber(layer.feature.properties.list_size) +
        "</p>";

      layer.bindPopup(popupText);
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });

      layer.on("click", function (e) {
        // update other charts
        (selectedPractice = feature.properties.practice_code), // change the practice to whichever was clicked
          (practiceName = feature.properties.practice_name),
          (selectedPCN = feature.properties.pcn_name);
        console.log(selectedPractice + " - " + practiceName);

        filterFunctionPCN(siteData, map03, layerControl2);
        updateTextPractice();
        updateTextPCN();
        updateSidebarText("pcnSpecific", layer.feature.properties.pcn_name);
      });

      category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (typeof categories[category] === "undefined") {
        categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
        control.addOverlay(categories[category], category);
      }
      categories[category].addLayer(layer);
    },
  });
  map.fitBounds(pcnSites.getBounds());
}

function filterFunctionPCN(data, map, control) {
  map.removeLayer(defaultSites);
  for (let sc in subCategories) {
    if (map.hasLayer(subCategories[sc])) {
      map.removeLayer(subCategories[sc]);
    }
  }
  subCategories = {};

  const gpSites = L.geoJson(data, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      const popupText =
        "<h3>" +
        layer.feature.properties.pcn_name +
        "</h3>" +
        "<p>" +
        layer.feature.properties.organisation_code +
        ": " +
        layer.feature.properties.organisation_name +
        "<br>Parent Org: " +
        layer.feature.properties.parent_organisation_code +
        "</p>";

      layer.bindPopup(popupText);
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });

      layer.on("click", function (e) {
        // update other charts
        (selectedPractice = feature.properties.organisation_code), // change the practice to whichever was clicked
          (practiceName = feature.properties.organisation_name);
        // console.log(selectedPractice + " - " + practiceName);
      });

      subCategory = feature.properties.pcn_name; // subCategory variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the subCategory array if not already set.
      if (typeof subCategories[subCategory] === "undefined") {
        subCategories[subCategory] = L.layerGroup().addTo(map); // subCategories {object} used to create an object with key = subCategory, value is array
        // control.addOverlay(
        // 	subCategories[subCategory],
        // 	subCategory
        // );
      }
      // console.log(subCategories[subCategory]);
      subCategories[subCategory].addLayer(layer);
    },
    filter: function (d) {
      // console.log(d.properties.organisation_code)
      const strPractice = d.properties.organisation_code;
      const strPCN = d.properties.pcn_name;

      if (selectedPCN !== undefined) {
        if (strPCN === selectedPCN) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }

      /* -- match on practice
			if ((selectedPractice !== undefined && selectedPractice !== "All Practices")) {
				if (
					strPractice.substring(0, 6) ===
					selectedPractice.substring(0, 6)
				) {
					return true;
				} else {
					return false;
				}
			} else {
				return true;
      }
      */
    },
  });
  map.fitBounds(gpSites.getBounds());
}

function filterFunctionPractice(data, map) {

    map.removeLayer(defaultSites);

  for (const sc in subCategories) {
    if (map.hasLayer(subCategories[sc])) {
      map.removeLayer(subCategories[sc]);
    }
  }
  subCategories = {};

  const gpSites = L.geoJson(data, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      const popupText =
        "<h3>" +
        layer.feature.properties.pcn_name +
        "</h3>" +
        "<p>" +
        layer.feature.properties.organisation_code +
        ": " +
        layer.feature.properties.organisation_name +
        "<br>Parent Org: " +
        layer.feature.properties.parent_organisation_code +
        "</p>";

      layer.bindPopup(popupText);
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });

      layer.on("click", function (e) {
        // update other charts
        (selectedPractice = feature.properties.organisation_code), // change the practice to whichever was clicked
          (practiceName = feature.properties.organisation_name);
        // console.log(selectedPractice + " - " + practiceName);
      });

      subCategory = feature.properties.pcn_name; // subCategory variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the subCategory array if not already set.
      if (typeof subCategories[subCategory] === "undefined") {
        subCategories[subCategory] = L.layerGroup().addTo(map); // subCategories {object} used to create an object with key = subCategory, value is array
        // control.addOverlay(
        // 	subCategories[subCategory],
        // 	subCategory
        // );
      }
      // console.log(subCategories[subCategory]);
      subCategories[subCategory].addLayer(layer);
    },
    filter: function (d) {
      // console.log(d.properties.organisation_code)
      const strPractice = d.properties.organisation_code;
      /*
      const strPCN = d.properties.pcn_name;
      if (selectedPCN !== undefined) {
        if (strPCN === selectedPCN) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
*/
      // match on practice
      if (selectedPractice !== undefined && selectedPractice !== "All Practices") {
        return ((strPractice.substring(0, 6) === selectedPractice.substring(0, 6)) ? true : false);
      } else {
        return true; // return all practice sites if none selected
      }
    },
  });
  map.fitBounds(gpSites.getBounds());
}

const pcnFormatting = function (feature, latlng) {
  // Use different marker styles depending on eg. practice groupings
  switch (feature.properties.pcn_name) {
    case "Selby Town PCN":
      return L.marker(latlng, {
        icon: arrMarkerIcons[0],
        riseOnHover: true,
      });
    case "Tadcaster & Selby PCN":
      return L.marker(latlng, {
        icon: arrMarkerIcons[1],
        riseOnHover: true,
      });
    case "South Hambleton And Ryedale":
      return L.marker(latlng, {
        icon: arrMarkerIcons[2],
        riseOnHover: true,
      });
    case "York City Centre PCN":
      return L.marker(latlng, {
        icon: arrMarkerIcons[3],
        riseOnHover: true,
      });
    case "York Medical Group":
      return L.marker(latlng, {
        icon: arrMarkerIcons[4],
        riseOnHover: true,
      });
    case "NIMBUSCARE LTD":
      switch (feature.properties.sub_group) {
        case "1":
          return L.marker(latlng, {
            icon: arrCircleIcons[7],
            riseOnHover: true,
          });
        case "2":
          return L.marker(latlng, {
            icon: arrCircleDotIcons[7],
            riseOnHover: true,
          });
        case "3":
          return L.marker(latlng, {
            icon: arrRectangleIcons[7],
            riseOnHover: true,
          });
        default:
          return L.marker(latlng, {
            icon: arrDoughnutIcons[7],
            riseOnHover: true,
          });
      }
    default:
      return L.marker(latlng, {
        icon: arrDoughnutIcons[0],
        riseOnHover: true,
      });
  }
};

async function wardData(map, control) {
  let wardLayer, wardLayerLabels;

  const data = await getGeoData("Data/geo/cyc_wards.geojson");

  // This first section is used to add the ward groupings as individual layers
  addWardGroupsToMap(data, map, control);

  // This section adds the ward layer in its entirety along with labels (permanent Tooltip)
  wardLayer = L.geoJSON(data, {
    style: wardsStyle,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h1>" +
          feature.properties.wd17nm +
          "</h1><p>Code: " +
          feature.properties.wd17cd +
          "</p>"
      );
    },
  }).addTo(map);

  // Add an overlay (checkbox entry) with the given name to the control
  control.addOverlay(wardLayer, "wards_cyc");

  // This section adds the ward layer descriptions (permanent Tooltip)
  wardLayerLabels = L.geoJSON(data, {
    style: wardsStyleLabels,
    onEachFeature: function (feature, layer) {
      // https://leafletjs.com/reference-1.4.0.html#tooltip
      // layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
      layer.bindTooltip(
        function (layer) {
          return layer.feature.properties.wd17nm; // sets the tooltip text
        },
        { permanent: true, direction: "center", opacity: 0.5 }
      );
    },
  }); //.addTo(map); // uncomment this to display initial map with labels

  control.addOverlay(wardLayerLabels, "wards_labels"); // Adds an overlay (checkbox entry) with the given name to the control.
}

// CCG Boundary
async function ccgBoundary(map, control) {
  const data = await getGeoData("Data/geo/ccg_boundary_03Q_simple20.geojson");
  const ccgBoundary = L.geoJSON(data, {
    style: styleCCG,
    pane: "ccg03QBoundaryPane",
  }).addTo(map);
  control.addOverlay(ccgBoundary, "voy_ccg");

  map.fitBounds(ccgBoundary.getBounds());
}

function styleLsoa(feature) {
  return {
    fillColor: "#ff0000", // background
    fillOpacity: 0, // transparent
    weight: 1, // border
    color: "red", // border
    opacity: 1,
    dashArray: "3",
  };
}

async function lsoaBoundary(map, control) {
  // let lsoaLayerLabels;

  const data = await getGeoData("Data/geo/lsoa_gp_selected_simple20cp6.geojson");

  // This section adds the lsoa layer in its entirety along with labels (permanent Tooltip)
  lsoaLayer = L.geoJSON(data, {
    // style: styleLsoa, // default colour scheme for lsoa boundaries
    // onEachFeature: function (feature, layer) {
    //   layer.bindPopup(`<h1>${feature.properties.lsoa}</h1>`);
    // },
  }).addTo(map);

  // Add an overlay (checkbox entry) with the given name to the control
  control.addOverlay(lsoaLayer, "lsoa_voyccg");

  // This section adds the lsoa layer descriptions (permanent Tooltip)
  // lsoaLayerLabels = L.geoJSON(data, {
  //   // style: wardsStyleLabels,
  //   onEachFeature: function (feature, layer) {
  //     // https://leafletjs.com/reference-1.4.0.html#tooltip
  //     // layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
  //     layer.bindTooltip(
  //       function (layer) {
  //         return layer.feature.properties.lsoa; // sets the tooltip text
  //       },
  //       { permanent: true, direction: "center", opacity: 0.5 }
  //     );
  //   },
  // }); //.addTo(map); // uncomment this to display initial map with labels

  // control.addOverlay(lsoaLayerLabels, "lsoa_labels"); // Adds an overlay (checkbox entry) with the given name to the control.
  recolourLSOA();
}

function Basemaps() {
  function osm_bw() {
    return L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
      minZoom: 0,
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  }

  function CartoDB_Voyager() {
    return L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        minZoom: 0,
        maxZoom: 19,
      }
    );
  }

  // http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
  function Stamen_Toner() {
    return L.tileLayer(
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}",
      {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: "abcd",
        minZoom: 0,
        maxZoom: 20,
        ext: "png",
      }
    );
  }

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  }

  return {
    emptyTile: emptyTile,
    osm_bw: osm_bw,
    CartoDB_Voyager: CartoDB_Voyager,
    Stamen_Toner: Stamen_Toner,
  };
}

function defaultMapSetUp() {
  function mapInit(mapName, background) {
    return L.map(mapName, {
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
      layers: background, // default basemap that will appear first
      fullscreenControl: {
        // https://github.com/Leaflet/Leaflet.fullscreen
        pseudoFullscreen: true, // if true, fullscreen to page width and height
      },
    });
  }

  function layerControl(basemap) {
    return L.control.layers(basemap, null, {
      collapsed: true, // Whether or not control options are displayed
      sortLayers: true,
    });
  }

  function subLayerControl() {
    return L.control.layers(null, null, {
      collapsed: true,
      sortLayers: true,
    });
  }

  function scaleBar(position) {
    return L.control.scale({
      // https://leafletjs.com/reference-1.4.0.html#control-scale-option
      position: position,
      metric: true,
      imperial: true,
    });
  }

  function sidebarLeft(map, test) {
    return new L.control.sidebar({
      autopan: false, // whether to maintain the centered map point when opening the sidebar
      closeButton: true, // whether to add a close button to the panes
      container: test, // the DOM container or #ID of a predefined sidebar container that should be used
      position: "left", // left or right
    }).addTo(map);
  }

  return {
    mapInit: mapInit,
    layerControl: layerControl,
    subLayerControl: subLayerControl,
    scaleBar: scaleBar,
    sidebarLeft: sidebarLeft,
  };
}


function refreshChartsPostPracticeChange(practice) {
  console.log(practice);
  highlightFeature(practice); // console.log(event.text.label, event.text.value)
  trendChart.chartTrendDraw()
  updateChtDemog(practice, selectedPracticeCompare);

  filterFunctionPractice(siteData, mapSites, layerControl1);
  // filterFunctionPractice(siteData, mapPopn, layerControl2);
  recolourLSOA();
  barChart.fnRedrawBarChart();
  // updateTextPractice();
  // updateTextPCN();
  updateSidebarText("pcnSpecific", practice);
}


/* Useful Links

  // how to populate layers with async
  https://plnkr.co/edit/H6E6q0vKwb3RPOZBWs27?p=preview

  // Add an 'All Points' option that syncs
  https://jsfiddle.net/qkvo7hav/7/
*/

// Unused

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
