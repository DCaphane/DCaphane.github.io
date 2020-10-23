const baseMapPopn = Object.create(Basemaps);

const mapPopn = {
  map: mapInitialise.mapInit("mapPopnLSOA", baseMapPopn["Stamen Toner"]),
  layerControl: mapInitialise.layerControl(baseMapPopn),
  subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapPopn.map.addControl(mapPopn.layerControl);

// Ward boundaries and ward groupings
mapPopn.map.addControl(mapPopn.subLayerControl);

mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);
yorkTrust.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccg03QBoundaryPane");
mapPopn.map.getPane("ccg03QBoundaryPane").style.zIndex = 374;

// ccg boundary
geoDataCCGBoundary.then(function (v) {
  ccgBoundary(v, mapPopn, false);
});

geoDataLsoaBoundaries.then(function (v) {
  lsoaBoundary(v, mapPopn, true);
});

// GP Practice Sites - coded by PCN
geoDataPCNSites.then(function (v) {
  pcnSites.call(mapPopn);
});

Promise.all([
  dataPopulationGP,
  dataPopulationGPLsoa,
  geoDataLsoaBoundaries,
]).then((v) => {
  recolourLSOA();
});

// addPracticeToMap(mapPopn, layerControl2);
// geoDataGPMain.then(function(v){
//   addPracticeToMap(v, mapPopn, layerControl2)
// })

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
    selectedPractice !== undefined && selectedPractice !== "All Practices"
      ? d3.max(data_popnGPLsoa.get(nearestDate).get(selectedPractice).values())
      : d3.max(data_popnGPLsoa.get(nearestDate).get("All").values());

  geoDataLsoaBoundaries
    .then(function (v) {
      filterFunctionLsoa(v, mapPopn, true);
      return;
    })
    .then(function () {
      lsoaLayer.eachLayer(function (layer) {
        const lsoaCode = layer.feature.properties.lsoa;

        let value =
          selectedPractice !== undefined && selectedPractice !== "All Practices"
            ? data_popnGPLsoa
                .get(nearestDate)
                .get(selectedPractice)
                .get(lsoaCode)
            : data_popnGPLsoa.get(nearestDate).get("All").get(lsoaCode);

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
          });
        } else {
          layer.setStyle({
            // no (transparent) background
            fillColor: "#ff0000", // background
            fillOpacity: 0, // transparent
            weight: 0, // border
            color: "red", // border
            opacity: 0,
          });
        }

        layer.bindPopup(
          `<h3>${layer.feature.properties.lsoa}</h3>
          <p>${selectedPractice}</p>
          <p>${formatPeriod(nearestDate)}</p>
      Pop'n: ${formatNumber(value)}
      `
        );
      });
    });
}
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

// mapLsoaData.then(function() {
//   const maplsoaInit = lsoaBoundary(mapPopn, subLayerControl2)
//   maplsoaInit.then(recolourLSOA())
// })
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
