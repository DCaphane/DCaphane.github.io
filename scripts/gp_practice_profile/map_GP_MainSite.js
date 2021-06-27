const mapMain = {
  map: mapInitialise.mapInit("mapMain"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapMain.scaleBar.addTo(mapMain.map);

const sidebarPCN = mapMain.sidebar("sidebar");

homeButton.call(mapMain);

// Panes to control zIndex of geoJson layers
mapMain.map.createPane("wardBoundaryPane");
mapMain.map.getPane("wardBoundaryPane").style.zIndex = zIndexWard;

mapMain.map.createPane("ccgBoundaryPane");
mapMain.map.getPane("ccgBoundaryPane").style.zIndex = zIndexCCG;

const apiKey = "npRUEEMn3OTN7lx7RPJednU5SOiRSt35";

const baseTreeMain = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stadia.OSMBright") // .Mapnik
    .addTo(mapMain.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  /*
Ordnance Survey demo
Need to import mapbox-gl
Through OS Vector Tile API you can connect to different layers for different use cases, including a detailed basemap and several data overlays.
https://osdatahub.os.uk/docs/vts/technicalSpecification

Can also use for data overlays
https://api.os.uk/maps/vector/v1/vts/{layer-name} eg. boundaries, greenspace

See also for stylesheets:
https://github.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets
https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/

Leaflet:
  https://osdatahub.os.uk/projects/OSMapsWebDemo
  OS_VTS_3857_No_Labels.json
  OS_VTS_3857_Open_Outdoor.json
  OS_VTS_3857_Greyscale.json
  OS_VTS_3857_Dark.json
  OS_VTS_3857_Light.json
  */

  const serviceUrl = "https://api.os.uk/maps/raster/v1/zxy";
  let copyrightStatement =
    "Contains OS data &copy; Crown copyright and database rights YYYY"; // '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
  copyrightStatement = copyrightStatement.replace(
    "YYYY",
    new Date().getFullYear()
  );
  // Load and display vector tile layer on the map.
  const osBaselayers = {
    light: L.tileLayer(
      serviceUrl + "/Light_3857/{z}/{x}/{y}.png?key=" + apiKey,
      { maxZoom: 20, attribution: copyrightStatement }
    ),
    road: L.tileLayer(serviceUrl + "/Road_3857/{z}/{x}/{y}.png?key=" + apiKey, {
      maxZoom: 20,
      attribution: copyrightStatement,
    }),
    outdoor: L.tileLayer(
      serviceUrl + "/Outdoor_3857/{z}/{x}/{y}.png?key=" + apiKey,
      { maxZoom: 20, attribution: copyrightStatement }
    ),
    //   // Doesn't exist for 3857 projection
    // leisure: L.tileLayer(
    //   serviceUrl + '/Leisure_3857/{z}/{x}/{y}.png?key=' + apiKey, { maxZoom: 20, attribution: copyrightStatement }
    //   ),
  };

  /*
  // Explore Ordnance Survey Overlay without mapBoxGL and how to format
  https://labs.os.uk/public/os-data-hub-examples/os-vector-tile-api/vts-example-add-overlay

  // https://api.os.uk/maps/vector/v1/vts/boundaries/resources/styles?key=npRUEEMn3OTN7lx7RPJednU5SOiRSt35
  const osOverlayBoundary = L.mapboxGL({
    attribution:
      '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
    style: `${serviceUrl}/boundaries/resources/styles?key=${apiKey}`,
    transformRequest: (url) => {
      return {
        url: (url += "&srs=3857"),
      };
    },
  });

  const osOverlay = {
    label: "OS Test <i class='material-icons md-12'>category</i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "Boundary",
        layer: osOverlayBoundary,
      },
    ],
  };

  overlaysTreeMain.children[5] = osOverlay;
*/

  // http://leaflet-extras.github.io/leaflet-providers/preview/
  return {
    label: "Base Layers <i class='fas fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fas fa-layer-group'></i>;",
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
          { label: "Bright", layer: defaultBasemap },
          { label: "Topo", layer: L.tileLayer.provider("OpenTopoMap") },
        ],
      },
      {
        label: "Black & White <i class='fas fa-layer-group'></i>",
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
          {
            label: "Dark",
            layer: L.tileLayer.provider("Stadia.AlidadeSmoothDark"),
          },
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
      {
        label: "Ordance Survey <i class='fas fa-layer-group'></i>",
        children: [
          { label: "Light", layer: osBaselayers.light },
          { label: "Road", layer: osBaselayers.road },
          { label: "Outdoor", layer: osBaselayers.outdoor },
          // { label: "Leisure", layer: osBaseLayers.leisure },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

// Global to enable subsequent change to overlay
const overlaysTreeMain = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

overlaysTreeMain.children[1] = overlayTrusts();

const mapControlMain = L.control.layers.tree(baseTreeMain, overlaysTreeMain, {
  // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
  collapsed: true, // Whether or not control options are displayed
  sortLayers: true,
  // namedToggle: true,
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
  closedSymbol:
    "<i class='far fa-plus-square'></i> <i class='far fa-folder'></i>", // Symbol displayed on a closed node
  openedSymbol:
    "<i class='far fa-minus-square'></i> <i class='far fa-folder-open'></i>", // Symbol displayed on an opened node
});

mapControlMain.addTo(mapMain.map);

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
//   label: "OS Feature Demo <i class='fas fa-hospital-symbol'></i>",
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
