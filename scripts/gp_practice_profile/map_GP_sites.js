const mapSites = mapInitialise("mapSites");
mapSites.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapSites.homeButton();

const sidebarSites = mapSites.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarSites.addPanel(sidebarContent.panelOverview);

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

  // http://leaflet-extras.github.io/leaflet-providers/preview/
  return {
    label: "Base Layers <i class='fa-solid fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fa-solid fa-layer-group'></i>",
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
          { label: "Dark", layer: defaultBasemap },
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
      "<i class='fa-solid fa-square-plus'></i> <i class='fa-solid fa-folder'></i>", // Symbol displayed on a closed node
    openedSymbol:
      "<i class='fa-solid fa-square-minus'></i> <i class='fa-solid fa-folder-open'></i>", // Symbol displayed on an opened node
  }
);

mapControlSites.addTo(mapSites.map);
