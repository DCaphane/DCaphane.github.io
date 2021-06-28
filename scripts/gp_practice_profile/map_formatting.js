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
    scaleBar: scaleBar,
    sidebarLeft: sidebarLeft,
  };
})();

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

function hospitalSiteColour(sector) {
  switch (sector) {
    case "NHS Sector":
      return "rgba(255, 0, 0)";
    case "Independent Sector":
      return "rgba(0,0,255)";
  }
}

function pcnFormatting(feature, latlng, { addBounce = false } = {}) {
  let markerPCN;

  // Use different marker styles depending on eg. practice groupings
  switch (feature.properties.pcn_name) {
    case "Selby Town":
      markerPCN = arrMarkerIcons[0]; // standard red map marker
      markerPCN.options.text = "ST";
      markerPCN.options.innerIconStyle = "padding-left:7px;padding-bottom:5px;"; // centre text in icon
      // markerPCN.options.icon = "fas fa-bahai" // to use font awesome icon
      break;

    case "Tadcaster & Selby Rural Area":
      markerPCN = arrMarkerIcons[1]; // standard blue map marker
      markerPCN.options.text = "TSRA";
      markerPCN.options.innerIconStyle = "font-size:9px;";
      break;
    case "South Hambleton And Ryedale":
      markerPCN = arrMarkerIcons[2]; // standard green map marker
      markerPCN.options.text = "SHaR";
      markerPCN.options.innerIconStyle = "font-size:9px;";
      break;
    case "York City Centre":
      markerPCN = arrMarkerIcons[3]; // standard purple map marker
      markerPCN.options.text = "YCC";
      markerPCN.options.innerIconStyle =
        "font-size:11px;margin-top:3px;margin-left:-2px;";
      break;
    case "York Medical Group":
      markerPCN = arrMarkerIcons[4]; // standard orange map marker
      markerPCN.options.text = "YMG";
      markerPCN.options.innerIconStyle =
        "font-size:11px;margin-top:3px;margin-left:-2px;";
      break;
    case "Priory Medical Group":
      markerPCN = arrCircleIcons[0]; // red circle
      markerPCN.options.text = "PMG";
      markerPCN.options.innerIconStyle = "margin-top:3px;";
      break;
    case "York East":
      markerPCN = arrCircleIcons[1]; // blue circle
      markerPCN.options.text = "YE";
      markerPCN.options.innerIconStyle = "margin-top:3px; margin-left:0px;";
      break;
    case "West, Outer and North East York":
      markerPCN = arrCircleIcons[3]; // purple
      markerPCN.options.text = "WONEY";
      markerPCN.options.innerIconStyle =
        "margin-top:6px; margin-left:0px;font-size:8px;padding-top:1px;";
      break;
    // case "NIMBUSCARE LTD":
    //   switch (feature.properties.sub_group) {
    //     case "1":
    //       markerPCN = arrCircleIcons[7];
    //       break;
    //     case "2":
    //       markerPCN = arrCircleDotIcons[7];
    //       break;
    //     case "3":
    //       markerPCN = arrRectangleIcons[7];
    //       break;
    //     default:
    //       markerPCN = arrDoughnutIcons[7];
    //       break;
    //   }

    default:
      console.log(`Missing PCN Marker: ${feature.properties.pcn_name}`);
      markerPCN = arrDoughnutIcons[0];
  }

  const finalMarker = L.marker(latlng, {
    icon: markerPCN,
    riseOnHover: true,
  });

  if (addBounce) {
    finalMarker.on("click", function () {
      this.toggleBouncing();
    });
  }
  return finalMarker;
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
