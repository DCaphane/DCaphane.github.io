const mapSites = {
  map: mapInitialise.mapInit("mapSites"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapSites.scaleBar.addTo(mapSites.map);

const sidebarSites = mapSites.sidebar("sidebar2");

homeButton.call(mapSites);

// Panes to control zIndex of geoJson layers
mapSites.map.createPane("wardBoundaryPane");
mapSites.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapSites.map.createPane("ccgBoundaryPane");
mapSites.map.getPane("ccgBoundaryPane").style.zIndex = 374;

// ccgBoundary.call(mapSites, true);
// addWardGroupsToMap.call(mapSites);

// GP Practice Sites - coded by PCN
pcnSites.call(mapSites);

// Make global to enable subsequent change to overlay
const overlaysTreeSites = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const baseTreeSites = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stadia.AlidadeSmoothDark") // CartoDB.Positron
    .addTo(mapSites.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  return {
    label: "Base Layers <i class='fas fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fas fa-layer-group'></i>;",
        children: [
          { label: "OSM", layer: L.tileLayer.provider("OpenStreetMap.Mapnik") },
          {
            label: "CartoDB",
            layer: L.tileLayer.provider("CartoDB.Voyager"),
          },
          {
            label: "Simple",
            layer: L.tileLayer.provider("Stadia.AlidadeSmooth"),
          },
          {
            label: "Bright",
            layer: L.tileLayer.provider("Stadia.OSMBright"),
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
          { label: "Grey", layer: defaultBasemap },
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
})();

overlaysTreeSites.children[0] = overlayTrusts();

const mapControlSites = L.control.layers.tree(
  baseTreeSites,
  overlaysTreeSites,
  {
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
  }
);

mapControlSites
  .addTo(mapSites.map)
  // .setOverlayTree(overlaysTreeSites)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true); // true to collapse the overlays tree
// .expandSelected(true); // expand selected option in the overlays tree
