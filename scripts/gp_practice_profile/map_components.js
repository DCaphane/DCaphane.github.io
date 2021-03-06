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

function mapInitialise(mapID) {
  // for initialising maps

  const thisMap = L.map(mapID, {
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

  // Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
  function scaleBar({ position = "bottomleft" } = {}) {
    return L.control
      .scale({
        // https://leafletjs.com/reference-1.7.1.html#control-scale-option
        position: position,
        metric: true,
        imperial: true,
      })
      .addTo(thisMap);
  }

  function sideBar({ side = "left" } = {}) {
    const divMapID = document.getElementById(mapID); // used to store div where map will be created
    // create a div that will contain the sidebar
    const div = document.createElement("div");
    // give the div an id (used to identify container) and class
    const divSidebarID = genID.uid(`sidebar${side}`).id;
    div.setAttribute("id", divSidebarID);
    div.setAttribute("class", "leaflet-sidebar collapsed");
    divMapID.insertAdjacentElement("afterend", div);

    return new L.control.sidebar({
      autopan: false, // whether to maintain the centered map point when opening the sidebar
      closeButton: true, // whether to add a close button to the panes
      container: divSidebarID, // the DOM container or #ID of a predefined sidebar container that should be used
      position: side, // left or right
    }).addTo(thisMap);
  }

  /*
    The default figures here are the VoY CCG boundary
    layersMapBoundaries.get("voyCCGMain").getBounds().getCenter()
    latLngPoint can be an array [54.018213, -0.9849195] or object {lat: 54.018213, lng: -0.9849195}
    */
  let home = { lat: 54.018213, lng: -0.9849195 };

  function zoomTo({ latLng = home, zoom = 9 } = {}) {
    thisMap.flyTo(latLng, zoom);
  }

  function homeButton() {
    return L.easyButton("fa-solid fa-house", zoomTo, "Zoom To Home").addTo(
      thisMap
    );
  }

  // Panes to control zIndex of geoJson layers
  thisMap.createPane("ccgBoundaryPane");
  thisMap.getPane("ccgBoundaryPane").style.zIndex = 374;

  thisMap.createPane("wardBoundaryPane");
  thisMap.getPane("wardBoundaryPane").style.zIndex = 375;

  thisMap.createPane("lsoaBoundaryPane");
  thisMap.getPane("lsoaBoundaryPane").style.zIndex = 376;

  function baselayers(defaultBL = "Bright") {
    // const defaultBasemap =
    //   .addTo(mapMain.map);

    /*
  Ordnance Survey demo
  Need to import mapbox-gl
  Through OS Vector Tile API you can connect to different layers for different use cases, including a detailed basemap and several data overlays.
  https://osdatahub.os.uk/docs/vts/technicalSpecification

  Can also use for data overlays
  https://api.os.uk/maps/vector/v1/vts/{layer-name} eg. boundaries, greenspace

  See also for stylesheets:
  https://github.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets
  https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/

  Leaflet:
    https://osdatahub.os.uk/projects/OSMapsWebDemo
    OS_VTS_3857_No_Labels.json
    OS_VTS_3857_Open_Outdoor.json
    OS_VTS_3857_Greyscale.json
    OS_VTS_3857_Dark.json
    OS_VTS_3857_Light.json
    */

    const serviceUrl = "https://api.os.uk/maps/raster/v1/zxy",
      apiKey = "npRUEEMn3OTN7lx7RPJednU5SOiRSt35";

    let copyrightStatement =
      "Contains OS data &copy; Crown copyright and database rights YYYY"; // '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
    copyrightStatement = copyrightStatement.replace(
      "YYYY",
      new Date().getFullYear()
    );
    // Load and display vector tile layer on the map.
    const osBaselayers = {
      light: L.tileLayer(
        serviceUrl + "/Light_3857/{z}/{x}/{y}.png?key=" + apiKey,
        { maxZoom: 20, attribution: copyrightStatement }
      ),
      road: L.tileLayer(
        serviceUrl + "/Road_3857/{z}/{x}/{y}.png?key=" + apiKey,
        {
          maxZoom: 20,
          attribution: copyrightStatement,
        }
      ),
      outdoor: L.tileLayer(
        serviceUrl + "/Outdoor_3857/{z}/{x}/{y}.png?key=" + apiKey,
        { maxZoom: 20, attribution: copyrightStatement }
      ),
      //   // Doesn't exist for 3857 projection
      // leisure: L.tileLayer(
      //   serviceUrl + '/Leisure_3857/{z}/{x}/{y}.png?key=' + apiKey, { maxZoom: 20, attribution: copyrightStatement }
      //   ),
    };

    /*
    // Explore Ordnance Survey Overlay without mapBoxGL and how to format
    https://labs.os.uk/public/os-data-hub-examples/os-vector-tile-api/vts-example-add-overlay

    // https://api.os.uk/maps/vector/v1/vts/boundaries/resources/styles?key=npRUEEMn3OTN7lx7RPJednU5SOiRSt35
    const osOverlayBoundary = L.mapboxGL({
      attribution:
        '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
      style: `${serviceUrl}/boundaries/resources/styles?key=${apiKey}`,
      transformRequest: (url) => {
        return {
          url: (url += "&srs=3857"),
        };
      },
    });

    const osOverlay = {
      label: "OS Test <i class='material-icons md-12'>category</i>",
      selectAllCheckbox: true,
      children: [
        {
          label: "Boundary",
          layer: osOverlayBoundary,
        },
      ],
    };

    overlaysTreeMain.children[5] = osOverlay;
  */

    // http://leaflet-extras.github.io/leaflet-providers/preview/
    const baselayersTree = {
      label: "Base Layers <i class='fa-solid fa-globe'></i>",
      children: [
        {
          label: "Colour <i class='fa-solid fa-layer-group'></i>",
          children: [
            {
              label: "OSM",
              layer: L.tileLayer.provider("OpenStreetMap.Mapnik"),
            },
            {
              label: "OSM HOT",
              layer: L.tileLayer.provider("OpenStreetMap.HOT"),
            },
            // { label: "CartoDB", layer: L.tileLayer.provider("CartoDB.Voyager") },
            {
              label: "Water Colour",
              layer: L.tileLayer.provider("Stamen.Watercolor"),
            },
            {
              label: "Bright",
              layer: L.tileLayer.provider("Stadia.OSMBright"),
            }, // .Mapnik
            { label: "Topo", layer: L.tileLayer.provider("OpenTopoMap") },
          ],
        },
        {
          label: "Black & White <i class='fa-solid fa-layer-group'></i>",
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
            {
              label: "ST Hybrid",
              layer: L.tileLayer.provider("Stamen.TonerHybrid"),
            },
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
        {
          label: "Ordnance Survey <i class='fa-solid fa-layer-group'></i>",
          children: [
            { label: "OS Light", layer: osBaselayers.light },
            { label: "OS Road", layer: osBaselayers.road },
            { label: "OS Outdoor", layer: osBaselayers.outdoor },
            // { label: "OS Leisure", layer: osBaseLayers.leisure },
          ],
        },
        {
          label: "None",
          // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
          layer: L.tileLayer("", {
            zoom: 0,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
        },
      ],
    };

    /*
  The following loops through the baselayersTree structure looking for label name = baselayer name (passed in function)
  If found, this will be the selected (default) baselayer for the given map
  */

    for (let key in baselayersTree.children) {
      let found = false;
      const obj = baselayersTree.children[key];
      if (obj.hasOwnProperty("children")) {
        const arr = baselayersTree.children[key].children;

        for (let i = 0; i < arr.length; i++) {
          // console.log({ label: arr[i].label, layer: arr[i].layer });
          if (arr[i].label === defaultBL) {
            arr[i].layer.addTo(thisMap);
            found = true;
            break;
          }
        }
      } else {
        // console.log({ label: obj.label, layer: obj.layer });
        if (obj.label === defaultBL) {
          obj.layer.addTo(thisMap);
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }

    return baselayersTree;
  }

  // Global to enable subsequent change to overlay
  const overlays = {
    label: "Overlays",
    selectAllCheckbox: true,
    children: [],
  };

  function layerControl(bl) {
    return L.control.layers
      .tree(bl, overlays, {
        // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
        collapsed: true, // Whether or not control options are displayed
        sortLayers: true,
        // namedToggle: true,
        collapseAll: "Collapse all",
        expandAll: "Expand all",
        // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
        closedSymbol:
          "<i class='fa-solid fa-square-plus'></i> <i class='fa-solid fa-folder'></i>", // Symbol displayed on a closed node
        openedSymbol:
          "<i class='fa-solid fa-square-minus'></i> <i class='fa-solid fa-folder-open'></i>", // Symbol displayed on an opened node
      })
      .addTo(thisMap);
  }

  return {
    map: thisMap,
    scaleBar: scaleBar,
    sideBar: sideBar,
    home: home,
    homeButton: homeButton,
    zoomTo: zoomTo,
    // LayerTreeControl
    baselayers: baselayers,
    overlays: overlays,
    layerControl: layerControl,
  };
}

// consider incorporating this into mapinit
// options around fitBounds, setView
function defaultHomeVoY() {
  const map = this.map;
  map.fitBounds(layersMapBoundaries.get("voyCCGMain").getBounds());
}

// Example using a handful of selected Trust locations
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

// function homeButton() {
//   const map = this.map;
//   return L.easyButton(
//     "fa-solid fa-house",
//     function (btn) {
//       // map.setView(trustSitesLoc.yorkTrust, 9);
//       map.setView(
//         layersMapBoundaries.get("voyCCGMain").getBounds().getCenter(),
//         9
//       );
//     },
//     "Zoom To Home"
//   ).addTo(map);
// }

const layersMapGpMain = new Map();

function addPracticeToMap(zoomToExtent = false) {
  const map = this.map;
  // let categories = {},
  //   category;

  const practiceMain = L.geoJson(geoDataPCN, {
    // https://leafletjs.com/reference-1.7.1.html#geojson
    pointToLayer: function (feature, latlng) {
      return pcnFormatting(feature, latlng, { addBounce: true });
    },
    onEachFeature: function (feature, layer) {
      const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
          <p>${layer.feature.properties.practice_code}: ${
        layer.feature.properties.practice_name
      }
          <br>Clinical Director: ${layer.feature.properties.clinical_director}
          <br>Population: ${formatNumber(
            layer.feature.properties.list_size
          )}</p>`;

      layer.bindPopup(popupText, { className: "popup-dark" }); // formatting applied in css, css/leaflet_tooltip.css
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });
      layer.on("click", function (e) {
        // console.log(e.sourceTarget.feature.properties.practice_code);
        const selectedPractice = feature.properties.practice_code;
        if (userSelections.selectedPractice !== selectedPractice) {
          // update the Practice in userSelections
          userSelections.selectedPractice = selectedPractice;
          // update other charts
          refreshChartsPostPracticeChange(selectedPractice);
        }
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

/*
Define options of bouncing for all markers
https://github.com/hosuaby/Leaflet.SmoothMarkerBouncing#options-of-bouncing

When pcnFormatting is called, if bounce parameter is set to true,
  toggleBouncing is applied to the marker.
  This will stop/ start the bouncing when the marker is clicked

The function updateBouncingMarkers is applied when a practice change is made
Either via the practice selection drop down or on marker click
*/
L.Marker.setBouncingOptions({
  bounceHeight: 15, // height of the bouncing
  contractHeight: 12,
  bounceSpeed: 52, // bouncing speed coefficient
  contractSpeed: 52,
  // shadowAngle: null,
  elastic: true,
  exclusive: true,
});

function updateBouncingMarkers() {
  // https://github.com/hosuaby/Leaflet.SmoothMarkerBouncing
  /*
  // stop all bouncing
  This would apply to all maps with bouncing.
  If only wanted to apply to specific map (eg. mapMain)
    step 1: test userSelections.selectedPractice !== "All Practices"
    step 2: loop through markers (like below, no need to check practice) and set to .stopBouncing()
  */
  L.Marker.stopAllBouncingMarkers();

  // array of layers in the mapMain
  const arr = Array.from(layersMapGpMain.values());
  arr.forEach(function (test) {
    let obj = test._layers;
    Object.values(obj).forEach(function (val) {
      const gpPractice = val.feature.properties.practice_code;
      const marker = val._bouncingMotion.marker;
      if (gpPractice === userSelections.selectedPractice) {
        marker.bounce(); // starts/stops bouncing of the marker
      }
    });
  });
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

      layer.bindPopup(popupText, { className: "popup-dark" });
      layer.on("mouseover", function (e) {
        this.openPopup();
      });
      layer.on("mouseout", function (e) {
        this.closePopup();
      });
      layer.on("click", function (e) {
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
        // layer.on("click", function (e) {
        // });
      },
      filter: function (d) {
        // match site codes based on 6 char GP practice code
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
      .collapseTree(true);

    if (zoomToExtent) {
      map.fitBounds(gpSites.getBounds().pad(0.1));
    }
  });
}

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

  /* copy the layer - returns an object only so wrap  in L.geojson
    https://stackoverflow.com/questions/54385218/using-getbounds-on-geojson-feature
    https://github.com/Leaflet/Leaflet/issues/6484
    */

  const ccgBoundaryCopy1 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });

  ccgBoundaryCopy1.addTo(mapSites.map);
  const overlayCCGsSites = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy1,
      },
    ],
  };
  overlaysTreeSites.children[1] = overlayCCGsSites;

  const ccgBoundaryCopy2 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });

  const overlayCCGsPopn = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy2,
      },
    ],
  };
  overlaysTreePopn.children[1] = overlayCCGsPopn;

  const ccgBoundaryCopy3 = L.geoJson(ccgBoundary.toGeoJSON(), {
    style: styleCCG,
    pane: "ccgBoundaryPane",
  });

  const overlayCCGsIMD = {
    label: "CCG Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: ccgBoundaryCopy3,
      },
    ],
  };
  overlaysTreeIMD.children[1] = overlayCCGsIMD;

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
        layer: ccgBoundaryCopy4,
      },
    ],
  };
  overlaysTreeBubble.children[1] = overlayCCGsD3;

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
  // This section adds the lsoa layer in its entirety along with labels (permanent Tooltip)
  const lsoaLayer = L.geoJSON(geoDataLsoaBoundaries, {
    // style: styleLsoa, // default colour scheme for lsoa boundaries
    onEachFeature: function (feature, layer) {
      // layer.bindPopup(`<h1>${feature.properties.lsoa}</h1>`);

      let obj = dataIMD.find((x) => x.lsoa === layer.feature.properties.lsoa);
      if (obj !== undefined) {
        const category = obj.imdDecile;

        // Initialize the category array if not already set.
        if (!layersMapIMD.has(category)) {
          layersMapIMD.set(category, L.layerGroup());
        }
        layersMapIMD.get(category).addLayer(layer);
      }
    },
  });

  if (!layersMapLSOA.has("voyCCGPopn")) {
    layersMapLSOA.set("voyCCGPopn", lsoaLayer);
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
        layer: lsoaLayerCopy1,
      },
    ],
  };
  overlaysTreeBubble.children[0] = overlayLsoaD3Bubble;

  return;
}

// Used to subsequently filter IMD map once a practice selection has been made
const mapSelectedLSOA = new Map();

function filterFunctionLsoa(zoomToExtent = false) {
  mapSelectedLSOA.clear();
  const map = this.map;

  map.removeLayer(layersMapLSOA.get("voyCCGPopn"));

  const lsoaLayer = L.geoJson(geoDataLsoaBoundaries, {
    // https://leafletjs.com/reference-1.4.0.html#geojson
    // style: styleLsoa,
    onEachFeature: function (feature, layer) {
      layer.on("click", function (e) {
        // update other charts
        selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
        console.log(selectedLsoa);
      });
    },
    filter: function (d) {
      // console.log(d.properties.lsoa)
      const lsoaCode = d.properties.lsoa;

      let value =
        userSelections.selectedPractice !== undefined &&
        userSelections.selectedPractice !== "All Practices"
          ? dataPopulationGPLsoa
              .get(userSelections.nearestDate())
              .get(userSelections.selectedPractice)
              .get(lsoaCode)
          : dataPopulationGPLsoa
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

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightedPractice !== "undefined") {
    map.map.removeLayer(highlightedPractice);
  }

  highlightedPractice = L.geoJSON(geoDataPCN, {
    pointToLayer: function (feature, latlng) {
      if (feature.properties.practice_code === selPractice) {
        return (markerLayer = L.marker(latlng, {
          icon: arrHighlightIcons[5],
          zIndexOffset: -5,
        }));
      }
    },
  });

  if (selPractice === "All Practices" || selPractice === undefined) {
    defaultHomeVoY.call(mapMain);
  } else {
    map.map.addLayer(highlightedPractice);

    if (zoomToExtent) {
      // map.map.fitBounds(highlightedPractice.getBounds());
      const practiceLocation = highlightedPractice.getBounds().getCenter();
      map.map.setView(practiceLocation, 10);
    }
  }
}

function overlayPCNs(mapObj) {
  return {
    label: "Sites by PCN",
    selectAllCheckbox: true,
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
    label: "Hospital Sites <i class='fa-solid fa-circle-h'></i>",
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

async function mapMarkersNationalTrust() {
  // Styling: https://gis.stackexchange.com/a/360454
  const nhsTrustSites = L.conditionalMarkers([]),
    nonNhsTrustSites = L.conditionalMarkers([]);

  let i = 0,
    j = 0; // counter for number of providers in each category
  const data = await promHospitalDetails;

  data.forEach((d) => {
    if (!isNaN(d.latitude)) {
      const category = d.sector;
      const popupText = `<h3>${d.organisationCode}: ${d.organisationName}</h3>
      <p>${d.parentODSCode}: ${d.parentName}
      <br>${d.sector}</p>`;

      if (category === "NHS Sector") {
        const marker = trustMarker(d.markerPosition, "nhs", "H", popupText);
        marker.addTo(nhsTrustSites);
        i++;
      } else {
        // Independent Sector
        const marker = trustMarker(
          d.markerPosition,
          "independent",
          "H",
          popupText
        );
        marker.addTo(nonNhsTrustSites);
        j++;
      }
    }
  });

  // This option controls how many markers can be displayed
  nhsTrustSites.options.maxMarkers = i;
  nonNhsTrustSites.options.maxMarkers = j;

  // Overlay structure for Trust Sites
  const nationalTrusts = overlayNationalTrusts(nhsTrustSites, nonNhsTrustSites);

  // Add overlay to mapMain
  overlaysTreeMain.children[4] = nationalTrusts;

  function trustMarker(position, className, text = "H", popupText) {
    return L.marker(position, {
      icon: L.divIcon({
        className: `trust-marker ${className}`,
        html: text,
        iconSize: L.point(20, 20),
        popupAnchor: [0, -10],
      }),
    }).bindPopup(popupText);
  }

  function overlayNationalTrusts(nhs, independent) {
    return {
      label: "National Hospital Sites <i class='fa-solid fa-circle-h'></i>",
      selectAllCheckbox: true,
      children: [
        {
          label:
            "NHS <i class='fa-solid fa-circle-h' style='font-size:14px;color:blue;'></i>",
          layer: nhs,
        },
        {
          label:
            "Independent <i class='fa-solid fa-circle-h' style='font-size:14px;color:green;'></i>",
          layer: independent,
        },
      ],
    };
  }
}

function refreshMapOverlayControls() {
  // Functions to refresh the map overlay buttons
  refreshMapMainControl();
  refreshMapControlSites();
  refreshMapControlPopn();
  refreshMapControlIMD();
  refreshMapControlBubble();
}

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
