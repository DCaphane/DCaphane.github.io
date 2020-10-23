// Export geojson data layers as: EPSG: 4326 - WGS 84

let practiceName,
  practicePopulation,
  selectedPCN,
  subCategories = {}, // Is this needed..?
  // subCategory,
  // siteData,
  // defaultSites,
  lsoaLayer,
  // geoDataPractice, // used to store Practice geo data to use in function
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

const mapInitialise = defaultMapSetUp();
const mapWithSites = new Map(); // set of maps that include site codes

// for initialising maps
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

  function layerControlTree() {
    // https://github.com/jjimenezshaw/Leaflet.Control.Layers.Tree#leafletcontrollayerstree
    const basemap = Object.create(Basemaps);

    const baseTree = {
      label: "Base Layers",
      children: [
        {
          label: "Colour &#x1f5fa;",
          children: [
            { label: "CartoDB", layer: basemap.Default },
            { label: "None", layer: basemap["No Background"] },
          ],
        },
        {
          label: "Black & White &#x1f5fa;",
          children: [

            { label: "Grey", layer: basemap["Black and White"] },
            { label: "B&W", layer: basemap["Stamen Toner"] },
          ],
        },
      ],
    };

    return L.control.layers.tree(baseTree, null, {
      // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
      collapsed: true, // Whether or not control options are displayed
      sortLayers: true,
      // namedToggle: true,
      collapseAll: 'Collapse all',
      expandAll: 'Expand all',
      // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
      closedSymbol: '&#8862; &#x1f5c0;', // Symbol displayed on a closed node
      openedSymbol: '&#8863; &#x1f5c1;', // Symbol displayed on an opened node
    });
  }

  function layerControl(basemap) {
    return L.control.layers(basemap, null, {
      collapsed: true, // Whether or not control options are displayed
      sortLayers: true
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
    layerControlTree: layerControlTree,
    layerControl: layerControl,
    subLayerControl: subLayerControl,
    scaleBar: scaleBar,
    sidebarLeft: sidebarLeft,
  };
}

// Function to import data
async function getGeoData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

// Import Data
// GP Practice Main Site
const geoDataGPMain = (async function (path) {
  return await getGeoData(path);
})("Data/geo/GPPracticeMainSites.geojson").then((v) => {
  return v;
});

// GP Practice - Main Site by PCN
const geoDataPCN = (async function (path) {
  return await getGeoData(path);
})("Data/geo/pcn/primary_care_networks.geojson");

// GP Practice Sites by parent practice and pcn
const geoDataPCNSites = (async function (path) {
  return await getGeoData(path);
})("Data/geo/pcn/primary_care_network_sites.geojson");
//   .then((v) => {
//   siteData = v;
//   return v;
// });

// CYC Ward Boundaries
const geoDataCYCWards = (async function addCYCWardsToMap(path) {
  return await getGeoData(path);
})("Data/geo/cyc_wards.geojson");

// CCG Boundary
const geoDataCCGBoundary = (async function addCCGBoundaryToMap(path) {
  return await getGeoData(path);
})("Data/geo/ccg_boundary_03Q_simple20.geojson");

// Lsoa Boundaries
const geoDataLsoaBoundaries = (async function addPracticeToMap(path) {
  return await getGeoData(path);
})("Data/geo/lsoa_gp_selected_simple20cp6.geojson");

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

const usefulSites = {
  yorkTrust: [53.96838, -1.08269],
  scarboroughTrust: [54.28216, -0.43619],
  harrogateTrust: [53.99381, -1.51810]
}


// Separate marker for York Trust
function yorkTrust() {
  const map = this.map;
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
    .bindPopup("York Hospital"); // Text to display in pop up
}

// Home Button
// https://github.com/CliffCloud/Leaflet.EasyButton
const home = {
  lat: 53.9581,
  lng: -1.0643,
  zoom: 11,
};

function homeButton() {
  const map = this.map;
  return L.easyButton(
    "fa-home",
    function (btn) {
      map.setView([home.lat, home.lng], home.zoom);
    },
    "Zoom To Home"
  ).addTo(map);
}

// function addPracticeToMap(data, map, zoomToExtent = false) {
//   let categories = {},
//     category;

//   const practiceMain = L.geoJson(data, {
//     // https://leafletjs.com/reference-1.4.0.html#geojson
//     pointToLayer: function (feature, latlng) {
//       // Use different marker styles depending on eg. practice groupings
//       switch (feature.properties.locality) {
//         case "Central":
//           return L.marker(latlng, {
//             icon: arrMarkerIcons[0],
//             riseOnHover: true,
//           });
//         case "North":
//           return L.marker(latlng, {
//             icon: arrCircleIcons[1],
//             riseOnHover: true,
//           });
//         case "South":
//           return L.marker(latlng, {
//             icon: arrDoughnutIcons[2],
//             riseOnHover: true,
//           });
//         default:
//           return L.marker(latlng, {
//             icon: arrMarkerIcons[3],
//             riseOnHover: true,
//           });
//       }
//     },
//     onEachFeature: function (feature, layer) {
//       const popupText =
//         "<h3>Code: " +
//         layer.feature.properties.practice_code +
//         "</h3>" +
//         "<p>" +
//         layer.feature.properties.practice_name +
//         "</p>";
//       layer.bindPopup(popupText);
//       layer.on("mouseover", function (e) {
//         this.openPopup();
//       });
//       layer.on("mouseout", function (e) {
//         this.closePopup();
//       });
//       layer.on("click", function (e) {
//         // update other charts
//         (selectedPractice = feature.properties.practice_code), // change the practice to whichever was clicked
//           (practiceName = feature.properties.practice_name);
//         // console.log(selectedPractice + " - " + practiceName);
//         document.getElementById("selPractice").value = selectedPractice; // change the selection box dropdown to reflect clicked practice
//         refreshChartsPostPracticeChange(selectedPractice);
//       });

//       category = feature.properties.locality; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
//       // Initialize the category array if not already set.
//       if (typeof categories[category] === "undefined") {
//         categories[category] = L.layerGroup().addTo(map.map); // categories {object} used to create an object with key = category, value is array
//         map.layerControl.addOverlay(categories[category], "PCH: " + category);
//       }
//       categories[category].addLayer(layer);
//     },
//   });
//   if (zoomToExtent) {
//     map.map.fitBounds(practiceMain.getBounds());
//   }
// }

function addPCNToMap(data, map, control, zoomToExtent = false) {
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

        filterFunctionPCN(siteData, mapPCNSites.map, mapPCNSite.layerControl);
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
  if (zoomToExtent) {
    map.fitBounds(pcnSites.getBounds());
  }
}

function filterFunctionPCN(data, map, control, zoomToExtent = false) {
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
  if (zoomToExtent) {
    map.fitBounds(gpSites.getBounds());
  }
}

function pcnSites(zoomToExtent = false) {
  const map = this.map;
  geoDataPCNSites.then(function (v) {
    const sitesLayer = L.geoJson(v, {
      pointToLayer: pcnFormatting,
      // onEachFeature: function (feature, layer) {
      //   //console.log(layer.feature.properties.pcn_name)
      //   subCategories[layer.feature.properties.pcn_name] = null;
      // },
    });

    sitesLayer.addTo(map);
    mapWithSites.set(map, sitesLayer);
    if (zoomToExtent) {
      map.fitBounds(sitesLayer.getBounds());
    }
  });
}

function filterGPPracticeSites(zoomToExtent = false) {
  mapWithSites.forEach(function (value, key) {
    if (key.hasLayer(value)) {
      key.removeLayer(value);
    }

    geoDataPCNSites.then(function (v) {
      const gpSites = L.geoJson(v, {
        // https://leafletjs.com/reference-1.4.0.html#geojson
        pointToLayer: pcnFormatting,
        onEachFeature: function (feature, layer) {
          const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
        <p>${layer.feature.properties.organisation_code}:
        ${layer.feature.properties.organisation_name}
        <br>Parent Org:${layer.feature.properties.parent_organisation_code}</p>`;

          layer.bindPopup(popupText);
          layer.on("mouseover", function (e) {
            this.openPopup();
          });
          layer.on("mouseout", function (e) {
            this.closePopup();
          });

          layer.on("click", function (e) {
            // update other charts
            (selectedPractice = feature.properties.organisation_code), // register change in practice
              (practiceName = feature.properties.organisation_name);
            // console.log(selectedPractice + " - " + practiceName);
          });

          // subCategory = feature.properties.pcn_name; // subCategory variable, used to store the distinct feature eg. phc_no, practice_group etc
          // // Initialize the subCategory array if not already set.
          // if (typeof subCategories[subCategory] === "undefined") {
          //   for (let map of mapWithSites.keys()) {
          //     subCategories[subCategory] = L.layerGroup().addTo(map); // subCategories {object} used to create an object with key = subCategory, value is array
          //   }
          //   // control.addOverlay(
          //   // 	subCategories[subCategory],
          //   // 	subCategory
          //   // );
          // }
          // // console.log(subCategories[subCategory]);
          // subCategories[subCategory].addLayer(layer);
        },
        filter: function (d) {
          // match on practice
          const strPractice = d.properties.organisation_code;

          if (
            selectedPractice !== undefined &&
            selectedPractice !== "All Practices"
          ) {
            return strPractice.substring(0, 6) ===
              selectedPractice.substring(0, 6)
              ? true
              : false;
          } else {
            return true; // return all practice sites if none selected
          }
        },
      });

      gpSites.addTo(key);
      mapWithSites.set(key, gpSites);

      if (zoomToExtent) {
        key.fitBounds(gpSites.getBounds());
      }
    });
  });
}

function filterFunctionLsoa(data, map, zoomToExtent = false) {
  const nearestDate = nearestValue(arrayGPLsoaDates, selectedDate);
  // const maxValue =
  //   selectedPractice !== undefined && selectedPractice !== "All Practices"
  //     ? d3.max(data_popnGPLsoa.get(nearestDate).get(selectedPractice).values())
  //     : d3.max(data_popnGPLsoa.get(nearestDate).get("All").values());

  if (map.map.hasLayer(lsoaLayer)) {
    // selectedLsoas
    map.map.removeLayer(lsoaLayer);
  }

  lsoaLayer = L.geoJson(data, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    // style: lsoaStyle,
    onEachFeature: function (feature, layer) {
      // const popupText =
      //   "<h3>" +
      //   layer.feature.properties.practice_code +
      //   "</h3>" +
      //   "<p>" +
      //   layer.feature.properties.lsoa +
      //   ": " +
      //   layer.feature.properties.period +
      //   "<br>Pop'n: " +
      //   layer.feature.properties.population +
      //   "</p>";

      // layer.bindPopup(popupText);
      // layer.on("mouseover", function (e) {
      //   this.openPopup();
      // });
      // layer.on("mouseout", function (e) {
      //   this.closePopup();
      // });

      layer.on("click", function (e) {
        // update other charts
        selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
        console.log(selectedLsoa);
      });

      // subCategory = feature.properties.pcn_name; // subCategory variable, used to store the distinct feature eg. phc_no, practice_group etc
      // // Initialize the subCategory array if not already set.
      // if (typeof subCategories[subCategory] === "undefined") {
      //   subCategories[subCategory] = L.layerGroup().addTo(map.map); // subCategories {object} used to create an object with key = subCategory, value is array
      //   // control.addOverlay(
      //   // 	subCategories[subCategory],
      //   // 	subCategory
      //   // );
      // }
      // // console.log(subCategories[subCategory]);
      // subCategories[subCategory].addLayer(layer);
    },
    filter: function (d) {
      // console.log(d.properties.lsoa)
      const lsoaCode = d.properties.lsoa;

      let value =
        selectedPractice !== undefined && selectedPractice !== "All Practices"
          ? data_popnGPLsoa.get(nearestDate).get(selectedPractice).get(lsoaCode)
          : data_popnGPLsoa.get(nearestDate).get("All").get(lsoaCode);

      if (value > 20) {
        return true;
      }
    },
  }).addTo(map.map);
  if (zoomToExtent) {
    map.map.fitBounds(lsoaLayer.getBounds());
  }
}

function addWardData(data, map, zoomToExtent = false) {
  let wardLayer, wardLayerLabels;

  // This first section is used to add the ward groupings as individual layers
  addWardGroupsToMap(data, map);

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
  }).addTo(map.map);

  // Add an overlay (checkbox entry) with the given name to the control
  map.subLayerControl.addOverlay(wardLayer, "wards_cyc");
  if (zoomToExtent) {
    map.map.fitBounds(wardLayer.getBounds());
  }
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

  map.subLayerControl.addOverlay(wardLayerLabels, "wards_labels"); // Adds an overlay (checkbox entry) with the given name to the control.
}

function addWardGroupsToMap(data, map) {
  let categories = {},
    category;

  L.geoJson(data, {
    style: styleWard,
    pane: "wardBoundaryPane",
    onEachFeature: function (feature, layer) {
      category = feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (typeof categories[category] === "undefined") {
        categories[category] = L.layerGroup().addTo(map.map); // categories {object} used to create an object with key = category, value is array
        map.subLayerControl.addOverlay(
          categories[category],
          "Ward Group: " + category
        );
      }
      categories[category].addLayer(layer);
    },
  });
}

function ccgBoundary(data, map, zoomToExtent = false) {
  const ccgBoundary = L.geoJSON(data, {
    style: styleCCG,
    pane: "ccg03QBoundaryPane",
  }).addTo(map.map);
  map.subLayerControl.addOverlay(ccgBoundary, "voy_ccg");

  if (zoomToExtent) {
    map.map.fitBounds(ccgBoundary.getBounds());
  }
}

function lsoaBoundary(data, map, zoomToExtent = false) {
  // let lsoaLayerLabels;

  // This section adds the lsoa layer in its entirety along with labels (permanent Tooltip)
  lsoaLayer = L.geoJSON(data, {
    // style: styleLsoa, // default colour scheme for lsoa boundaries
    // onEachFeature: function (feature, layer) {
    //   layer.bindPopup(`<h1>${feature.properties.lsoa}</h1>`);
    // },
    filter: function (feature, layer) {
      return true;
    },
  }).addTo(map.map);

  // Add an overlay (checkbox entry) with the given name to the control
  map.subLayerControl.addOverlay(lsoaLayer, "lsoa_voyccg");
  if (zoomToExtent) {
    map.map.fitBounds(lsoaLayer.getBounds());
  }
  return;
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
}

// Styling
const styleCCG = {
  color: "#00ff78",
  weight: 2,
  opacity: 0.6,
};

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

const Basemaps = {
  "Black and White": (function osm_bw() {
    return L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
      minZoom: 0,
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })(),
  Default: (function CartoDB_Voyager() {
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
  })(),
  // http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
  "Stamen Toner": (function Stamen_Toner() {
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
  })(),
  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  "No Background": (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })(),

  // return {
  //   emptyTile: emptyTile,
  //   osm_bw: osm_bw,
  //   CartoDB_Voyager: CartoDB_Voyager,
  //   Stamen_Toner: Stamen_Toner,
  // };
};

// const location = {
//   "YorkTrust": [53.9581, -1.0643]
// }

function refreshChartsPostPracticeChange(practice) {
  console.log(practice);
  highlightFeature(practice, mapMain); // console.log(event.text.label, event.text.value)
  trendChart.chartTrendDraw();
  demographicChart.updateChtDemog(practice, selectedPracticeCompare);

  filterGPPracticeSites(true);

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

// Formatting

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


const categoriesPCN = new Map(); // rename to something like layersGpPcn

async function addPCNToMap2(map, control) {

  geoDataPCN.then(function (v) {
    const pcnSites = L.geoJson(v, {
      // https://leafletjs.com/reference-1.7.1.html#geojson
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

          filterFunctionPCN2(mapPCNSite.map, mapPCNSite.layerControl);
          updateTextPractice();
          updateTextPCN();
          updateSidebarText("pcnSpecific", layer.feature.properties.pcn_name);
        });

        const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
        // Initialize the category array if not already set.
        if (!categoriesPCN.has(category)) {
          categoriesPCN.set(category, L.layerGroup());
        }
        categoriesPCN.get(category).addLayer(layer);
      },
    });

    // for (let [key, value] of categoriesPCN) {
    //   // Adds an overlay (checkbox entry) with the given name to the control.
    //   control.addOverlay(value, key, "test");
    // }

    /*
    The layer groups are available in the overlay and can be toggled on
    The setting below will set them to on by default and display the layer group on the map
    */
    L.layerGroup(Array.from(categoriesPCN.values())).addTo(map);
    map.fitBounds(pcnSites.getBounds());
  });
}

function filterFunctionPCN2(map, control) {
  map.removeLayer(defaultSites);
  for (let sc in subCategories) {
    if (map.hasLayer(subCategories[sc])) {
      map.removeLayer(subCategories[sc]);
    }
  }
  subCategories = {};
  geoDataPCNSites.then(function (v) {
    const gpSites = L.geoJson(v, {
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
      },
    });
    map.fitBounds(gpSites.getBounds());
  });
}
