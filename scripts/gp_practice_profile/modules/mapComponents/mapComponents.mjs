/*
Reusable map components:
	https://stackoverflow.com/questions/53594814/leaflet-multiple-maps-on-same-page
*/

// Controls
// Background and Sites layers

/* Add a sidebar
https://github.com/nickpeihl/leaflet-sidebar-v2
*/

/*
Can use like the following:
updatePopUpText(mapsWithGPMain.get(mapMain.map)[0])
*/

import {
  userSelections,
  mapStore,
  mapsWithGPMain,
  promGeoDataGP,
  dataPopulationGPSummary,
  practiceLookup,
  titleCase,
  formatPeriod,
  formatNumber,
} from "../../aggregateModules.mjs";

export {
  updatePopUpText,
  refreshMapOverlayControls,
  defaultHome,
  selectedTrustMarker,
  moveableMarker,
  yorkTrust,
  updateBouncingMarkers,
  styleLsoaOrangeOutline,
  highlightFeature,
  overlayPCNs,
  overlayTrusts,
  overlayWards,
  overlayLSOAbyCCG,
  overlayLSOAbyIMD,
  overlayAddSeparator,
  trustSitesLoc,
};
let highlightedPractice;
// Example using a handful of selected Trust locations
const trustSitesLoc = {
  yorkTrust: [53.96895, -1.08427],
  scarboroughTrust: [54.28216, -0.43619],
  harrogateTrust: [53.99381, -1.51756],
  leedsTrust: [53.80687, -1.52034],
  southTeesTrust: [54.55176, -1.21479],
  hullTrust: [53.74411, -0.035813],
  selbyMIU: [53.77748, -1.07832],
};

// Popup text for the gp markers. This updates with the change in date to give the relevant population figure
function updatePopUpText(sourceLayer) {
  sourceLayer.eachLayer(function (layer) {
    const period = userSelections.selectedDate,
      practiceCode = layer.feature.properties.orgCode,
      // clinicalDirector = layer.feature.properties.clinical_director,
      pcnName = layer.feature.properties.pcn_name,
      population = dataPopulationGPSummary.get(period).get(practiceCode);

    let practiceName;
    if (practiceLookup.has(practiceCode)) {
      practiceName = titleCase(practiceLookup.get(practiceCode));
    } else {
      practiceName = "";
    }

    const popupText = `<h3>${pcnName}</h3>
        <p>${practiceCode}: ${practiceName}
        <br>Population (${formatPeriod(period)}): ${formatNumber(
      population
    )}</p>`;
    // <br>Clinical Director: ${clinicalDirector}

    layer.setPopupContent(popupText);
  });
}

function refreshMapOverlayControls() {
  /*
    to refresh the map overlay buttons
    this needs to be done anytime something is changed that affects the overlay
    Uses the last map (arbitrary) to ensure all the data has been loaded
    */
  const lastMap = mapStore[mapStore.length - 1];
  lastMap.promTesting.then(() => {
    for (const thisMap of mapStore) {
      thisMap.refreshOverlayControl();
    }
  });
}

// consider incorporating this into mapinit
// options around fitBounds, setView
function defaultHome({ zoomInt = 9 } = {}) {
  mapOfMaps.forEach(function (value, key) {
    key.flyTo(value, (zoom = zoomInt));
  });
  // const map = this.map;
  // map.fitBounds(layersMapBoundaries.get("voyCCGMain").getBounds());
}

function selectedTrustMarker(location, text) {
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

// Dummy moveable (draggable) marker for demo only
function moveableMarker() {
  return L.marker(trustSitesLoc.yorkTrust, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "atom",
      borderColor: "Black", // "rgba(242,247,53)",
      backgroundColor: "transparent",
      textColor: "Black", // "rgba(242,247,53)", // Text color of marker icon
      popupAnchor: [0, -5], // adjusts offset position of popup
    }),
    zIndexOffset: 1001,
    draggable: true,
  }).bindPopup("Drag to move me"); // Text to display in pop up
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
  // mapsWithGPMain.forEach(function (value, key) {
  for (const value of mapsWithGPMain.values()) {
    const arr = Array.from(value[1].values());
    arr.forEach(function (test) {
      let obj = test._layers;
      Object.values(obj).forEach(function (val) {
        const gpPractice = val.feature.properties.orgCode;
        const marker = val._bouncingMotion.marker;
        if (gpPractice === userSelections.selectedPractice) {
          marker.bounce(); // starts/stops bouncing of the marker
        }
      });
    });
  }
}

function styleLsoaOrangeOutline() {
  return {
    fillColor: "#FFA400", // background
    fillOpacity: 0, // transparent
    weight: 0.9, // border
    color: "#FFA400", // border
    opacity: 1,
    // dashArray: "3",
  };
}

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightedPractice !== "undefined") {
    map.map.removeLayer(highlightedPractice);
  }

  Promise.allSettled([promGeoDataGP]).then((data) => {
    highlightedPractice = L.geoJSON(data[0].value, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.orgCode === selPractice) {
          return L.marker(latlng, {
            icon: arrHighlightIcons[5],
            zIndexOffset: -5,
          });
        }
      },
    });

    if (selPractice === "All Practices" || selPractice === undefined) {
      defaultHome();
    } else {
      map.map.addLayer(highlightedPractice);

      if (zoomToExtent) {
        // map.map.fitBounds(highlightedPractice.getBounds());
        const practiceLocation = highlightedPractice.getBounds().getCenter();
        map.map.setView(practiceLocation, 10);
      }
    }
  });
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
    label: "Local Hospital Sites <i class='fa-solid fa-circle-h'></i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "York",
        layer: selectedTrustMarker(trustSitesLoc.yorkTrust, "York Trust"),
      },
      {
        label: "Harrogate",
        layer: selectedTrustMarker(
          trustSitesLoc.harrogateTrust,
          "Harrogate Trust"
        ),
      },
      {
        label: "Scarborough",
        layer: selectedTrustMarker(
          trustSitesLoc.scarboroughTrust,
          "Scarborough Trust"
        ),
      },
      {
        label: "Leeds",
        layer: selectedTrustMarker(trustSitesLoc.leedsTrust, "Leeds Trust"),
      },
      {
        label: "South Tees",
        layer: selectedTrustMarker(
          trustSitesLoc.southTeesTrust,
          "South Tees Trust"
        ),
      },
      {
        label: "Hull",
        layer: selectedTrustMarker(trustSitesLoc.hullTrust, "Hull Trust"),
      },
      {
        label: "Selby MIU",
        layer: selectedTrustMarker(trustSitesLoc.selbyMIU, "Selby MIU"),
      },
      {
        label: "Move Me",
        layer: moveableMarker(),
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

function overlayLSOAbyCCG(data) {
  return {
    label: "LSOA by CCG",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: data,
      },
    ],
  };
}

function overlayLSOAbyIMD(mapObj, labelDesc) {
  return {
    label: labelDesc,
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
      {
        label: "Exc",
        layer: mapObj.get("exc"),
      },
    ],
  };
}

function overlayAddSeparator() {
  // Adds a horizontal line
  return {
    label: '<div class="leaflet-control-layers-separator"></div>',
  };
}
