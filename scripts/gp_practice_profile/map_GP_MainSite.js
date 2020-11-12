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

ccgBoundary.call(mapMain, true);
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
  });
}

Promise.all([geoDataPCN, geoDataCCGBoundary, geoDataCYCWards]).then(
  (values) => {
    const defaultBasemap = L.tileLayer
      .provider("OpenStreetMap.Mapnik")
      .addTo(mapMain.map);

    // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
    const emptyBackground = (function emptyTile() {
      return L.tileLayer("", {
        zoom: 0,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
    })();

    const baseTree = {
      label: "Base Layers <i class='fas fa-globe'></i>",
      children: [
        {
          label: "Colour <i class='fas fa-layer-group'></i>;",
          children: [
            { label: "OSM", layer: defaultBasemap },
            {
              label: "CartoDB",
              layer: L.tileLayer.provider("CartoDB.Voyager"),
            },
            {
              label: "Water Colour",
              layer: L.tileLayer.provider("Stamen.Watercolor"),
            },
          ],
        },
        {
          label: "Black & White <i class='fas fa-layer-group'></i>",
          children: [
            { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron") },
            { label: "B&W", layer: L.tileLayer.provider("Stamen.Toner") },
            {
              label: "ST Hybrid",
              layer: L.tileLayer.provider("Stamen.TonerHybrid"),
            },
          ],
        },
        { label: "None", layer: emptyBackground },
      ],
    };

    const overlaysTree = {
      label: "Overlays",
      selectAllCheckbox: true,
      children: [],
    };

    const overlayPCNs = {
      label: "Primary Care Networks",
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
                  layer: layersMapGpMain.get("South Hambleton And Ryedale"),
                },
              ],
            },
            {
              label: "Central",
              selectAllCheckbox: true,
              children: [
                {
                  label: "York City Centre PCN",
                  layer: layersMapGpMain.get("York City Centre PCN"),
                },
                {
                  label: "York Medical Group",
                  layer: layersMapGpMain.get("York Medical Group"),
                },
                {
                  label: "NIMBUSCARE LTD",
                  layer: layersMapGpMain.get("NIMBUSCARE LTD"),
                },
              ],
            },
            {
              label: "South",
              selectAllCheckbox: true,
              children: [
                {
                  label: "Selby Town PCN",
                  layer: layersMapGpMain.get("Selby Town PCN"),
                },
                {
                  label: "Tadcaster & Selby PCN",
                  layer: layersMapGpMain.get("Tadcaster & Selby PCN"),
                },
              ],
            },
          ],
        },
      ],
    };

    const overlayTrusts = {
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
          layer: trustMarker(
            trustSitesLoc.scarboroughTrust,
            "Scarborough Trust"
          ),
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

    const overlayCCGs = {
      label: "CCG Boundaries",
      selectAllCheckbox: true,
      children: [
        {
          label: "Vale of York",
          layer: layersMapBoundaries.get("voyCCGMain"),
        },
      ],
    };

    const overlayWards = {
      label: "Ward Boundaries",
      selectAllCheckbox: true,
      children: [
        {
          label: "CYC",
          selectAllCheckbox: true,
          children: [
            {
              label: "Ward Group: 1",
              layer: layersMapWards.get(1),
            },
            {
              label: "Ward Group: 2",
              layer: layersMapWards.get(2),
            },
            {
              label: "Ward Group: 3",
              layer: layersMapWards.get(3),
            },
            {
              label: "Ward Group: 4",
              layer: layersMapWards.get(4),
            },
            {
              label: "Ward Group: 5",
              layer: layersMapWards.get(5),
            },
            {
              label: "Ward Group: 6",
              layer: layersMapWards.get(6),
            },
          ],
        },
      ],
    };

    overlaysTree.children[0] = overlayPCNs;
    overlaysTree.children[1] = overlayTrusts;
    overlaysTree.children[2] = overlayCCGs;
    overlaysTree.children[3] = overlayWards;

    const mapControl = L.control.layers.tree(baseTree, overlaysTree, {
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

    mapControl
      .addTo(mapMain.map)
      // .setOverlayTree(overlaysTree)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true); // true to collapse the overlays tree
    // .expandSelected(true); // expand selected option in the overlays tree
  }
);
