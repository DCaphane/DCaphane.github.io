let practiceName, practicePopulation, selectedPCN, highlightPractice; // used to allow removal of layer
/*
Reusable map components:
	https://stackoverflow.com/questions/53594814/leaflet-multiple-maps-on-same-page
*/

// Controls
// Background and Sites layers

/* Add a sidebar
https://github.com/nickpeihl/leaflet-sidebar-v2
*/

// Populations smaller than this to be ignored
const minPopulationLSOA = 20;
const zIndexWard = 375;
const zIndexCCG = 374;

const mapInitialise = (function defaultMapSetUp() {
  // for initialising maps
  function mapInit(mapName) {
    return L.map(mapName, {
      preferCanvas: true,
      // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
      center: trustSitesLoc.yorkTrust, // centre on York Hospital
      zoom: 11,
      minZoom: 6, // how far out eg. 0 = whole world
      maxZoom: 17, // how far in, eg. to the detail (max = 18)
      // https://leafletjs.com/reference-1.3.4.html#latlngbounds
      maxBounds: [
        [50.0, 1.6232], //south west
        [59.79, -10.239], //north east
      ],
      // layers: background, // default basemap that will appear first
      fullscreenControl: {
        // https://github.com/Leaflet/Leaflet.fullscreen
        pseudoFullscreen: true, // if true, fullscreen to page width and height
      },
    });
  }

  // function layerControl(basemap) {
  //   return L.control.layers(basemap, null, {
  //     collapsed: true, // Whether or not control options are displayed
  //     sortLayers: true,
  //   });
  // }

  // function subLayerControl() {
  //   return L.control.layers(null, null, {
  //     collapsed: true,
  //     sortLayers: true,
  //   });
  // }

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
    // layerControl: layerControl,
    // subLayerControl: subLayerControl,
    scaleBar: scaleBar,
    sidebarLeft: sidebarLeft,
  };
})();

// Export geojson data layers as: EPSG: 4326 - WGS 84
let // geo coded data
  geoDataPCN,
  geoDataPCNSites,
  geoDataCYCWards,
  geoDataCCGBoundary,
  geoDataLsoaBoundaries,
  dataIMD; // not geo data but only used in map chart
// Organisation Data
// hospitalDetails; -- handled in map object

// Promises to import the geo data
const promGeoDataPCN = d3.json("Data/geo/pcn/primary_care_networks.geojson"),
  promGeoDataPCNSites = d3.json(
    "Data/geo/pcn/primary_care_network_sites.geojson"
  ),
  promGeoDataCYCWards = d3.json("Data/geo/cyc_wards.geojson"),
  promGeoDataCCGBoundary = d3.json(
    "Data/geo/ccg_boundary_03Q_simple20.geojson"
  ),
  promGeoDataLsoaBoundaries = d3.json(
    "Data/geo/lsoa_gp_selected_simple20cp6.geojson"
  ),
  promHospitalDetails = d3.dsv(
    "�", // \u00AC
    "Data/geo/Hospital.csv",
    processDataHospitalSite
  ),
  promDataIMD = d3.csv("Data/imd_lsoa_ccg.csv", processDataIMD);
// promGPPracticeDetails = d3.json(
//   "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03Q&RelStatus=active&Limit=1000"
// );

// Upload Data
const importGeoData = (async function displayContent() {
  await Promise.allSettled([
    promGeoDataPCN,
    promGeoDataPCNSites,
    promGeoDataCYCWards,
    promGeoDataCCGBoundary,
    promGeoDataLsoaBoundaries,
    promHospitalDetails,
    promDataIMD,
    // promGPPracticeDetails,
  ])
    .then((values) => {
      // if (values[0].status === "fulfilled") {
      geoDataPCN = values[0].value;
      // }
      geoDataPCNSites = values[1].value;
      geoDataCYCWards = values[2].value;
      geoDataCCGBoundary = values[3].value;
      geoDataLsoaBoundaries = values[4].value;
      // hospitalDetails = values[5].value;
      dataIMD = values[6].value;
      // gpDetails = values[7].value;
    })
    .then(() => {
      // Assumption here that everything in other scripts is declared before this step...
    });
})();

function initGeoCharts() {
  // from map_GP_MainSite.js
  addWardGroupsToMap.call(mapMain);
  addPracticeToMap.call(mapMain);

  // // from map_popn_lsoa.js
  gpSites();

  // refresh Overlay Options
  refreshMapMainControl();
  refreshMapControlSites();
  refreshMapControlPopn();
  refreshMapControlIMD();
  refreshMapControlBubble();
}

// Functions to refresh the map overlay buttons
function refreshMapMainControl() {
  mapControlMain
    .setOverlayTree(overlaysTreeMain)
    .collapseTree() // collapse the baselayers tree
    // .expandSelected() // expand selected option in the baselayer
    .collapseTree(true);
}

function refreshMapControlSites() {
  mapControlSites
    .setOverlayTree(overlaysTreeSites)
    .collapseTree() // collapse the baselayers tree
    // .expandSelected() // expand selected option in the baselayer
    .collapseTree(true);
}

function refreshMapControlPopn() {
  mapControlPopn
    .setOverlayTree(overlaysTreePopn)
    .collapseTree() // collapse the baselayers tree
    // .expandSelected() // expand selected option in the baselayer
    .collapseTree(true);
}

function refreshMapControlPopn2() {
  mapControlPopn
    .setOverlayTree(overlaysTreeBubble)
    .collapseTree() // collapse the baselayers tree
    // .expandSelected() // expand selected option in the baselayer
    .collapseTree(true);
}

function refreshMapControlIMD() {
  mapControlIMD
    .setOverlayTree(overlaysTreeIMD)
    .collapseTree() // collapse the baselayers tree
    // .expandSelected() // expand selected option in the baselayer
    .collapseTree(true);
}

