import {
  mapInitialise,
  sidebarContent,
  overlayTrusts,
  overlayAddSeparator,
  genID,
} from "../../aggregateModules.mjs";
export { mapStore, mapMain, mapIMD, mapD3Bubble };

const mapStore = []; // used to store the variable that stores each map. Can be used in subsequent loops...
// GP Main Site Map
const mapMain = mapInitialise({
  mapDivID: "mapMain", // mapMain is the div id to place the map
  baselayer: "Bright", // set the default baselayer. Default is Bright
  userOverlayGPMain: { inc: true, display: true },
  userOverlayCCGBoundary: { display: true },
  userOverlayWardBoundary: { inc: true },
  userOverlayNationalTrusts: true,
});
mapMain.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
// mapMain.home = {lat: 54.018213, lng: -10.0} // can change the home button position
mapMain.homeButton(); // mapMain.homeButton({ latLng: trustSitesLoc.yorkTrust, zoom: 12 });
mapStore.push(mapMain);
const sidebarMapMain = mapMain.sideBar(); // default is left, can use mapMain.sideBar({side: "right"});
sidebarMapMain.addPanel(sidebarContent.panelOverview);
sidebarMapMain.addPanel(sidebarContent.panelSpecific);
sidebarMapMain.addPanel(sidebarContent.panelMail);
sidebarMapMain.addPanel(sidebarContent.panelDummy);
sidebarMapMain.addPanel(sidebarContent.panelSettings);

mapMain.updateOverlay("selectedTrusts", overlayTrusts());

const mapIMD = mapInitialise({
  mapDivID: "mapIMDLSOA",
  baselayer: "Dark", // Jawg Matrix
  userOverlayGPSites: { inc: true, display: true },
  userOverlayLsoaBoundary: { inc: true, display: false },
  userOverlayFilteredLsoa: { inc: true },
  userOverlayNationalTrusts: true,
});
mapIMD.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapIMD.homeButton();
mapStore.push(mapIMD);
const sidebarIMD = mapIMD.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarIMD.addPanel(sidebarContent.panelOverview);
sidebarIMD.addPanel(sidebarContent.panelIMDSpecific);

mapIMD.updateOverlay("selectedTrusts", overlayTrusts());
mapIMD.updateOverlay("separatorLine", overlayAddSeparator());

/*
  Population and IMD by LSOA (D3 Circle Map)
  https://bost.ocks.org/mike/bubble-map/

  https://labs.os.uk/public/os-data-hub-tutorials/web-development/d3-overlay

  Drawing points of interest using this demo:
    https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/

  */

const mapD3Bubble = mapInitialise({
  mapDivID: "mapIMDD3",
  baselayer: "OS Light", // High Contrast
  userOverlayLsoaBoundary: { inc: true },
  userOverlayFilteredLsoa: { inc: true },
  // userOverlayGPMain: { inc: true, display: false },
  userOverlayGPSites: { inc: true, display: false },
  userOverlayNationalTrusts: true,
});
mapD3Bubble.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapD3Bubble.homeButton();
mapStore.push(mapD3Bubble);

mapD3Bubble.updateOverlay("selectedTrusts", overlayTrusts());
mapD3Bubble.updateOverlay("separatorLine", overlayAddSeparator());

// bubbleGroup to run a function in the overlayers tree
const htmlD3Bubble = svgCheckBox("mapIMDD3");

// returns a html string with a checkbox to enable toggling of the d3 svg circle layer
function svgCheckBox(id) {
  const cboxId = genID.uid("cbox").id;

  return `<span class="d3Toggle" onmouseover="this.style.cursor='pointer'" onclick="toggleBubbles('${id}', '${cboxId}')";><input type="checkbox" id="${cboxId}" checked> Toggle Circles</span>`;
}

mapD3Bubble.updateOverlay("functionCall", {
  label: htmlD3Bubble,
});

function toggleBubbles(elemParentID, cboxID) {
  // function to toggle the D3 circle bubbles
  // need this specific element if more than one d3 bubble map
  const bubbleGroup = d3.select(`#${elemParentID} .bubble-group`);
  const checkBox = document.getElementById(cboxID);

  if (bubbleGroup.style("visibility") === "hidden") {
    bubbleGroup.style("visibility", "visible");
    checkBox.checked = true;
  } else {
    bubbleGroup.style("visibility", "hidden");
    checkBox.checked = false;
  }
  /*
    const bubbleGroup = document
      .getElementById(elemParentID) // need this specific element if more than one d3 bubble map
      .getElementsByClassName("bubble-group")[0];

    const checkBox = document.getElementById("d3Check");
    if (bubbleGroup.style.visibility === "hidden") {
      bubbleGroup.style.visibility = "visible";
      checkBox.checked = true;
    } else {
      bubbleGroup.style.visibility = "hidden";
      checkBox.checked = false;
    }
  */
}
/*
toggleBubbles needs to be made a global here to make it accessible from the html (only when using modules)
The toggle is created after the page is loaded so not figured out how else to do this
*/
window.toggleBubbles = toggleBubbles;
