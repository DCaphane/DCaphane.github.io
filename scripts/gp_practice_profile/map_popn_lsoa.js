// Open Street Map (osm)
// https://leaflet-extras.github.io/leaflet-providers/preview/

// Tile Baselayers (Backgrounds)

// Mapbox
/*
let tile_MB = L.tileLayer(
	'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
	{
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken:
			'addKeyHere'
	}
);
*/
// const basemap = Basemaps();
const osm_bw2 = basemap.osm_bw();
const CartoDB_Voyager2 = basemap.CartoDB_Voyager();
const Stamen_Toner2 = basemap.Stamen_Toner();
const emptyTile2 = basemap.emptyTile();

const baseMaps2 = {
  "Black and White": osm_bw2,
  Default: CartoDB_Voyager2,
  Stamen_Toner: Stamen_Toner2,
  "No Background": emptyTile2,
};

const mapPopn = mapInitialise.mapInit("mapPopnLSOA", Stamen_Toner2);

const layerControl2 = mapInitialise.layerControl(baseMaps2);
mapPopn.addControl(layerControl2);

// Ward boundaries and ward groupings
const subLayerControl2 = mapInitialise.subLayerControl();
mapPopn.addControl(subLayerControl2);

const scaleBar2 = mapInitialise.scaleBar("bottomleft");
scaleBar2.addTo(mapPopn);

const sidebarPopn = mapInitialise.sidebarLeft(mapPopn, "sidebar3");

homeButton(mapPopn);
yorkTrust(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.createPane("lsoaBoundaryPane");
mapPopn.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.createPane("ccg03QBoundaryPane");
mapPopn.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
ccgBoundary(mapPopn, subLayerControl2);
lsoaBoundary(mapPopn, subLayerControl2);
// addPracticeToMap(mapPopn, layerControl2);

// const select = document.getElementById("selPractice");
// select.addEventListener("change", function() {
//   highlightFeature(select.value);
// });

// function highlightFeature(selPractice) {
//   if (typeof highlightPractice !== "undefined") {
//     mapPopn.removeLayer(highlightPractice);
//   }

//   highlightPractice = L.geoJSON(geoDataPractice, {
//     pointToLayer: function(feature, latlng) {
//       if (feature.properties.practice_code === selPractice) {
//         return (markerLayer = L.marker(latlng, {
//           icon: arrHighlightIcons[5],
//           zIndexOffset: -5
//         }));
//       }
//     }
//   });

//   mapPopn.addLayer(highlightPractice);
// }

/*
GP by LSOA population data published quarterly
Use the below to match the selected dates to the quarterly dates
Function to determine nearest value in array
*/
const nearestValue = (arr, val) =>
  arr.reduce(
    (p, n) => (Math.abs(p) > Math.abs(n - val) ? n - val : p),
    Infinity
  ) + val;

function recolourLSOA() {
  const nearestDate = nearestValue(arrayGPLsoaDates, selectedDate);
  const maxValue =
    (selectedPractice !== undefined && selectedPractice !== "All Practices")
      ? d3.max(data_popnGPLsoa.get(nearestDate).get(selectedPractice).values())
      : d3.max(data_popnGPLsoa.get(nearestDate).get("All").values());

  lsoaLayer.eachLayer(function (layer) {
    propertyValue = layer.feature.properties.lsoa;

    let value =
    (selectedPractice !== undefined && selectedPractice !== "All Practices")
        ? data_popnGPLsoa
            .get(nearestDate)
            .get(selectedPractice)
            .get(propertyValue)
        : data_popnGPLsoa.get(nearestDate).get("All").get(propertyValue);

    if (value === undefined) {
      value = 0;
    }

    if (value > 20) {
      layer.setStyle({
        // https://github.com/d3/d3-scale-chromatic
        fillColor: d3.interpolateYlGnBu(value / maxValue),
        fillOpacity: 0.9,
        weight: 1, // border
        color: "red", // border
        opacity: 1,
        dashArray: "3",
      })
    } else {
      layer.setStyle({
        fillColor: "#ff0000", // background
        fillOpacity: 0, // transparent
        weight: 0, // border
        color: "red", // border
        opacity: 0,
      })
    }

    layer.bindPopup(
      `<h1>${layer.feature.properties.lsoa}</h1>
      Pop'n: ${formatNumber(value)}
      `
    );
  });
}

// function getColorLsoa(d) {
// const nearestDate = nearestValue(arrayGPLsoaDates, selectedDate);
// let maxValue =
//   selectedPractice !== undefined
//     ? d3.max(data_popnGPLsoa.get(nearestDate).get(selectedPractice).values())
//     : d3.max(data_popnGPLsoa.get(nearestDate).get("All").values());

// let value =
//   selectedPractice !== undefined
//     ? data_popnGPLsoa.get(nearestDate).get(selectedPractice).get(d)
//     : data_popnGPLsoa.get(nearestDate).get("All").get(d);

//   return d3.interpolateOrRd(value / maxValue); // dummy test change colour
// }

// Example returns map iterator of values for selected date and practice
// data_popnGPLsoa.get(1593558000000).get("B81036").values()
// d3.max(data_popnGPLsoa.get(1593558000000).get("B81036").values())