function refreshMapControlBubble() {
  mapControlBubble
    .setOverlayTree(overlaysTreeBubble)
    .collapseTree() // collapse the baselayers tree
    // .expandSelected() // expand selected option in the baselayer
    .collapseTree(true);
}

// Formatting Styles
const styleCCG = {
  color: "#00ff78",
  weight: 2,
  opacity: 0.6,
};

function styleLsoa(feature) {
  return {
    fillColor: "#ff0000", // background
    fillOpacity: 0, // transparent
    weight: 0.9, // border
    color: "red", // border
    opacity: 1,
    dashArray: "3",
  };
}

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

const trustSitesLoc = {
  yorkTrust: [53.96895, -1.08427],
  scarboroughTrust: [54.28216, -0.43619],
  harrogateTrust: [53.99381, -1.51756],
  leedsTrust: [53.80687, -1.52034],
  southTeesTrust: [54.55176, -1.21479],
  hullTrust: [53.74411, -0.035813],
};

function trustMarker(location, text) {
  return L.marker(location, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "h-square",
      borderColor: "red",
      backgroundColor: "transparent",
      textColor: "rgba(255,0,0)", // Text color of marker icon
      popupAnchor: [0, -5], // adjusts offset position of popup
    }),
    zIndexOffset: 1000,
    draggable: false,
  }).bindPopup(text); // Text to display in pop up
}

