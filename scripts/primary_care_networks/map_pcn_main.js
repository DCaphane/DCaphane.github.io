const baseMapPCNMain = Object.create(Basemaps);

const mapPCNMain = {
  map: mapInitialise.mapInit("mapPCNMain", baseMapPCNMain.Default),
  layerControlTree: mapInitialise.layerControlTree(),
  layerControl: mapInitialise.layerControl(baseMapPCNMain),
  subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

// mapPCNMain.map.addControl(mapPCNMain.layerControl);

// Ward boundaries and ward groupings
mapPCNMain.map.addControl(mapPCNMain.subLayerControl);

mapPCNMain.scaleBar.addTo(mapPCNMain.map);

const sidebarPCN = mapPCNMain.sidebar("sidebarPCNMain");

homeButton.call(mapPCNMain);
yorkTrust.call(mapPCNMain);

// Panes to control zIndex of geoJson layers
mapPCNMain.map.createPane("wardBoundaryPane");
mapPCNMain.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapPCNMain.map.createPane("ccg03QBoundaryPane");
mapPCNMain.map.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
geoDataCCGBoundary.then(function (v) {
  ccgBoundary(v, mapPCNMain, true);
});

geoDataCYCWards.then(function (v) {
  addWardData(v, mapPCNMain);
});

// change to .call
addPCNToMap2(mapPCNMain.map, mapPCNMain.layerControl);

let updateTextPractice = function () {
  const elem = document.getElementById("selectedMarker");
  elem.innerHTML = selectedPractice + " - " + practiceName;
};

let updateTextPCN = function () {
  const elem = document.getElementById("selectedPCN");
  elem.innerHTML = selectedPCN + " sites";
};

Promise.all([geoDataPCN]).then((values) => {
  var overlaysTree = {
    label: "Primary Care Networks",
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
                layer: categoriesPCN.get("South Hambleton And Ryedale"),
              },
            ],
          },
          {
            label: "Central",
            selectAllCheckbox: true,
            children: [
              {
                label: "York City Centre PCN",
                layer: categoriesPCN.get("York City Centre PCN"),
              },
              {
                label: "York Medical Group",
                layer: categoriesPCN.get("York Medical Group"),
              },
              {
                label: "NIMBUSCARE LTD",
                layer: categoriesPCN.get("NIMBUSCARE LTD"),
              },
            ],
          },
          {
            label: "South",
            selectAllCheckbox: true,
            children: [
              {
                label: "Selby Town PCN",
                layer: categoriesPCN.get("Selby Town PCN"),
              },
              {
                label: "Tadcaster & Selby PCN",
                layer: categoriesPCN.get("Tadcaster & Selby PCN"),
              },
            ],
          },
        ],
      },
    ],
  };

/*
  label: "Hospital Sites",
  selectAllCheckbox: true,
  children: [
    { label: "York", layer: L.marker(usefulSites.yorkTrust) },
    { label: "Harrogate", layer: L.marker(usefulSites.harrogateTrust) },
    { label: "Scarborough", layer: L.marker(usefulSites.scarboroughTrust) },
  ]
*/

  // const layerOptions = {
  //   collapsed: true,
  //   sortLayers: true,
  // }
  // L.control.layers.tree(baseTree, overlaysTree, layerOptions).addTo(mapPCNMain.map);
  mapPCNMain.layerControlTree.addTo(mapPCNMain.map);
  mapPCNMain.layerControlTree
    .setOverlayTree(overlaysTree)
    .collapseTree(true)
    .expandSelected(true);
});
