import {
  userSelections,
  trendChart,
  demographicChart,
  barChart,
  promGeoDataGP,
  filterFunctionLsoa,
  mapsWithGPSites,
  gpDetails,
  pcnFormatting,
  circlePopnIMDChart,
  updateBouncingMarkers,
  highlightFeature,
  practiceLookup,
  sidebarContent,
  titleCase,
  mapsWithGPMain,
  updatePopUpText,
  mapOfMaps,
  mapMain,
} from "../aggregateModules.mjs";

let firstPass = true;

export function refreshChartsPostPracticeChange(practice) {
  console.log({ selectedPractice: practice });
  // change the selection box dropdown to reflect clicked practice
  document.getElementById("selPractice").value = `${
    userSelections.selectedPractice
  }: ${userSelections.selectedPracticeName()}`;

  filterGPPracticeSites();
  filterFunctionLsoa(true); // zoom to filtered lsoa
  // .then(() => {
  //   recolourPopnLSOA();
  //   recolourIMDLayer(imdDomainShort);
  // });

  trendChart.chartTrendDraw();

  demographicChart.updateChtDemog(
    practice,
    userSelections.selectedPracticeCompare
  );

  circlePopnIMDChart.updateD3BubbleLsoa();

  barChart.fnRedrawBarChart();

  // updateTextPractice();
  // updateTextPCN();
  updateBouncingMarkers();

  highlightFeature(practice, mapMain, false);

  sidebarContent.updateSidebarText("pcnSpecific", practice);
}

export function refreshChartsPostDateChange() {
  for (const value of mapsWithGPMain.values()) {
    updatePopUpText(value[0]);
  }
  demographicChart.updateChtDemog(
    userSelections.selectedPractice,
    userSelections.selectedPracticeCompare
  );
  filterFunctionLsoa(true); // zoom to filtered lsoa

  circlePopnIMDChart.updateD3BubbleLsoa();
  barChart.fnRedrawBarChart();
}

function filterGPPracticeSites(zoomToExtent = false) {
  /* This will deselect the 'entire' GP Sites layer
    and return an additional filtered layer based on the selected practice
    */

  Promise.allSettled([promGeoDataGP, gpDetails]).then((data) => {
    mapsWithGPSites.forEach(function (value, key) {
      // value includes the original unfiltered sites layer, value[0] and the filtered layer if exists, value[1]
      let isLayerDisplayed = false;
      let isFilteredLayerDisplayed = false;
      if (key.hasLayer(value[0])) {
        // the original sites layer
        key.removeLayer(value[0]);
        isLayerDisplayed = true;
      }

      // Does the map already show the filtered sites layer
      if (value.length > 1) {
        if (key.hasLayer(value[1])) {
          key.removeLayer(value[1]);
          isFilteredLayerDisplayed = true;
        }
        // value.pop(); // not necessary as will be overwritten?
        delete value[1]; // keeps the array length but the filtered sites layer (in index 1) becomes undefined
      }

      if (
        userSelections.selectedPractice !== undefined &&
        userSelections.selectedPractice !== "All Practices"
      ) {
        // const layersMapGpSites = new Map(); // will be the filtered layer

        const gpSites = L.geoJson(data[0].value, {
          // https://leafletjs.com/reference-1.7.1.html#geojson
          pointToLayer: function (feature, latlng) {
            return pcnFormatting(feature, latlng);
          },
          onEachFeature: function (feature, layer) {
            const category = feature.properties.pcn_name;

            let orgName = layer.feature.properties.orgName;
            if (orgName === null) {
              if (practiceLookup.has(layer.feature.properties.orgCode)) {
                orgName = titleCase(
                  practiceLookup.get(layer.feature.properties.orgCode)
                );
              } else {
                orgName = "";
              }
            }

            const popupText = `<h3>${category}</h3>
          <p>${layer.feature.properties.orgCode}:
          ${orgName}
          <br>Parent Org:${layer.feature.properties.parent}</p>`;

            layer.bindPopup(popupText, { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css

            layer.on("mouseover", function (e) {
              this.openPopup();
            });
            layer.on("mouseout", function (e) {
              this.closePopup();
            });
            // layer.on("click", function (e) {
            // });
            // Initialize the category array if not already set.
            //   if (!layersMapGpSites.has(category)) {
            //     layersMapGpSites.set(category, L.layerGroup());
            //   }
            //   layersMapGpSites.get(category).addLayer(layer);
          },
          filter: function (d) {
            // match site codes based on 6 char GP practice code
            const strPractice = d.properties.orgCode;

            return strPractice.substring(0, 6) ===
              userSelections.selectedPractice.substring(0, 6)
              ? true
              : false;
          },
        });

        // key is the map we are working with
        if (isFilteredLayerDisplayed || firstPass) {
          gpSites.addTo(key);
          firstPass = false;
        }

        value[1] = gpSites; // append the filtered layer

        // Selected GP Sites Overlay
        const ol = {
          label: "Selected Practice Sites",
          layer: gpSites,
        };
        value[2] = ol; // append the overlay

        mapsWithGPSites.set(key, value);

        if (zoomToExtent) {
          key.fitBounds(gpSites.getBounds().pad(0.1));
        }
      } else {
        // reset to show all sites
        if (isLayerDisplayed) {
          // (isLayerDisplayed || key === mapPopn.map)
          key.addLayer(value[0]);
        }
        key.flyTo(mapOfMaps.get(key), 9);

        // Remove the overlay
        value[2] = null; // null will be used in the filter function to remove the overlay
      }
    });
    // refreshFilteredGPSitesOverlays();
  });
}