// Separate marker for York Trust
function yorkTrust() {
  const map = this.map;
  return L.marker(trustSitesLoc.yorkTrust, {
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
// const home = {
//   lat: 53.9581,
//   lng: -1.0643,
//   zoom: 11,
// };

function homeButton() {
  const map = this.map;
  return L.easyButton(
    "fa-home",
    function (btn) {
      // map.setView(trustSitesLoc.yorkTrust, 9);
      map.setView(
        layersMapBoundaries.get("voyCCGMain").getBounds().getCenter(),
        9
      );
    },
    "Zoom To Home"
  ).addTo(map);
}

function defaultHomeVoY() {
  const map = this.map;
  map.fitBounds(layersMapBoundaries.get("voyCCGMain").getBounds());
}

// Make global to enable subsequent change to overlay
const overlaysTreeMain = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const layersMapGpMain = new Map();

function addPracticeToMap(zoomToExtent = false) {
  const map = this.map;
  // let categories = {},
  //   category;

  const practiceMain = L.geoJson(geoDataPCN, {
    // https://leafletjs.com/reference-1.7.1.html#geojson
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
          <p>${layer.feature.properties.practice_code}: ${
        layer.feature.properties.practice_name
      }
          <br>Clinical Director: ${layer.feature.properties.clinical_director}
          <br>Population: ${formatNumber(
            layer.feature.properties.list_size
          )}</p>`;

      layer.bindPopup(popupText);
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });
      layer.on("click", function (e) {
        // update other charts
        (userSelections.selectedPractice = feature.properties.practice_code), // change the practice to whichever was clicked
          (practiceName = feature.properties.practice_name);
        // console.log(userSelections.selectedPractice + " - " + practiceName);
        document.getElementById("selPractice").value =
          userSelections.selectedPractice; // change the selection box dropdown to reflect clicked practice
        // option to zoom to marker - now handled in fn refreshChartsPostPracticeChange
        // map.setView(e.latlng, 11);
        refreshChartsPostPracticeChange(userSelections.selectedPractice);
      });

      const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      if (!layersMapGpMain.has(category)) {
        layersMapGpMain.set(category, L.layerGroup());
      }
      layersMapGpMain.get(category).addLayer(layer);
    },
  });
  L.layerGroup(Array.from(layersMapGpMain.values())).addTo(map);

  // Add to overlay control
  const ol = overlayPCNs(layersMapGpMain); // function to align sites by pcn to overlay tree
  overlaysTreeMain.children[0] = ol;

  if (zoomToExtent) {
    map.fitBounds(practiceMain.getBounds());
  }
}

const layersMapGPSites = new Map();
const layersMapPopn = new Map();
const mapWithSites = new Map(); // set of maps that include site codes

function gpSites(zoomToExtent = false) {
  // This add the GP Sites layer in its entirety
  // const map = this.map;
  const sitesLayer = L.geoJson(geoDataPCNSites, {
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. pcn
      const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
        <p>${layer.feature.properties.organisation_code}: ${layer.feature.properties.organisation_name}
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
        mapSites.map.setView(e.latlng, 11);
        console.log(layer.feature.properties.organisation_code);
      });

      // Initialize the category array if not already set.
      if (!layersMapGPSites.has(category)) {
        layersMapGPSites.set(category, L.layerGroup());
      }
      layersMapGPSites.get(category).addLayer(layer);
    },
  });

  const popnLayer = L.geoJson(geoDataPCNSites, {
    pointToLayer: pcnFormatting,
    onEachFeature: function (feature, layer) {
      const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. pcn
      const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
        <p>${layer.feature.properties.organisation_code}: ${layer.feature.properties.organisation_name}
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
        mapPopn.map.setView(e.latlng, 11);
        console.log(layer.feature.properties.organisation_code);
      });

      // Initialize the category array if not already set.
      if (!layersMapPopn.has(category)) {
        layersMapPopn.set(category, L.layerGroup());
      }
      layersMapPopn.get(category).addLayer(layer);
    },
  });

  const gpSitesMap = L.layerGroup(Array.from(layersMapGPSites.values()));
  gpSitesMap.addTo(mapSites.map);

  const popnSitesMap = L.layerGroup(Array.from(layersMapPopn.values()));
  popnSitesMap.addTo(mapPopn.map);

  const ol = overlayPCNs(layersMapGPSites);
  overlaysTreeSites.children[2] = ol;

  const ol1 = overlayPCNs(layersMapPopn);
  overlaysTreePopn.children[4] = ol1;

  mapWithSites.set(mapSites.map, gpSitesMap); // keep track of which maps include GP Sites
  // mapWithSites.set(mapPopn.map, popnSitesMap); // do not try to use across multiple maps - need to replicate
  if (zoomToExtent) {
    mapSites.map.fitBounds(gpSitesMap.getBounds());
    // mapPopn.map.fitBounds(popnSitesMap.getBounds());
  }
}

function filterGPPracticeSites(zoomToExtent = false) {
  /* This will deselect the 'entire' GP Sites layer
  and return the filtered layer based on the selected practice
  */
  const map = this.map;
  mapWithSites.forEach(function (value, key) {
    if (key.hasLayer(value)) {
      key.removeLayer(value);
    }

    const gpSites = L.geoJson(geoDataPCNSites, {
      // https://leafletjs.com/reference-1.7.1.html#geojson
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
          // (userSelections.selectedPractice = feature.properties.organisation_code), // register change in practice
          //   (practiceName = feature.properties.organisation_name);
          // console.log(userSelections.selectedPractice + " - " + practiceName);
        });
      },
      filter: function (d) {
        // match on practice
        const strPractice = d.properties.organisation_code;

        if (
          userSelections.selectedPractice !== undefined &&
          userSelections.selectedPractice !== "All Practices"
        ) {
          return strPractice.substring(0, 6) ===
            userSelections.selectedPractice.substring(0, 6)
            ? true
            : false;
        } else {
          return true; // return all practice sites if none selected
        }
      },
    });

    gpSites.addTo(map);
    mapWithSites.set(map, gpSites); // keep track of which maps include GP Sites

    const overlayFilteredSites = {
      label: `${userSelections.selectedPractice} Sites`,
      layer: gpSites,
      selectAllCheckbox: false,
      // children: [
      //   {
      //     label: "test Desc",
      //     layer: gpSites,
      //   },
      // ],
    };
    overlaysTreeSites.children[3] = overlayFilteredSites;

    mapControlSites
      .setOverlayTree(overlaysTreeSites)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true);

    if (zoomToExtent) {
      map.fitBounds(gpSites.getBounds().pad(0.1));
    }
  });
}

// function addWardData(data, map, zoomToExtent = false) {
//   let wardLayer, wardLayerLabels;

//   // This first section is used to add the ward groupings as individual layers
//   addWardGroupsToMap(data, map);

//   // This section adds the ward layer in its entirety along with labels (permanent Tooltip)
//   wardLayer = L.geoJSON(data, {
//     style: wardsStyle,
//     onEachFeature: function (feature, layer) {
//       layer.bindPopup(
//         "<h1>" +
//           feature.properties.wd17nm +
//           "</h1><p>Code: " +
//           feature.properties.wd17cd +
//           "</p>"
//       );
//     },
//   }).addTo(map.map);

//   // Add an overlay (checkbox entry) with the given name to the control
//   map.subLayerControl.addOverlay(wardLayer, "wards_cyc");
//   if (zoomToExtent) {
//     map.map.fitBounds(wardLayer.getBounds());
//   }
//   // This section adds the ward layer descriptions (permanent Tooltip)
//   wardLayerLabels = L.geoJSON(data, {
//     style: wardsStyleLabels,
//     onEachFeature: function (feature, layer) {
//       // https://leafletjs.com/reference-1.4.0.html#tooltip
//       // layer.bindTooltip('<h1>' + feature.properties.wd17nm + '</h1><p>Code: ' + feature.properties.wd17cd + '</p>');
//       layer.bindTooltip(
//         function (layer) {
//           return layer.feature.properties.wd17nm; // sets the tooltip text
//         },
//         { permanent: true, direction: "center", opacity: 0.5 }
//       );
//     },
//   }); //.addTo(map); // uncomment this to display initial map with labels

//   map.subLayerControl.addOverlay(wardLayerLabels, "wards_labels"); // Adds an overlay (checkbox entry) with the given name to the control.
// }

const layersMapWards = new Map();

function addWardGroupsToMap(zoomToExtent = false) {
  const map = this.map;

  const wardBoundaries = L.geoJson(geoDataCYCWards, {
    style: styleWard,
    pane: "wardBoundaryPane",
    onEachFeature: function (feature, layer) {
      const category = +feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc

      if (!layersMapWards.has(category)) {
        layersMapWards.set(category, L.layerGroup());
      }
      layersMapWards.get(category).addLayer(layer);
    },
  });

  const ol = overlayWards(layersMapWards);
  overlaysTreeMain.children[3] = ol;

  if (zoomToExtent) {
    map.fitBounds(wardBoundaries.getBounds());
  }
}

const layersMapBoundaries = new Map();

function ccgBoundary(zoomToExtent = true) {
  const ccgBoundary = L.geoJSON(geoDataCCGBoundary, {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });

  layersMapBoundaries.set("voyCCGMain", ccgBoundary);
  ccgBoundary.addTo(mapMain.map);
  const overlayCCGs = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundary, //layersMapBoundaries.get("voyCCGMain"),
      },
    ],
  };
  overlaysTreeMain.children[2] = overlayCCGs;
  refreshMapMainControl();

  /* copy the layer - returns an object only so wrap  in L.geojson
    https://stackoverflow.com/questions/54385218/using-getbounds-on-geojson-feature
    https://github.com/Leaflet/Leaflet/issues/6484
    */

  const ccgBoundaryCopy1 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });
  // layersMapBoundaries.set("voyCCGSite", ccgBoundaryCopy1);
  ccgBoundaryCopy1.addTo(mapSites.map);
  const overlayCCGsSites = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy1, //layersMapBoundaries.get("voyCCGMain"),
      },
    ],
  };
  overlaysTreeSites.children[1] = overlayCCGsSites;
  refreshMapControlSites();

  const ccgBoundaryCopy2 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });
  // layersMapBoundaries.set("voyCCGPopn", ccgBoundaryCopy2);
  // ccgBoundaryCopy2.addTo(mapPopn.map);
  const overlayCCGsPopn = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy2, //layersMapBoundaries.get("voyCCGMain"),
      },
    ],
  };
  overlaysTreePopn.children[1] = overlayCCGsPopn;
  refreshMapControlPopn();

  const ccgBoundaryCopy3 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });
  // layersMapBoundaries.set("voyCCGIMD", ccgBoundaryCopy3);
  // ccgBoundaryCopy3.addTo(mapIMD.map);
  const overlayCCGsIMD = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy3, //layersMapBoundaries.get("voyCCGMain"),
      },
    ],
  };
  overlaysTreeIMD.children[1] = overlayCCGsIMD;
  refreshMapControlIMD();

  const ccgBoundaryCopy4 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });
  const overlayCCGsD3 = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy4, //layersMapBoundaries.get("voyCCGMain"),
      },
    ],
  };
  overlaysTreeBubble.children[1] = overlayCCGsD3;
  refreshMapControlBubble;

  if (zoomToExtent) {
    mapMain.map.fitBounds(ccgBoundary.getBounds());
    mapSites.map.fitBounds(ccgBoundaryCopy1.getBounds());
    mapPopn.map.fitBounds(ccgBoundaryCopy2.getBounds());
    mapIMD.map.fitBounds(ccgBoundaryCopy3.getBounds());
    mapD3Bubble.map.fitBounds(ccgBoundaryCopy4.getBounds());
  }
}

const layersMapLSOA = new Map();
const layersMapIMD = new Map();

function lsoaBoundary(zoomToExtent = false) {
  // let lsoaLayerLabels;

  // This section adds the lsoa layer in its entirety along with labels (permanent Tooltip)
  const lsoaLayer = L.geoJSON(geoDataLsoaBoundaries, {
    // style: styleLsoa, // default colour scheme for lsoa boundaries
    onEachFeature: function (feature, layer) {
      // layer.bindPopup(`<h1>${feature.properties.lsoa}</h1>`);

      let obj = dataIMD.find((x) => x.lsoa === layer.feature.properties.lsoa);
      if (obj !== undefined) {
        const category = obj.imdDecile;

        // const category = feature.properties.pcn_name; // category variable, used to store the overall imd
        // Initialize the category array if not already set.
        if (!layersMapIMD.has(category)) {
          layersMapIMD.set(category, L.layerGroup());
        }
        layersMapIMD.get(category).addLayer(layer);
      }
    },
    // filter: function (feature, layer) {
    //   return true;
    // },
  }); //.addTo(map.map);

  // const lsoaLayerCopy1 = L.geoJson(lsoaLayer.toGeoJSON(), {
  //   // style: styleCCG,
  //   // pane: "lsoaBoundaryPane",
  // });
  if (!layersMapLSOA.has("voyCCGPopn")) {
    layersMapLSOA.set("voyCCGPopn", lsoaLayer);
    // lsoaLayer.addTo(mapPopn.map);

    // layersMapLSOA.set("voyCCGIMD", lsoaLayerCopy1);
    // lsoaLayerCopy1.addTo(mapIMD.map);
  }

  // Add an overlay (checkbox entry) with the given name to the control
  const ol = overlayLSOA(layersMapIMD);
  overlaysTreeIMD.children[2] = ol;

  const lsoaLayerCopy1 = L.geoJson(lsoaLayer.toGeoJSON(), {
    style: styleLsoa, // default colour scheme for lsoa boundaries
    pane: "lsoaBoundaryPane",
  });
  const overlayLsoaD3Bubble = {
    label: "LSOA Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: lsoaLayerCopy1, //layersMapBoundaries.get("voyCCGMain"),
      },
    ],
  };
  overlaysTreeBubble.children[0] = overlayLsoaD3Bubble;
  refreshMapControlPopn2();

  // if (zoomToExtent) {
  //   mapPopn.map.fitBounds(lsoaLayer.getBounds());
  //   // mapIMD.map.fitBounds(lsoaLayerCopy1.getBounds());
  // }
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

// Used to subsequently filter IMD map once a practice selection has been made
const mapSelectedLSOA = new Map();

function filterFunctionLsoa(zoomToExtent = false) {
  mapSelectedLSOA.clear();
  const map = this.map;

  // if (map.hasLayer(lsoaLayer)) {
  // selectedLsoas
  map.removeLayer(layersMapLSOA.get("voyCCGPopn"));
  // }

  const lsoaLayer = L.geoJson(geoDataLsoaBoundaries, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    // style: styleLsoa,
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
        userSelections.selectedPractice !== undefined &&
        userSelections.selectedPractice !== "All Practices"
          ? data_popnGPLsoa
              .get(userSelections.nearestDate())
              .get(userSelections.selectedPractice)
              .get(lsoaCode)
          : data_popnGPLsoa
              .get(userSelections.nearestDate())
              .get("All")
              .get(lsoaCode);

      if (value > minPopulationLSOA) {
        mapSelectedLSOA.set(lsoaCode, value);
        return true;
      }
    },
  });

  layersMapLSOA.set("voyCCGPopn", lsoaLayer);
  lsoaLayer.addTo(mapPopn.map);

  // Update the control overlay
  const overlayLSOA = {
    label: "LSOA Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: practiceLookup.get(userSelections.selectedPractice),
        layer: lsoaLayer,
      },
    ],
  };
  overlaysTreePopn.children[2] = overlayLSOA;

  refreshMapControlPopn();

  if (zoomToExtent) {
    map.fitBounds(lsoaLayer.getBounds());
    mapIMD.map.fitBounds(lsoaLayer.getBounds());
    mapD3Bubble.map.fitBounds(lsoaLayer.getBounds());
  }
}

function refreshChartsPostPracticeChange(practice) {
  console.log(practice);
  highlightFeature(practice, mapMain, true); // console.log(event.text.label, event.text.value)
  trendChart.chartTrendDraw();
  demographicChart.updateChtDemog(
    practice,
    userSelections.selectedPracticeCompare
  );

  filterGPPracticeSites.call(mapSites, true);

  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  bubbleTest.updateD3BubbleLsoa();
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
    case "Selby Town":
      return L.marker(latlng, {
        icon: arrMarkerIcons[0],
        riseOnHover: true,
      });
    case "Tadcaster & Selby Rural Area":
      return L.marker(latlng, {
        icon: arrMarkerIcons[1],
        riseOnHover: true,
      });
    case "South Hambleton And Ryedale":
      return L.marker(latlng, {
        icon: arrMarkerIcons[2],
        riseOnHover: true,
      });
    case "York City Centre":
      return L.marker(latlng, {
        icon: arrMarkerIcons[3],
        riseOnHover: true,
      });
    case "York Medical Group":
      return L.marker(latlng, {
        icon: arrMarkerIcons[4],
        riseOnHover: true,
      });
    case "York East":
      return L.marker(latlng, {
        icon: arrCircleIcons[7],
        riseOnHover: true,
      });
    case "West, Outer and North East York":
      return L.marker(latlng, {
        icon: arrCircleDotIcons[7],
        riseOnHover: true,
      });
    // case "NIMBUSCARE LTD":
    //   switch (feature.properties.sub_group) {
    //     case "1":
    //       return L.marker(latlng, {
    //         icon: arrCircleIcons[7],
    //         riseOnHover: true,
    //       });
    //     case "2":
    //       return L.marker(latlng, {
    //         icon: arrCircleDotIcons[7],
    //         riseOnHover: true,
    //       });
    //     case "3":
    //       return L.marker(latlng, {
    //         icon: arrRectangleIcons[7],
    //         riseOnHover: true,
    //       });
    //     default:
    //       return L.marker(latlng, {
    //         icon: arrDoughnutIcons[7],
    //         riseOnHover: true,
    //       });
    //   }
    default:
      return L.marker(latlng, {
        icon: arrDoughnutIcons[0],
        riseOnHover: true,
      });
  }
};

// const layersMapGpPcn = new Map(); // rename to something like layersGpPcn

// async function addPCNToMap2() {
//   const map = this.map;

//   geoDataPCN.then(function (v) {
//     const pcnSites = L.geoJson(v, {
//       // https://leafletjs.com/reference-1.7.1.html#geojson
//       pointToLayer: pcnFormatting,
//       onEachFeature: function (feature, layer) {
//         const popupText =
//           "<h3>" +
//           layer.feature.properties.pcn_name +
//           "</h3>" +
//           "<p>" +
//           layer.feature.properties.practice_code +
//           ": " +
//           layer.feature.properties.practice_name +
//           "<br>Clinical Director: " +
//           layer.feature.properties.clinical_director +
//           "<br>Population: " +
//           formatNumber(layer.feature.properties.list_size) +
//           "</p>";

//         layer.bindPopup(popupText);
//         layer.on("mouseover", function (e) {
//           this.openPopup();
//         });
//         layer.on("mouseout", function (e) {
//           this.closePopup();
//         });

//         layer.on("click", function (e) {
//           // update other charts
//           (userSelections.selectedPractice = feature.properties.practice_code), // change the practice to whichever was clicked
//             (practiceName = feature.properties.practice_name),
//             (selectedPCN = feature.properties.pcn_name);
//           console.log(userSelections.selectedPractice + " - " + practiceName);

//           filterFunctionPCN2(mapPCNSite.map, mapPCNSite.layerControl);
//           // updateTextPractice();
//           updateTextPCN();
//           updateSidebarText("pcnSpecific", layer.feature.properties.pcn_name);
//         });

//         const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
//         // Initialize the category array if not already set.
//         if (!layersMapGpPcn.has(category)) {
//           layersMapGpPcn.set(category, L.layerGroup());
//         }
//         layersMapGpPcn.get(category).addLayer(layer);
//       },
//     });

//     // for (let [key, value] of layersMapGpPcn) {
//     //   // Adds an overlay (checkbox entry) with the given name to the control.
//     //   control.addOverlay(value, key, "test");
//     // }

//     /*
//     The layer groups are available in the overlay and can be toggled on
//     The setting below will set them to on by default and display the layer group on the map
//     */
//     L.layerGroup(Array.from(layersMapGpPcn.values())).addTo(map);
//     if (zoomToExtent) {
//       map.fitBounds(pcnSites.getBounds());
//     }
//   });
// }

// function filterFunctionPCN2(map, control) {
//   map.removeLayer(defaultSites);
//   for (let sc in subCategories) {
//     if (map.hasLayer(subCategories[sc])) {
//       map.removeLayer(subCategories[sc]);
//     }
//   }
//   subCategories = {};
//   geoDataPCNSites.then(function (v) {
//     const gpSites = L.geoJson(data, {
//       // https://leafletjs.com/reference-1.4.0.html#geojson
//       pointToLayer: pcnFormatting,
//       onEachFeature: function (feature, layer) {
//         const popupText =
//           "<h3>" +
//           layer.feature.properties.pcn_name +
//           "</h3>" +
//           "<p>" +
//           layer.feature.properties.organisation_code +
//           ": " +
//           layer.feature.properties.organisation_name +
//           "<br>Parent Org: " +
//           layer.feature.properties.parent_organisation_code +
//           "</p>";

//         layer.bindPopup(popupText);
//         layer.on("mouseover", function (e) {
//           this.openPopup();
//         });
//         layer.on("mouseout", function (e) {
//           this.closePopup();
//         });

//         layer.on("click", function (e) {
//           // update other charts
//           (userSelections.selectedPractice = feature.properties.organisation_code), // change the practice to whichever was clicked
//             (practiceName = feature.properties.organisation_name);
//           // console.log(userSelections.selectedPractice + " - " + practiceName);
//         });

//         subCategory = feature.properties.pcn_name; // subCategory variable, used to store the distinct feature eg. phc_no, practice_group etc
//         // Initialize the subCategory array if not already set.
//         if (typeof subCategories[subCategory] === "undefined") {
//           subCategories[subCategory] = L.layerGroup().addTo(map); // subCategories {object} used to create an object with key = subCategory, value is array
//           // control.addOverlay(
//           // 	subCategories[subCategory],
//           // 	subCategory
//           // );
//         }
//         // console.log(subCategories[subCategory]);
//         subCategories[subCategory].addLayer(layer);
//       },
//       filter: function (d) {
//         // console.log(d.properties.organisation_code)
//         const strPractice = d.properties.organisation_code;
//         const strPCN = d.properties.pcn_name;

//         if (selectedPCN !== undefined) {
//           if (strPCN === selectedPCN) {
//             return true;
//           } else {
//             return false;
//           }
//         } else {
//           return true;
//         }
//       },
//     });
//     map.fitBounds(gpSites.getBounds());
//   });
// }

/* Original
function addPracticeToMap(zoomToExtent = false) {
  const map = this.map;
  // let categories = {},
  //   category;

    geoDataGPMain.then(function(v){
  const practiceMain = L.geoJson(v, {
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
        (userSelections.selectedPractice = feature.properties.practice_code), // change the practice to whichever was clicked
          (practiceName = feature.properties.practice_name);
        // console.log(userSelections.selectedPractice + " - " + practiceName);
        document.getElementById("selPractice").value = userSelections.selectedPractice; // change the selection box dropdown to reflect clicked practice
        refreshChartsPostPracticeChange(userSelections.selectedPractice);
      });

      category = feature.properties.locality; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // Initialize the category array if not already set.
      // if (typeof categories[category] === "undefined") {
      //   categories[category] = L.layerGroup().addTo(map); // categories {object} used to create an object with key = category, value is array
      //   // map.layerControl.addOverlay(categories[category], "PCH: " + category);
      // }
      // categories[category].addLayer(layer);

      // const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
      // // Initialize the category array if not already set.
      if (!layersMapGpMain.has(category)) {
        layersMapGpMain.set(category, L.layerGroup());
      }
      layersMapGpMain.get(category).addLayer(layer);
    },
  });
  L.layerGroup(Array.from(layersMapGpMain.values())).addTo(map);
  if (zoomToExtent) {
    map.fitBounds(practiceMain.getBounds());
      }
    })
}
*/

function overlayPCNs(mapObj) {
  return {
    label: "Sites by PCN",
    selectAllCheckbox: true,
    // collapsed: true,
    children: [
      {
        label: "Vale of York",
        selectAllCheckbox: true,
        children: [
          {
            label: "North",
            selectAllCheckbox: true,
            children: [
              {
                label: "South Hambleton And Ryedale",
                layer: mapObj.get("South Hambleton And Ryedale"),
              },
            ],
          },
          {
            label: "Central",
            selectAllCheckbox: true,
            children: [
              {
                label: "Priory Medical Group",
                layer: mapObj.get("Priory Medical Group"),
              },
              {
                label: "West, Outer and North East York",
                layer: mapObj.get("West, Outer and North East York"),
              },
              {
                label: "York City Centre",
                layer: mapObj.get("York City Centre"),
              },
              {
                label: "York East",
                layer: mapObj.get("York East"),
              },
              {
                label: "York Medical Group",
                layer: mapObj.get("York Medical Group"),
              },
            ],
          },
          {
            label: "South",
            selectAllCheckbox: true,
            children: [
              {
                label: "Selby Town",
                layer: mapObj.get("Selby Town"),
              },
              {
                label: "Tadcaster & Selby Rural Area",
                layer: mapObj.get("Tadcaster & Selby Rural Area"),
              },
            ],
          },
        ],
      },
    ],
  };
}

function overlayTrusts() {
  return {
    label: "Hospital Sites <i class='fas fa-hospital-symbol'></i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "York",
        layer: trustMarker(trustSitesLoc.yorkTrust, "York Trust"),
      },
      {
        label: "Harrogate",
        layer: trustMarker(trustSitesLoc.harrogateTrust, "Harrogate Trust"),
      },
      {
        label: "Scarborough",
        layer: trustMarker(trustSitesLoc.scarboroughTrust, "Scarborough Trust"),
      },
      {
        label: "Leeds",
        layer: trustMarker(trustSitesLoc.leedsTrust, "Leeds Trust"),
      },
      {
        label: "South Tees",
        layer: trustMarker(trustSitesLoc.southTeesTrust, "South Tees Trust"),
      },
      {
        label: "Hull",
        layer: trustMarker(trustSitesLoc.hullTrust, "Hull Trust"),
      },
    ],
  };
}

function overlayWards(mapObj) {
  return {
    label: "Ward Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "CYC",
        selectAllCheckbox: true,
        children: [
          {
            label: "Ward Group: 1",
            layer: mapObj.get(1),
          },
          {
            label: "Ward Group: 2",
            layer: mapObj.get(2),
          },
          {
            label: "Ward Group: 3",
            layer: mapObj.get(3),
          },
          {
            label: "Ward Group: 4",
            layer: mapObj.get(4),
          },
          {
            label: "Ward Group: 5",
            layer: mapObj.get(5),
          },
          {
            label: "Ward Group: 6",
            layer: mapObj.get(6),
          },
        ],
      },
    ],
  };
}

function overlayLSOA(mapObj) {
  return {
    label: "LSOA by IMD",
    selectAllCheckbox: true,
    children: [
      {
        label: "IMD: 1 (Most Deprived)",
        layer: mapObj.get(1),
      },
      {
        label: "IMD: 2",
        layer: mapObj.get(2),
      },
      {
        label: "IMD: 3",
        layer: mapObj.get(3),
      },
      {
        label: "IMD: 4",
        layer: mapObj.get(4),
      },
      {
        label: "IMD: 5",
        layer: mapObj.get(5),
      },
      {
        label: "IMD: 6",
        layer: mapObj.get(6),
      },
      {
        label: "IMD: 7",
        layer: mapObj.get(7),
      },
      {
        label: "IMD: 8",
        layer: mapObj.get(8),
      },
      {
        label: "IMD: 9",
        layer: mapObj.get(9),
      },
      {
        label: "IMD: 10  (Least Deprived)",
        layer: mapObj.get(10),
      },
    ],
  };
}

const mapHospitalLayers = new Map();

function processDataHospitalSite(d) {
  if (isNaN(+d.Latitude)) {
    console.log(d.OrganisationCode, d.Latitude);
  } else {
    const marker = new L.marker([+d.Latitude, +d.Longitude], {
      icon: L.BeautifyIcon.icon({
        iconShape: "circle",
        icon: "h-square",
        borderColor: "transparent",
        backgroundColor: "transparent",
        textColor: hospitalSiteColour(d.Sector), // Text color of marker icon
      }),
      zIndexOffset: 1000,
      draggable: false,
    }).bindPopup(
      `<h3>${d.OrganisationCode}</h3>
        <p>${d.OrganisationCode}: ${d.OrganisationName}
        <br>${d.Sector}
        <br><p>${d.ParentODSCode}: ${d.ParentName}</p>`
    );

    const category = d.Sector; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
    if (!mapHospitalLayers.has(category)) {
      // Initialize the category array if not already set.
      mapHospitalLayers.set(category, L.layerGroup());
    }
    mapHospitalLayers.get(category).addLayer(marker);
  }

  // Reference if wanted to auto add to map
  //   L.layerGroup(Array.from(mapHospitalLayers.values())).addTo(map);

  //   // Add to overlay control
  //   const ol = overlayPCNs(mapHospitalLayers);
  //   overlaysTreeMain.children[0] = ol;
}

function processDataIMD(d) {
  return {
    lsoa: d.LSOA_code_2011,
    imdRank: +d.Index_of_Multiple_Deprivation_IMD_Rank,
    imdDecile: +d.Index_of_Multiple_Deprivation_IMD_Decile,
    incomeRank: +d.Income_Rank,
    employmentRank: +d.Employment_Rank,
    educationRank: +d.Education_Skills_and_Training_Rank,
    healthRank: +d.Health_Deprivation_and_Disability_Rank,
    crimeRank: +d.Crime_Rank,
    housingRank: +d.Barriers_to_Housing_and_Services_Rank,
    livingEnvironRank: +d.Living_Environment_Rank,
    incomeChildRank: +d.Income_Deprivation_Affecting_Children_Index_Rank,
    incomeOlderRank: +d.Income_Deprivation_Affecting_Older_People_Rank,
    childRank: +d.Children_and_Young_People_Subdomain_Rank,
    adultSkillsRank: +d.Adult_Skills_Subdomain_Rank,
    geogRank: +d.Geographical_Barriers_Subdomain_Rank,
    barriersRank: +d.Wider_Barriers_Subdomain_Rank,
    indoorsRank: +d.Indoors_Subdomain_Rank,
    outdoorsRank: +d.Outdoors_Subdomain_Rank,
    totalPopn: +d.Total_population_mid_2015,
    dependentChildren: +d.Dependent_Children_aged_0_15_mid_2015,
    popnMiddle: +d.Population_aged_16_59_mid_2015,
    popnOlder: +d.Older_population_aged_60_and_over_mid_2015,
    popnWorking: +d.Working_age_population_18_59_64,
  };
}

function hospitalSiteColour(sector) {
  switch (sector) {
    case "NHS Sector":
      return "rgba(255, 0, 0)";
    case "Independent Sector":
      return "rgba(0,0,255)";
  }
}

// Make global to enable subsequent change to overlay
const overlaysTreePopn = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const mapPopn = {
  map: mapInitialise.mapInit("mapPopnLSOA"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

const baseTreePopn = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stamen.TonerHybrid")
    .addTo(mapPopn.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  // http://leaflet-extras.github.io/leaflet-providers/preview/
  return {
    label: "Base Layers <i class='fas fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fas fa-layer-group'></i>;",
        children: [
          { label: "OSM", layer: L.tileLayer.provider("OpenStreetMap.Mapnik") },
          {
            label: "OSM HOT",
            layer: L.tileLayer.provider("OpenStreetMap.HOT"),
          },
          // { label: "CartoDB", layer: L.tileLayer.provider("CartoDB.Voyager") },
          {
            label: "Water Colour",
            layer: L.tileLayer.provider("Stamen.Watercolor"),
          },
          { label: "Bright", layer: L.tileLayer.provider("Stadia.OSMBright") },
          { label: "Topo", layer: L.tileLayer.provider("OpenTopoMap") },
        ],
      },
      {
        label: "Black & White <i class='fas fa-layer-group'></i>",
        children: [
          // { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron") },
          {
            label: "High Contrast",
            layer: L.tileLayer.provider("Stamen.Toner"),
          },
          {
            label: "Grey",
            layer: L.tileLayer.provider("Stadia.AlidadeSmooth"),
          },
          { label: "ST Hybrid", layer: defaultBasemap },
          {
            label: "Dark",
            layer: L.tileLayer.provider("Stadia.AlidadeSmoothDark"),
          },
          {
            label: "Jawg Matrix",
            layer: L.tileLayer.provider("Jawg.Matrix", {
              // // Requires Access Token
              accessToken:
                "phg9A3fiyZq61yt7fQS9dQzzvgxFM5yJz46sJQgHJkUdbdUb8rOoXviuaSnyoYQJ", //  biDemo
            }),
          },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

overlaysTreePopn.children[0] = overlayTrusts();

const mapControlPopn = L.control.layers.tree(baseTreePopn, overlaysTreePopn, {
  // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
  collapsed: true, // Whether or not control options are displayed
  sortLayers: true,
  // namedToggle: true,
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
  closedSymbol:
    "<i class='far fa-plus-square'></i> <i class='far fa-folder'></i>", // Symbol displayed on a closed node
  openedSymbol:
    "<i class='far fa-minus-square'></i> <i class='far fa-folder-open'></i>", // Symbol displayed on an opened node
});

mapControlPopn
  .addTo(mapPopn.map)
  // .setOverlayTree(overlaysTreePopn)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true); // true to collapse the overlays tree
// .expandSelected(true); // expand selected option in the overlays tree

// const colourScaleRed = d3.scaleSequential(d3.interpolateReds);
// const interpolatorRed = colourScaleRed.interpolator(); // read its interpolator
// const colourScaleRedReverse = (t) => interpolatorRed(1 - t); // creates a mirror image of the interpolator

/*
The following was the original heatmap legend code using svg rather than canvas for the colour ramp
This has been replaced using the above legendWrapper function
*/

/*


function heatmapLegend(
  placementID,
  id,
  legendText
  // colourScheme = d3.interpolateYlGnBu
) {
  const legendID = id,
    // gradientID = `gradient_${id}`;
    footerMapPopn = document.getElementById(placementID);

  const svgLegend = d3
    .select(footerMapPopn)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
      ${chtWidthWide + margin.left + margin.right}
      ${chtHeightShort / 4}`
    )
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left - 20})`);

  const xScaleLegendMapPopn = d3
    .scaleLinear()
    // .domain([0, maxValue])
    .range([0, chtWidthWide])
    .nice();

  const xAxisLegendMapPopn = d3
    .axisBottom(xScaleLegendMapPopn)
    .tickFormat(formatNumber);

  svgLegend
    .append("g")
    // .attr("class", "x axis")
    .attr("id", legendID)
    .attr("transform", `translate(0, ${chtHeightShort / 4 - 33})`) // positions the axis
    .call(xAxisLegendMapPopn)
    .append("text")
    .attr("x", chtWidthWide / 2)
    .attr("dy", "30px") // positions the axis label text
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "#000000") // font colour
    .text(legendText);

  // axis sub headings
  d3.select(`#${legendID}`)
    .append("text")
    .attr("x", 0)
    .attr("dy", "30px") // positions the axis label text
    .style("text-anchor", "start")
    // .style("font-weight", "bold")
    .style("fill", "#ff0000") // font colour
    .text("High Deprivation");

  d3.select(`#${legendID}`)
    .append("text")
    .attr("x", chtWidthWide)
    .attr("dy", "30px") // positions the axis label text
    .style("text-anchor", "end")
    // .style("font-weight", "bold")
    .style("fill", "#ff0000") // font colour
    .text("Low Deprivation");

  function updateMapPopnLegend(
    maxValue = 1,
    colourScheme = d3.interpolateYlGnBu
  ) {
    // legend is made up from lots of small rect
    let noRect = 100; // how many rect make up the legend
    if (maxValue < 20) {
      noRect = maxValue;
      xScaleLegendMapPopn.domain([1, maxValue]);
    } else {
      xScaleLegendMapPopn.domain([0, maxValue]);
    }
    let defaultWidth = Math.floor(chtWidthWide / noRect); // approx size of each individual rect

    const data = d3.range(noRect), // array [0, 1, 2, ..., 99]
      xScale = d3
        .scaleLinear()
        .domain(d3.extent(data))
        .range([0, chtWidthWide - defaultWidth]);

    const colourScale = d3
      .scaleSequential()
      .interpolator(colourScheme)
      .domain(d3.extent(data));

    svgLegend
      .selectAll(".legendRect")
      .data(data)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "legendRect")
      .attr("x", function (d) {
        return Math.floor(xScale(d));
      })
      .attr("width", (d) => {
        if (d == 99) {
          return 6;
        }
        return Math.floor(xScale(d + 1)) - Math.floor(xScale(d)) + 1;
      })
      .attr("y", "0px")
      .attr("height", "30")
      .attr("fill", (d) => colourScale(d));
    // .attr("stroke", "red");

    svgLegend
      .select(`#${legendID}`)
      // .transition(t)
      .call(xAxisLegendMapPopn);
  }

  return updateMapPopnLegend;
}

// let refreshMapPopnLegend = heatmapLegend(
//   "footerMapPopn",
//   "mapPopnLegend",
//   "Population"
// );
// let refreshMapIMDLegend = heatmapLegend("footerMapIMD", "mapIMDLegend", "Rank");

*/
