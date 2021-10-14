// import {
//   promHospitalDetails,
// } from "./aggregateModules.mjs";

// async function mapMarkersNationalTrust() {
//   // Styling: https://gis.stackexchange.com/a/360454
//   const nhsTrustSites = L.conditionalMarkers([]),
//     nonNhsTrustSites = L.conditionalMarkers([]);

//   let i = 0,
//     j = 0; // counter for number of providers in each category
//   const data = await promHospitalDetails;

//   data.forEach((d) => {
//     const category = d.sector;
//     const popupText = `<h3>${d.organisationCode}: ${d.organisationName}</h3>
//       <p>${d.parentODSCode}: ${d.parentName}
//       <br>${d.sector}</p>`;

//     if (category === "NHS Sector") {
//       const marker = trustMarker(d.markerPosition, "nhs", "H", popupText);
//       marker.addTo(nhsTrustSites);
//       i++;
//     } else {
//       // Independent Sector
//       const marker = trustMarker(
//         d.markerPosition,
//         "independent",
//         "H",
//         popupText
//       );
//       marker.addTo(nonNhsTrustSites);
//       j++;
//     }
//   });

//   // This option controls how many markers can be displayed
//   nhsTrustSites.options.maxMarkers = i;
//   nonNhsTrustSites.options.maxMarkers = j;

//   // Overlay structure for Trust Sites
//   const nationalTrusts = overlayNationalTrusts(nhsTrustSites, nonNhsTrustSites);

//   // Add overlay to mapMain
//   overlaysTreeMain.children[4] = nationalTrusts;

//   function trustMarker(position, className, text = "H", popupText) {
//     return L.marker(position, {
//       icon: L.divIcon({
//         className: `trust-marker ${className}`,
//         html: text,
//         iconSize: L.point(20, 20),
//         popupAnchor: [0, -10],
//       }),
//     }).bindPopup(popupText);
//   }

//   function overlayNationalTrusts(nhs, independent) {
//     return {
//       label: "National Hospital Sites <i class='fa-solid fa-circle-h'></i>",
//       selectAllCheckbox: true,
//       children: [
//         {
//           label:
//             "NHS <i class='fa-solid fa-circle-h' style='font-size:14px;color:blue;'></i>",
//           layer: nhs,
//         },
//         {
//           label:
//             "Independent <i class='fa-solid fa-circle-h' style='font-size:14px;color:green;'></i>",
//           layer: independent,
//         },
//       ],
//     };
//   }
// }



// function recolourPopnLSOA() {
//   /*
//     For updating the LSOA colours in mapPopulation
//     */
//   const maxValue = maxPopulation();

//   // refreshMapPopnLegend(maxValue);
//   popnLegend.legend({
//     color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
//     title: "Population",
//     width: 600,
//     marginLeft: 50,
//   });

//   mapsWithLSOAFiltered.get(mapPopn.map)[0].eachLayer(function (layer) {
//     const lsoaCode = layer.feature.properties.lsoa;

//     let value = actualPopulation(lsoaCode);

//     if (value === undefined) {
//       value = 0;
//     }

//     if (value > minPopulationLSOA) {
//       layer.setStyle({
//         // https://github.com/d3/d3-scale-chromatic
//         fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
//         fillOpacity: 0.8,
//         weight: 1, // border
//         color: "white", // border
//         opacity: 1,
//         // dashArray: "3",
//       });
//       // layer.on("click", function (e) {
//       //   // update other charts
//       //   console.log({ lsoa: selectedLsoa });
//       // });
//     } else {
//       layer.setStyle({
//         // no (transparent) background
//         fillColor: "#ff0000", // background
//         fillOpacity: 0, // transparent
//         weight: 0, // border
//         color: "red", // border
//         opacity: 0,
//       });
//     }

//     layer.bindPopup(
//       `<h3>${layer.feature.properties.lsoa}</h3>
//             <p>${userSelections.selectedPractice}</p>
//             <p>${formatPeriod(userSelections.nearestDate())}</p>
//         Pop'n: ${formatNumber(value)}
//         `
//     );
//   });
// }

// ###########################################################################################

// ############################### map_init.js #######################################

// Set up the maps




