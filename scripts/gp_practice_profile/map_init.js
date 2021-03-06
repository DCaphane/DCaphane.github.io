// Set up the maps

// GP Main Site Map
const mapMain = mapInitialise("mapMain"); // mapMain is the div id to place the map
mapMain.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
// mapMain.home = {lat: 54.018213, lng: -10.0} // can change the home button position
mapMain.homeButton(); // mapMain.homeButton({ latLng: trustSitesLoc.yorkTrust, zoom: 12 });

const sidebarMapMain = mapMain.sideBar(); // default is left, can use mapMain.sideBar({side: "right"});
sidebarMapMain.addPanel(sidebarContent.panelOverview);
sidebarMapMain.addPanel(sidebarContent.panelSpecific);
sidebarMapMain.addPanel(sidebarContent.panelMail);
sidebarMapMain.addPanel(sidebarContent.panelDummy);
sidebarMapMain.addPanel(sidebarContent.panelSettings);

const baseTreeMain = mapMain.baselayers("Bright"); // set the default baselayer. Default is Bright
const overlaysTreeMain = mapMain.overlays; // global to enable updates
const mapControlMain = mapMain.layerControl(baseTreeMain, overlaysTreeMain);

overlaysTreeMain.children[1] = overlayTrusts();

// GP Associated Sites Map
const mapSites = mapInitialise("mapSites");
mapSites.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapSites.homeButton();

const sidebarSites = mapSites.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarSites.addPanel(sidebarContent.panelOverview);

const baseTreeSites = mapSites.baselayers("Dark"); // set the default baselayer. Default is Bright
const overlaysTreeSites = mapSites.overlays; // global to enable updates
const mapControlSites = mapSites.layerControl(baseTreeSites, overlaysTreeSites);

overlaysTreeSites.children[0] = overlayTrusts();

// Population Map by lsoa
const mapPopn = mapInitialise("mapPopnLSOA");
mapPopn.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapPopn.homeButton();

const sidebarPopn = mapPopn.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarPopn.addPanel(sidebarContent.panelOverview);

const baseTreePopn = mapPopn.baselayers("OS Light"); // set the default baselayer. Default is Bright
const overlaysTreePopn = mapPopn.overlays; // Make global to enable subsequent change to overlay
const mapControlPopn = mapPopn.layerControl(baseTreePopn, overlaysTreePopn);

overlaysTreePopn.children[0] = overlayTrusts(); // Add selected hospitals to overlay

const popnLegend = legendWrapper("footerMapPopn", genID.uid("popn"));

/*
IMD Map by LSOA

  The data only imports lsoas in VoY CCG boundary
  The extent of the national data is 1 (most deprived area) to 32,844 (least deprived area)
  Since this is only a subset, the values will not always extend from 1 to 32,844

  For the imd charts, the domain should be 1 to 32,844 (hard coded) - this keeps it consistent, esp. if extend the data
  For the population charts, the domain represents the extent

Useful IMD FAQ: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/853811/IoD2019_FAQ_v4.pdf
*/

const mapIMD = mapInitialise("mapIMDLSOA");
mapIMD.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapIMD.homeButton();

const sidebarIMD = mapIMD.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarIMD.addPanel(sidebarContent.panelOverview);
sidebarIMD.addPanel(sidebarContent.panelIMDSpecific);

const baseTreeIMD = mapIMD.baselayers("Grey"); // set the default baselayer. Default is Bright
const overlaysTreeIMD = mapIMD.overlays; // global to enable updates
const mapControlIMD = mapIMD.layerControl(baseTreeIMD, overlaysTreeIMD);

const imdLegend = legendWrapper("footerMapIMD", genID.uid("imd"));

overlaysTreeIMD.children[0] = overlayTrusts();

/*
Population and IMD by LSOA (D3 Circle Map)
https://bost.ocks.org/mike/bubble-map/

https://labs.os.uk/public/os-data-hub-tutorials/web-development/d3-overlay

Drawing points of interest using this demo:
  https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/

*/

const mapD3Bubble = mapInitialise("mapIMDD3");
mapD3Bubble.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapD3Bubble.homeButton();

const baseTreeD3Bubble = mapD3Bubble.baselayers("Grey"); // set the default baselayer. Default is Bright
const overlaysTreeBubble = mapD3Bubble.overlays; // global to enable updates
const mapControlBubble = mapD3Bubble.layerControl(
  baseTreeD3Bubble,
  overlaysTreeBubble
);
const lsoaCentroidLegend = legendWrapper("footerMapD3Leaf", genID.uid("lsoa"));

overlaysTreeBubble.children[3] = overlayTrusts();

// const sidebarD3 = mapD3Bubble.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});


// Functions to create the charts runs last - after all the data is available
Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa]).then(() => {
  initD3Charts();

  Promise.allSettled([importGeoData]).then(() => {
    // The following require the above population data and the geoData
    initGeoCharts();
    circlePopnIMDChart = imdDomainD3();
    refreshGeoChart();

    Promise.allSettled([promHospitalDetails, promGeoDataCYCWards]).then(() => {
      // refreshes the overlaysTree to ensure everything is included and collapsed
      refreshMapOverlayControls();
    });
  });
});

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
