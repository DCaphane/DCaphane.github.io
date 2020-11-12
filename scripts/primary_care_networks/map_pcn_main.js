const mapPCNMain = {
  map: mapInitialise.mapInit("mapPCNMain"),
  // layerControl: mapInitialise.layerControl(baseMapPCNMain),
  // subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapPCNMain.scaleBar.addTo(mapPCNMain.map);

const sidebarPCN = mapPCNMain.sidebar("sidebarPCNMain");

homeButton.call(mapPCNMain);

// Panes to control zIndex of geoJson layers
mapPCNMain.map.createPane("wardBoundaryPane");
mapPCNMain.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapPCNMain.map.createPane("ccgBoundaryPane");
mapPCNMain.map.getPane("ccgBoundaryPane").style.zIndex = 374;

ccgBoundary.call(mapPCNMain, true);
addWardGroupsToMap.call(mapPCNMain);

addPCNToMap2.call(mapPCNMain);

let updateTextPractice = function () {
  const elem = document.getElementById("selectedMarker");
  elem.innerHTML = selectedPractice + " - " + practiceName;
};

let updateTextPCN = function () {
  const elem = document.getElementById("selectedPCN");
  elem.innerHTML = selectedPCN + " sites";
};

Promise.all([geoDataPCN, geoDataCCGBoundary, geoDataCYCWards]).then(
  (values) => {
    const defaultBasemap = L.tileLayer
      .provider("OpenStreetMap.Mapnik")
      .addTo(mapPCNMain.map);

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
                  layer: layersMapGpPcn.get("South Hambleton And Ryedale"),
                },
              ],
            },
            {
              label: "Central",
              selectAllCheckbox: true,
              children: [
                {
                  label: "York City Centre PCN",
                  layer: layersMapGpPcn.get("York City Centre PCN"),
                },
                {
                  label: "York Medical Group",
                  layer: layersMapGpPcn.get("York Medical Group"),
                },
                {
                  label: "NIMBUSCARE LTD",
                  layer: layersMapGpPcn.get("NIMBUSCARE LTD"),
                },
              ],
            },
            {
              label: "South",
              selectAllCheckbox: true,
              children: [
                {
                  label: "Selby Town PCN",
                  layer: layersMapGpPcn.get("Selby Town PCN"),
                },
                {
                  label: "Tadcaster & Selby PCN",
                  layer: layersMapGpPcn.get("Tadcaster & Selby PCN"),
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
    // .addTo(mapPCNMain.map);

    mapControl
      .addTo(mapPCNMain.map)
      // .setOverlayTree(overlaysTree)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true); // true to collapse the overlays tree
    // .expandSelected(true); // expand selected option in the overlays tree
  }
);
