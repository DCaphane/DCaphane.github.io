import {
  promGeoDataLsoaBoundaries,
  promDataGPPopnLsoa,
  promDataIMD,
  mapsWithLSOAFiltered,
  geoLsoaBoundaries,
  styleLsoaOrangeOutline,
  actualPopulation,
  minPopulationLSOA,
  recolourIMDLayer,
  mapStore,
  refreshFilteredGPSitesOverlays,
  refreshMapOverlayControls,
  imdDomainShort,
} from "../aggregateModules.mjs";

// Contains lsoa (key) and it's population for the selected practice (value)
const mapsFilteredLSOA = new Map(); // selected lsoas

async function filterFunctionLsoa(zoomToExtent = false) {
  /*
    Consider moving this into the init function if not splitting by eg. IMD
    */
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promDataGPPopnLsoa,
    promDataIMD,
  ])
    .then((lsoaBoundaries) => {
      mapsFilteredLSOA.clear();

      mapsWithLSOAFiltered.forEach(function (value, key) {
        // Remove the original layer
        if (value !== null && value !== undefined) {
          if (key.hasLayer(value[0])) {
            key.removeLayer(value[0]);
          }
        }

        const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
          style: styleLsoaOrangeOutline,
          pane: "lsoaBoundaryPane2",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa;

            layer.on("click", function (e) {
              // update other charts
              const selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
              console.log({ lsoa: selectedLsoa });
            });
          },
          filter: function (d) {
            // console.log(d.properties.lsoa)
            const lsoaCode = d.properties.lsoa;

            let population = actualPopulation(lsoaCode);

            if (population > minPopulationLSOA) {
              mapsFilteredLSOA.set(lsoaCode, population);
              return true;
            }
          },
        });

        geoDataLsoaBoundaries.addTo(key);

        const ol = {
          label: "LSOA by Population",
          layer: geoDataLsoaBoundaries,
          // selectAllCheckbox: true,
          // children: [{ layer: geoDataLsoaBoundaries }]
        };
        mapsWithLSOAFiltered.set(key, [geoDataLsoaBoundaries, ol]); // filtered lsoa map, popn over eg. 20

        // if (incLayer) {
        // L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);
        // }

        if (zoomToExtent) {
          key.fitBounds(geoDataLsoaBoundaries.getBounds());
        }
      });
    })
    .then(() => {
      // recolourPopnLSOA();
      recolourIMDLayer(imdDomainShort);
    })
    .then(() => {
      /*
        Previously tried running this within the above .then statement but this typically results in
        an error when trying to remove a layer
        */
      const lastMap = mapStore[mapStore.length - 1];
      lastMap.promTesting.then(() => {
        refreshFilteredGPSitesOverlays();
        refreshFilteredLSOAOverlays();
      });
    });
}

async function filterFunctionLsoaByIMD(zoomToExtent = false) {
  /*
    This procedures works but is potentially slow since removing all layers rather than one overarching one
    */
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promDataGPPopnLsoa,
    promDataIMD,
  ])
    .then((lsoaBoundaries) => {
      mapsFilteredLSOA.clear();

      mapsWithLSOAFiltered.forEach(function (value, key) {
        const incLayer = key.hasLayer(value);
        // Remove the original layer
        if (value !== null) {
          if (key.hasLayer(value[0])) {
            key.removeLayer(value[0]);
          } else {
            value[2]();
          }
        }

        const layersMapByIMD = new Map();

        const geoDataLsoaBoundaries = L.geoJSON(lsoaBoundaries[0].value, {
          style: styleLsoaOrangeOutline,
          pane: "lsoaBoundaryPane2",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa;

            let imdDecile;
            if (mapLSOAbyIMD.has(lsoa)) {
              imdDecile = mapLSOAbyIMD.get(lsoa); // IMD Decile
            } else {
              imdDecile = "exc"; // undefined
            }

            // Initialize the category array if not already set.
            if (!layersMapByIMD.has(imdDecile)) {
              layersMapByIMD.set(imdDecile, L.layerGroup());
            }
            layersMapByIMD.get(imdDecile).addLayer(layer);

            layer.on("click", function (e) {
              // update other charts
              const selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
              console.log({ lsoa: selectedLsoa });
            });
          },
          filter: function (d) {
            // console.log(d.properties.lsoa)
            const lsoaCode = d.properties.lsoa;

            let population = actualPopulation(lsoaCode);

            if (population > minPopulationLSOA) {
              mapsFilteredLSOA.set(lsoaCode, population);
              return true;
            }
          },
        });

        L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);

        function removeFeature() {
          layersMapByIMD.forEach(function (value) {
            key.removeLayer(value);
          });
        }

        const ol = overlayLSOA(layersMapByIMD, "LSOA Population");
        mapsWithLSOAFiltered.set(key, [
          geoDataLsoaBoundaries,
          ol,
          removeFeature,
        ]); // filtered lsoa map, popn over eg. 20

        // if (incLayer) {
        // L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);
        // }

        if (zoomToExtent) {
          key.fitBounds(geoDataLsoaBoundaries.getBounds());
        }
      });
    })
    .then(() => {
      // recolourPopnLSOA();
      recolourIMDLayer(imdDomainShort);
      refreshFilteredLSOAOverlays();
    });
}

function refreshFilteredLSOAOverlays() {
  // mapStore is an array of the maps that use the filtered LSOA
  let refreshOverlay = false;
  for (let mapLSOA of mapStore) {
    if (mapsWithLSOAFiltered.has(mapLSOA.map)) {
      const arr = mapsWithLSOAFiltered.get(mapLSOA.map);
      if (arr.length > 1) {
        refreshOverlay = true;
        mapLSOA.updateOverlay("filteredLSOA", arr[1]);
      }
    } else {
      // console.log({lsoaFilteredMap: 'update lsoa map array'})
    }
  }

  // Once the lsoa has been refreshed, update the overlay
  if (refreshOverlay) {
    refreshMapOverlayControls();
  }
}

export { filterFunctionLsoa, mapsFilteredLSOA };