/*
// Population Map by lsoa
const mapPopn = mapInitialise({
  mapDivID: "mapPopnLSOA",
  baselayer: "Dark",
  userOverlayGPSites: { inc: true, display: true },
  userOverlayLsoaBoundary: { inc: true, display: false },
  userOverlayFilteredLsoa: { inc: true },
});
mapPopn.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapPopn.homeButton();
mapStore.push(mapPopn);
const sidebarPopn = mapPopn.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarPopn.addPanel(sidebarContent.panelOverview);

mapPopn.updateOverlay("selectedTrusts", overlayTrusts());

const popnLegend = legendWrapper("footerMapPopn", genID.uid("popn"));
*/

/*
IMD Map by LSOA

  The data only imports lsoas in VoY CCG boundary
  The extent of the national data is 1 (most deprived area) to 32,844 (least deprived area)
  Since this is only a subset, the values will not always extend from 1 to 32,844

  For the imd charts, the domain should be 1 to 32,844 (hard coded) - this keeps it consistent, esp. if extend the data
  For the population charts, the domain represents the extent

Useful IMD FAQ: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/853811/IoD2019_FAQ_v4.pdf
*/



// const sidebarD3 = mapD3Bubble.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});


// GP Associated Sites Map
/*
const mapSites = mapInitialise({
  mapDivID: "mapSites",
  // baselayer: "Grey",
  userOverlayGPSites: { inc: true, display: true },
  userOverlayCCGBoundary: { display: true },
});
mapSites.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapSites.homeButton();
mapStore.push(mapSites)
const sidebarSites = mapSites.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarSites.addPanel(sidebarContent.panelOverview);

mapSites.updateOverlay("selectedTrusts", overlayTrusts());
*/

/*
OS Features API
https://labs.os.uk/public/os-data-hub-examples/os-features-api/wfs-example-bbox

The below is a working example of using the OS Features API to add a hospital and hospice 'shapes' layer
The overlay only adds what is visible in the bounding box (refreshes if map moves)

The initial call to getFeatures(bounds) should be moved to the init set up function

Comment out as a bit excessive for this example

*/

// const wfsServiceUrl = "https://api.os.uk/features/v1/wfs",
//   tileServiceUrl = "https://api.os.uk/maps/raster/v1/zxy";

// // Add layer group to make it easier to add or remove layers from the map.
// const osShapeHospital = new L.layerGroup(), //.addTo(mapMain.map);
//   osShapeHospice = new L.layerGroup();

// // Get the visible map bounds (BBOX).
// let bounds = mapMain.map.getBounds();

// getFeatures(bounds); // move this to end, after promises and in intial set up

// const overlayOSShapes = {
//   label: "OS Feature Demo <i class='fa-solid fa-square-h'></i>",
//   selectAllCheckbox: true,
//   children: [
//     {
//       label: "Hospital",
//       layer: osShapeHospital,
//     },
//     {
//       label: "Hospice",
//       layer: osShapeHospice,
//     },
//   ],
// };
// overlaysTreeMain.children[6] = overlayOSShapes;

// // Add event which will be triggered when the map has finished moving (pan + zoom).
// // Implements a simple strategy to only request data when the map viewport invalidates
// // certain bounds.
// mapMain.map.on("moveend", function () {
//   let bounds1 = new L.latLngBounds(
//       bounds.getSouthWest(),
//       bounds.getNorthEast()
//     ),
//     bounds2 = mapMain.map.getBounds();

//   if (JSON.stringify(bounds) !== JSON.stringify(bounds1.extend(bounds2))) {
//     bounds = bounds2;
//     getFeatures(bounds);
//   }
// });

// // Get features from the WFS.

// async function getFeatures(bounds) {
//   // Convert the bounds to a formatted string.
//   const sw = `${bounds.getSouthWest().lat},${bounds.getSouthWest().lng}`,
//     ne = `${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`;

//   const coords = `${sw} ${ne}`;

//   /*
//   Create an OGC XML filter parameter value which will select the
//   features (site function) intersecting the BBOX coordinates.

//   Useful Features:
//   Hospital
//   Hospice
//   Medical Care Accommodation (dataset not great but includes nursing homes, not in York though?)

