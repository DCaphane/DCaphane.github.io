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

const map02 =  mapInitialise.mapInit("mapid_02", Stamen_Toner);

const layerControl = mapInitialise.layerControl(baseMaps);
map02.addControl(layerControl);

// Ward boundaries and ward groupings
const subLayerControl = mapInitialise.subLayerControl();
map02.addControl(subLayerControl);

const scaleBar = mapInitialise.scaleBar("bottomleft");
scaleBar.addTo(map02);

const sidebarPCN = mapInitialise.sidebarLeft(map02, "sidebar");

homeButton(map02);
yorkTrust(map02);

// Panes to control zIndex of geoJson layers
map02.createPane("wardBoundaryPane");
map02.getPane("wardBoundaryPane").style.zIndex = 375;

map02.createPane("ccg03QBoundaryPane");
map02.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary

ccgBoundary(map02, subLayerControl);
wardData(map02, subLayerControl);
addPCNToMap(map02, layerControl);

let updateTextPractice = function() {
  const elem = document.getElementById("selectedMarker");
  elem.innerHTML = selectedPractice + " - " + practiceName;
};

let updateTextPCN = function() {
  const elem = document.getElementById("selectedPCN");
  elem.innerHTML = selectedPCN + " sites";
};
