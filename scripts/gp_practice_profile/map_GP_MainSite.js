const mapMain = {
  map: mapInitialise.mapInit("mapMain"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapMain.scaleBar.addTo(mapMain.map);

const sidebarPCN = mapMain.sidebar("sidebar");

homeButton.call(mapMain);

// Panes to control zIndex of geoJson layers
mapMain.map.createPane("wardBoundaryPane");
mapMain.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapMain.map.createPane("ccgBoundaryPane");
mapMain.map.getPane("ccgBoundaryPane").style.zIndex = 374;

// ccgBoundary.call(mapMain, true);
addWardGroupsToMap.call(mapMain);

// update to addPCNToMap2.call(mapMain);
addPracticeToMap.call(mapMain);

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightPractice !== "undefined") {
    map.map.removeLayer(highlightPractice);
  }

  geoDataPCN.then(function (v) {
    // geoDataGPMain
    highlightPractice = L.geoJSON(v, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.practice_code === selPractice) {
          return (markerLayer = L.marker(latlng, {
            icon: arrHighlightIcons[5],
            zIndexOffset: -5,
          }));
        }
      },
    });

    map.map.addLayer(highlightPractice);

    if (zoomToExtent) {
      map.map.fitBounds(highlightPractice.getBounds());
    }
    if (selPractice === "All Practices" || selPractice === undefined) {
      defaultHomeVoY.call(mapMain);
    }
  });
}

// Make global to enable subsequent change to overlay
const overlaysTreeMain = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const baseTreeMain = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stadia.OSMBright") // .Mapnik
    .addTo(mapMain.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

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
  OS_VTS_3857_No_Labels.json
  OS_VTS_3857_Open_Outdoor.json
  OS_VTS_3857_Greyscale.json
  OS_VTS_3857_Dark.json
  OS_VTS_3857_Light.json
  */
  const apiKey = "npRUEEMn3OTN7lx7RPJednU5SOiRSt35",
    serviceUrl = "https://api.os.uk/maps/vector/v1/vts";
  let copyrightStatement =
    "Contains OS data &copy; Crown copyright and database rights YYYY"; // '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
  copyrightStatement = copyrightStatement.replace(
    "YYYY",
    new Date().getFullYear()
  );
  // Load and display vector tile layer on the map.
  const osBaseLayerDefault = L.mapboxGL({
    attribution: copyrightStatement,
    style: `${serviceUrl}/resources/styles?key=${apiKey}`,
    transformRequest: (url) => {
      return {
        url: (url += "&srs=3857"),
      };
    },
  });

  const osBaseLayerLight = L.mapboxGL({
    attribution:
      '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
    style:
      "https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Light.json",
    transformRequest: (url) => {
      if (!/[?&]key=/.test(url)) url += "?key=" + apiKey;
      return {
        url: url + "&srs=3857",
      };
    },
  });

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

  overlaysTreeMain.children[6] = osOverlay;

  /*
  -- To refresh
  mapControlMain
  .setOverlayTree(overlaysTreeMain)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true);
  */

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
          { label: "Bright", layer: defaultBasemap },
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
        label: "Ordance Survey <i class='fas fa-layer-group'></i>",
        children: [
          { label: "Default", layer: osBaseLayerDefault },
          { label: "Light", layer: osBaseLayerLight },
          // { label: "Boundary", layer: osOverlayBoundary },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

overlaysTreeMain.children[1] = overlayTrusts();

const mapControlMain = L.control.layers.tree(baseTreeMain, overlaysTreeMain, {
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

mapControlMain
  .addTo(mapMain.map)
  // .setOverlayTree(overlaysTreeMain)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true); // true to collapse the overlays tree
// .expandSelected(true); // expand selected option in the overlays tree

hospitalDetails.then(function (v) {
  const nationalTrustSites = {
    label: "National Hospital Sites <i class='fas fa-hospital-symbol'></i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "NHS",
        layer: mapHospitalLayers.get("NHS Sector"),
      },
      {
        label: "Independent",
        layer: mapHospitalLayers.get("Independent Sector"),
      },
    ],
  };
  overlaysTreeMain.children[5] = nationalTrustSites;
});