//     // to explore all, remove filter
//    const xml = `<ogc:Filter>
//   <ogc:BBOX>
//   <ogc:PropertyName>SHAPE</ogc:PropertyName>
//   <gml:Box srsName="urn:ogc:def:crs:EPSG::4326">
//   <gml:coordinates>${coords}</gml:coordinates>
//   </gml:Box>
//   </ogc:BBOX>
//   </ogc:Filter>`;
//   */

//   const xmlHospital = `<ogc:Filter>
//   <ogc:And>
//   <ogc:BBOX>
//   <ogc:PropertyName>SHAPE</ogc:PropertyName>
//   <gml:Box srsName="urn:ogc:def:crs:EPSG::4326">
//   <gml:coordinates>'${coords}'</gml:coordinates>
//   </gml:Box>
//   </ogc:BBOX>
//   <ogc:PropertyIsEqualTo>
//   <ogc:PropertyName>SiteFunction</ogc:PropertyName>
//   <ogc:Literal>Hospital</ogc:Literal>
//   </ogc:PropertyIsEqualTo>
//   </ogc:And>
//   </ogc:Filter>`;

//   const xmlHospice = `<ogc:Filter>
//   <ogc:And>
//   <ogc:BBOX>
//   <ogc:PropertyName>SHAPE</ogc:PropertyName>
//   <gml:Box srsName="urn:ogc:def:crs:EPSG::4326">
//   <gml:coordinates>'${coords}'</gml:coordinates>
//   </gml:Box>
//   </ogc:BBOX>
//   <ogc:PropertyIsEqualTo>
//   <ogc:PropertyName>SiteFunction</ogc:PropertyName>
//   <ogc:Literal>Hospice</ogc:Literal>
//   </ogc:PropertyIsEqualTo>
//   </ogc:And>
//   </ogc:Filter>`;

//   // Define (WFS) parameters object.
//   const wfsParamsHospital = {
//     key: apiKey,
//     service: "WFS",
//     request: "GetFeature",
//     version: "2.0.0",
//     typeNames: "Sites_FunctionalSite",
//     outputFormat: "GEOJSON",
//     srsName: "urn:ogc:def:crs:EPSG::4326",
//     filter: xmlHospital,
//   };

//   const wfsParamsHospice = {
//     key: apiKey,
//     service: "WFS",
//     request: "GetFeature",
//     version: "2.0.0",
//     typeNames: "Sites_FunctionalSite",
//     outputFormat: "GEOJSON",
//     srsName: "urn:ogc:def:crs:EPSG::4326",
//     filter: xmlHospice,
//   };

//   // Use fetch() method to request GeoJSON data from the OS Features API.
//   // If successful, remove everything from the layer group; then add a new GeoJSON

//   await Promise.allSettled([
//     d3.json(getUrl(wfsParamsHospital)),
//     d3.json(getUrl(wfsParamsHospice)),
//   ]).then((values) => {
//     osShapeHospital.clearLayers();
//     osShapeHospice.clearLayers();

//     const geoJsonHospital = new L.geoJson(values[0].value, {
//       onEachFeature: function (feature, layer) {
//         layer.bindPopup(feature.properties.DistinctiveName1);
//       },
//       style: {
//         color: "#f00",
//         weight: 1,
//         fillOpacity: 0.8,
//       },
//     });

//     osShapeHospital.addLayer(geoJsonHospital);

//     const geoJsonHospice = new L.geoJson(values[1].value, {
//       onEachFeature: function (feature, layer) {
//         layer.bindPopup(feature.properties.DistinctiveName1);
//       },
//       style: {
//         color: "#00f",
//         weight: 1,
//         fillOpacity: 0.8,
//       },
//     });

//     osShapeHospice.addLayer(geoJsonHospice);
//   });
// }

// /*
//  * Return URL with encoded parameters.
//  * @param {object} params - The parameters object to be encoded.
//  */
// function getUrl(params) {
//   const encodedParameters = Object.keys(params)
//     .map((paramName) => paramName + "=" + encodeURI(params[paramName]))
//     .join("&");

//   return wfsServiceUrl + "?" + encodedParameters;
// }

// ###########################################################################################

// ############################### functions.js #######################################

// Function to create Title Case
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
// ############################### functions.js #######################################
