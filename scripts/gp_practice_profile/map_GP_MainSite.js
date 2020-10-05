const osm_bw = basemap.osm_bw();
const CartoDB_Voyager = basemap.CartoDB_Voyager();
const Stamen_Toner = basemap.Stamen_Toner();
const emptyTile = basemap.emptyTile();

const baseMaps = {
  "Black and White": osm_bw,
  Default: CartoDB_Voyager,
  Stamen_Toner: Stamen_Toner,
  "No Background": emptyTile,
};

const mapMain = mapInitialise.mapInit("mapMain", osm_bw); // baseMaps1["Black and White"]

const layerControl = mapInitialise.layerControl(baseMaps);
mapMain.addControl(layerControl);

// Ward boundaries and ward groupings
const subLayerControl = mapInitialise.subLayerControl();
mapMain.addControl(subLayerControl);

const scaleBar = mapInitialise.scaleBar("bottomleft");
scaleBar.addTo(mapMain);

const sidebarPCN = mapInitialise.sidebarLeft(mapMain, "sidebar");

homeButton(mapMain);
yorkTrust(mapMain);

// Panes to control zIndex of geoJson layers
mapMain.createPane("wardBoundaryPane");
mapMain.getPane("wardBoundaryPane").style.zIndex = 375;

mapMain.createPane("ccg03QBoundaryPane");
mapMain.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary

ccgBoundary(mapMain, subLayerControl);
wardData(mapMain, subLayerControl);
addPracticeToMap(mapMain, layerControl);

// const select = document.getElementById("selPractice");
// select.addEventListener("change", function() {
//   highlightFeature(select.value);
// });

function highlightFeature(selPractice) {
  if (typeof highlightPractice !== "undefined") {
    mapMain.removeLayer(highlightPractice);
  }

  highlightPractice = L.geoJSON(geoDataPractice, {
    pointToLayer: function (feature, latlng) {
      if (feature.properties.practice_code === selPractice) {
        return (markerLayer = L.marker(latlng, {
          icon: arrHighlightIcons[5],
          zIndexOffset: -5,
        }));
      }
    },
  });

  mapMain.addLayer(highlightPractice);
}


