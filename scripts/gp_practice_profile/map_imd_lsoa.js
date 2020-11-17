const mapIMD = {
  map: mapInitialise.mapInit("mapIMDLSOA"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapIMD.scaleBar.addTo(mapIMD.map);

const sidebarIMD = mapIMD.sidebar("sidebar4");

homeButton.call(mapIMD);

// Panes to control zIndex of geoJson layers
mapIMD.map.createPane("lsoaBoundaryPane");
mapIMD.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapIMD.map.createPane("ccgBoundaryPane");
mapIMD.map.getPane("ccgBoundaryPane").style.zIndex = 374;

ccgBoundary.call(mapIMD, true);

lsoaBoundary.call(mapIMD, true);

Promise.all([geoDataCCGBoundary]).then(
  // geoDataPCN
  (values) => {
    const defaultBasemap = L.tileLayer
      .provider("Stamen.TonerHybrid")
      .addTo(mapIMD.map);

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
            {
              label: "OSM",
              layer: L.tileLayer.provider("OpenStreetMap.Mapnik"),
            },
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
            { label: "ST Hybrid", layer: defaultBasemap },
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
          layer: layersMapBoundaries.get("voyCCGIMD"),
        },
      ],
    };

    overlaysTree.children[0] = overlayTrusts;
    overlaysTree.children[1] = overlayCCGs;

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
      .addTo(mapIMD.map)
      // .setOverlayTree(overlaysTree)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true); // true to collapse the overlays tree
    // .expandSelected(true); // expand selected option in the overlays tree
  }
);
