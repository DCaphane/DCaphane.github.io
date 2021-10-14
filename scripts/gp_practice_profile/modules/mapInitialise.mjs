import {
  promGeoDataGP,
  gpDetails,
  promGeoDataCYCWards,
  promGeoDataLsoaBoundaries,
  promDataIMD,
  promHospitalDetails,
  trustSitesLoc,
  promGeoNationalCCGBoundaries,
  pcnFormatting,
  genID,
  overlayPCNs,
  overlayWards,
  overlayLSOAbyCCG,
  geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataNationalCCGBoundaries,
  styleWard,
  styleCCG,
  practiceLookup,
  styleLsoa,
  titleCase,
  userSelections,
  refreshChartsPostPracticeChange,
} from "../aggregateModules.mjs";

// Stores the map reference and the home location
const mapOfMaps = new Map();
const mapsWithGPMain = new Map();
const mapsWithGPSites = new Map(); // set of maps that include site codes

const mapsWithLSOA = new Map(); // default LSOA boundaries
const mapsWithLSOAFiltered = new Map();
export {
  mapOfMaps,
  mapsWithGPMain,
  mapsWithGPSites,
  mapsWithLSOA,
  mapsWithLSOAFiltered,
};

export function mapInitialise({
  mapDivID, // divID where map will be placed
  baselayer = "None",
  userOverlayGPMain = {},
  userOverlayGPSites = {},
  userOverlayCCGBoundary = {}, // = { inc: false, display: false, zoomExtent: true },
  userOverlayWardBoundary = {},
  userOverlayLsoaBoundary = {},
  userOverlayLsoaBoundaryByIMD = {},
  userOverlayFilteredLsoa = {},
  userOverlayNationalTrusts = false,
} = {}) {
  const promTesting = Promise.allSettled([
    promGeoDataGP,
    gpDetails,
    promGeoDataCYCWards,
    promGeoDataLsoaBoundaries,
    promDataIMD,
    promHospitalDetails,
  ]);

  // Default options

  // for showing the GP Practice Main Site only
  const overlayGPMain = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayGPMain
  );

  // for showing the GP Practice Branch and Main Sites
  const overlayGPSites = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayGPSites
  );

  // for showing the CCG(03Q) boundary
  const overlayCCGBoundary = Object.assign(
    { inc: true, display: false, zoomExtent: true },
    userOverlayCCGBoundary
  );

  // for showing the CYC ward boundary
  const overlayWardBoundary = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayWardBoundary
  );

  // for showing the full lsoa boundary (not filtered)
  const overlayLsoaBoundary = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayLsoaBoundary
  );

  // for showing the full lsoa boundary (not filtered) by IMD - think this slows things down
  const overlayLsoaBoundaryByIMD = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayLsoaBoundaryByIMD
  );

  // for maps which use the filtered lsoa boundary
  const overlayFilteredLsoa = Object.assign(
    { inc: false },
    userOverlayFilteredLsoa
  );

  // for initialising maps
  const thisMap = L.map(mapDivID, {
    preferCanvas: true,
    // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
    center: trustSitesLoc.yorkTrust, // centre on York Hospital
    zoom: 11,
    minZoom: 5, // how far out eg. 0 = whole world
    maxZoom: 20, // how far in, eg. to the detail (max varies by baselayer between 18 and 20)
    // https://leafletjs.com/reference-1.3.4.html#latlngbounds
    maxBounds: [
      [50.0, 1.6232], //south west
      [59.79, -10.239], //north east
    ],
    // layers: background, // default basemap that will appear first
    fullscreenControl: {
      // https://github.com/Leaflet/Leaflet.fullscreen
      pseudoFullscreen: true, // if true, fullscreen to page width and height
    },
  });

  const baseLayer = baselayers(baselayer);

  // Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
  function scaleBar({ position = "bottomleft" } = {}) {
    return L.control
      .scale({
        // https://leafletjs.com/reference-1.7.1.html#control-scale-option
        position: position,
        metric: true,
        imperial: true,
      })
      .addTo(thisMap);
  }

  function sideBar({ side = "left" } = {}) {
    const divMapID = document.getElementById(mapDivID); // used to store div where map will be created
    // create a div that will contain the sidebar
    const div = document.createElement("div");
    // give the div an id (used to identify container) and class
    const divSidebarID = genID.uid(`sidebar${side}`).id;
    div.setAttribute("id", divSidebarID);
    div.setAttribute("class", "leaflet-sidebar collapsed");
    divMapID.insertAdjacentElement("afterend", div);

    return new L.control.sidebar({
      autopan: false, // whether to maintain the centered map point when opening the sidebar
      closeButton: true, // whether to add a close button to the panes
      container: divSidebarID, // the DOM container or #ID of a predefined sidebar container that should be used
      position: side, // left or right
    }).addTo(thisMap);
  }

  /*
      The default figures here are the VoY CCG boundary
      layersMapBoundaries.get("voyCCGMain").getBounds().getCenter()
      latLngPoint can be an array [54.018213, -0.9849195] or object {lat: 54.018213, lng: -0.9849195}
      */
  let home = { lat: 54.018213, lng: -0.9849195 };
  mapOfMaps.set(thisMap, home);

  function zoomTo({ latLng = home, zoom = 9 } = {}) {
    thisMap.flyTo(latLng, zoom);
  }

  function homeButton() {
    return L.easyButton("fa-solid fa-house", zoomTo, "Zoom To Home").addTo(
      thisMap
    );
  }

  // Panes to control zIndex of geoJson layers
  thisMap.createPane("ccgBoundaryPane");
  thisMap.getPane("ccgBoundaryPane").style.zIndex = 374;

  thisMap.createPane("wardBoundaryPane");
  thisMap.getPane("wardBoundaryPane").style.zIndex = 375;

  thisMap.createPane("lsoaBoundaryPane");
  thisMap.getPane("lsoaBoundaryPane").style.zIndex = 376;

  thisMap.createPane("lsoaBoundaryPane2");
  thisMap.getPane("lsoaBoundaryPane2").style.zIndex = 377;

  function baselayers(baselayer) {
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

    const serviceUrl = "https://api.os.uk/maps/raster/v1/zxy",
      apiKey = "npRUEEMn3OTN7lx7RPJednU5SOiRSt35";

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
        { minZoom: 7, maxZoom: 20, attribution: copyrightStatement }
      ),
      road: L.tileLayer(
        serviceUrl + "/Road_3857/{z}/{x}/{y}.png?key=" + apiKey,
        {
          minZoom: 7,
          maxZoom: 20,
          attribution: copyrightStatement,
        }
      ),
      outdoor: L.tileLayer(
        serviceUrl + "/Outdoor_3857/{z}/{x}/{y}.png?key=" + apiKey,
        { minZoom: 7, maxZoom: 20, attribution: copyrightStatement }
      ),
      //   // Doesn't exist for 3857 projection
      // leisure: L.tileLayer(
      //   serviceUrl + '/Leisure_3857/{z}/{x}/{y}.png?key=' + apiKey, { minZoom: 7, maxZoom: 20, attribution: copyrightStatement }
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
    const baselayersTree = {
      label: "Base Layers <i class='fa-solid fa-globe'></i>",
      children: [
        {
          label: "Colour <i class='fa-solid fa-layer-group'></i>",
          children: [
            {
              label: "OSM",
              layer: L.tileLayer.provider("OpenStreetMap.Mapnik", {
                maxZoom: 19,
              }),
            },
            {
              label: "OSM HOT",
              layer: L.tileLayer.provider("OpenStreetMap.HOT", { maxZoom: 19 }),
            },
            // { label: "CartoDB", layer: L.tileLayer.provider("CartoDB.Voyager", {maxZoom:19}) },
            {
              label: "Water Colour",
              layer: L.tileLayer.provider("Stamen.Watercolor", {
                minZoom: 1,
                maxZoom: 16,
              }),
            },
            {
              label: "Bright",
              layer: L.tileLayer.provider("Stadia.OSMBright", { maxZoom: 20 }),
            }, // .Mapnik
            {
              label: "Topo",
              layer: L.tileLayer.provider("OpenTopoMap", { maxZoom: 17 }),
            },
          ],
        },
        {
          label: "Black & White <i class='fa-solid fa-layer-group'></i>",
          children: [
            // { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron", {maxZomm: 19}) },
            {
              label: "High Contrast",
              layer: L.tileLayer.provider("Stamen.Toner", {
                minZoom: 0,
                maxZoom: 20,
              }),
            },
            {
              label: "Grey",
              layer: L.tileLayer.provider("Stadia.AlidadeSmooth", {
                maxZoom: 20,
              }),
            },
            {
              label: "ST Hybrid",
              layer: L.tileLayer.provider("Stamen.TonerHybrid", {
                minZoom: 0,
                maxZoom: 20,
              }),
            },
            {
              label: "Dark",
              layer: L.tileLayer.provider("Stadia.AlidadeSmoothDark", {
                maxZoom: 20,
              }),
            },
            {
              label: "Jawg Matrix",
              layer: L.tileLayer.provider("Jawg.Matrix", {
                // // Requires Access Token
                accessToken:
                  "phg9A3fiyZq61yt7fQS9dQzzvgxFM5yJz46sJQgHJkUdbdUb8rOoXviuaSnyoYQJ", //  biDemo
                minZoom: 0,
                maxZoom: 22,
              }),
            },
          ],
        },
        {
          label: "Ordnance Survey <i class='fa-solid fa-layer-group'></i>",
          children: [
            { label: "OS Light", layer: osBaselayers.light },
            { label: "OS Road", layer: osBaselayers.road },
            { label: "OS Outdoor", layer: osBaselayers.outdoor },
            // { label: "OS Leisure", layer: osBaseLayers.leisure },
          ],
        },
        {
          label: "None",
          // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
          layer: L.tileLayer("", {
            zoom: 0,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
        },
      ],
    };

    /*
    The following loops through the baselayersTree structure looking for label name = baselayer name (passed in function)
    If found, this will be the selected (default) baselayer for the given map
    */

    for (let key in baselayersTree.children) {
      let layer;
      let found = false;
      const obj = baselayersTree.children[key];
      if (obj.hasOwnProperty("children")) {
        const arr = baselayersTree.children[key].children;

        for (let i = 0; i < arr.length; i++) {
          // console.log({ label: arr[i].label, layer: arr[i].layer });
          if (arr[i].label === baselayer) {
            layer = arr[i].layer; //.addTo(thisMap);
            found = true;
            break;
          }
        }
      } else {
        // console.log({ label: obj.label, layer: obj.layer });
        if (obj.label === baselayer) {
          layer = obj.layer; // .addTo(thisMap);
          found = true;
        }
      }
      if (found) {
        layer
          .on("tileloadstart", function (event) {
            event.tile.setAttribute("loading", "lazy");
          })
          .addTo(thisMap);
        break;
      }
    }

    return baselayersTree;
  }

  // Global to enable subsequent change to overlay
  const overlays = {
    label: "Overlays",
    selectAllCheckbox: true,
    children: [],
  };
  // to keep log of overlay position to enable addition or refresh
  let overlayIndex = 0;
  const overlayMap = new Map(); // key is layerName and value is index (int)

  // Default positions for overlayer order
  overlayMap.set("gpMain", 0);
  overlayMap.set("gpSites", 1);
  overlayMap.set("ccgBoundary", 2);
  overlayMap.set("wards", 3);
  overlayMap.set("lsoaBoundaryFull", 4);
  overlayMap.set("nationalTrusts", 5);
  overlayMap.set("selectedTrusts", 6);
  overlayMap.set("separatorLine", 7);
  overlayMap.set("gpSitesFiltered", 8);

  function updateOverlay(olName, ol, remove = false) {
    if (!overlayMap.has(olName)) {
      // if the overlay (by name) does not already exist
      const arr = Array.from(overlayMap.values());
      const maxValue = Math.max(...arr);
      if (arr.length > 0) {
        overlayIndex = maxValue + 1;
      }

      overlayMap.set(olName, overlayIndex);
      overlays.children[overlayIndex] = ol;
    } else {
      if (remove) {
        const idx = overlayMap.get(olName);
        delete overlays.children[idx];
      } else {
        const idx = overlayMap.get(olName);
        overlays.children[idx] = ol;
      }
    }
  }

  const control = layerControl();

  function layerControl() {
    return L.control.layers
      .tree(baseLayer, overlays, {
        // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
        collapsed: true, // Whether or not control options are displayed
        sortLayers: true,
        // namedToggle: true,
        collapseAll: "Collapse all",
        expandAll: "Expand all",
        // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
        closedSymbol:
          "<i class='fa-solid fa-square-plus'></i> <i class='fa-solid fa-folder'></i>", // Symbol displayed on a closed node
        openedSymbol:
          "<i class='fa-solid fa-square-minus'></i> <i class='fa-solid fa-folder-open'></i>", // Symbol displayed on an opened node
      })
      .addTo(thisMap);
  }

  function refreshOverlayControl() {
    /*
      to refresh the map overlay buttons
      this needs to be done anytime something is changed that affects the overlay
      */
    control
      .setOverlayTree(overlays)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true);
  }

  // Option to include the main GP Practice Site
  if (overlayGPMain.inc || overlayGPMain.zoomExtent) {
    Promise.allSettled([promGeoDataGP]).then((data) => {
      const layersMapGpMain = new Map();
      const practiceMain = L.geoJSON(data[0].value, {
        pointToLayer: function (feature, latlng) {
          return pcnFormatting(feature, latlng, { addBounce: true });
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup("", { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css
          layer.on("mouseover", function (e) {
            this.openPopup();
          });
          layer.on("mouseout", function (e) {
            this.closePopup();
          });
          layer.on("click", function (e) {
            // console.log(e.sourceTarget.feature.properties.practice_code);
            const selectedPractice = feature.properties.orgCode;
            if (userSelections.selectedPractice !== selectedPractice) {
              // update the Practice in userSelections
              userSelections.selectedPractice = selectedPractice;
              // update other charts
              refreshChartsPostPracticeChange(selectedPractice);
            }
          });

          const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
          // Initialize the category array if not already set.
          if (!layersMapGpMain.has(category)) {
            layersMapGpMain.set(category, L.layerGroup());
          }
          layersMapGpMain.get(category).addLayer(layer);
        },
        filter: function (d) {
          if (d.properties.type === "main") return true;
        },
      });

      if (overlayGPMain.display) {
        L.layerGroup(Array.from(layersMapGpMain.values())).addTo(thisMap);
      }

      if (overlayGPMain.inc || overlayGPMain.display) {
        const ol = overlayPCNs(layersMapGpMain);
        updateOverlay("gpMain", ol);
      }

      // zoom option here
      if (overlayGPMain.zoomExtent) {
        thisMap.fitBounds(practiceMain.getBounds());
      }

      if (overlayGPMain.inc) {
        mapsWithGPMain.set(thisMap, [practiceMain, layersMapGpMain]);
      }
    });
  }

  // Option to include the GP Practice branch and main Sites
  if (overlayGPSites.inc || overlayGPSites.zoomExtent) {
    Promise.allSettled([promGeoDataGP, gpDetails]).then((data) => {
      const layersMapGpSites = new Map();
      const gpSites = L.geoJSON(data[0].value, {
        pointToLayer: function (feature, latlng) {
          return pcnFormatting(feature, latlng);
        },
        onEachFeature: function (feature, layer) {
          const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. pcn
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
          <p>${layer.feature.properties.orgCode}: ${orgName}
          <br>Parent Org:${layer.feature.properties.parent}</p>`;

          layer.bindPopup(popupText, { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css
          layer.on("mouseover", function (e) {
            this.openPopup();
          });
          layer.on("mouseout", function (e) {
            this.closePopup();
          });
          layer.on("click", function (e) {
            thisMap.setView(e.latlng, 11);
            console.log({ selectedSite: layer.feature.properties.orgCode });
          });

          // Initialize the category array if not already set.
          if (!layersMapGpSites.has(category)) {
            layersMapGpSites.set(category, L.layerGroup());
          }
          layersMapGpSites.get(category).addLayer(layer);
        },
      });

      const gpSitesLayer = L.layerGroup(Array.from(layersMapGpSites.values()));
      if (overlayGPSites.display) {
        gpSitesLayer.addTo(thisMap);
      }

      if (overlayGPSites.inc || overlayGPSites.display) {
        const ol = overlayPCNs(layersMapGpSites); // function to align sites by pcn to overlay tree
        updateOverlay("gpSites", ol);
      }

      // zoom option here
      if (overlayGPSites.zoomExtent) {
        thisMap.fitBounds(gpSites.getBounds());
      }

      if (overlayGPSites.inc) {
        mapsWithGPSites.set(thisMap, [gpSitesLayer]); // add as an array to subsequently inc a filtered layer
      }
    });
  }

  // Option to include the CCG Boundary layer (option to display is later)
  if (overlayCCGBoundary.inc || overlayCCGBoundary.zoomExtent) {
    Promise.allSettled([promGeoNationalCCGBoundaries]).then(() => {
      const ccgBoundaryVoY = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("VoY"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS Vale of York CCG" ? true : false;
        },
      });

      const ccgBoundaryNY = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("NY"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS North Yorkshire CCG" ? true : false;
        },
      });

      const ccgBoundaryER = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("ER"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS East Riding of Yorkshire CCG" ? true : false;
        },
      });

      const ccgBoundaryHull = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("Hull"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS Hull CCG" ? true : false;
        },
      });

      if (overlayCCGBoundary.display) {
        ccgBoundaryVoY.addTo(thisMap);
      }

      if (overlayCCGBoundary.inc || overlayCCGBoundary.display) {
        const ccgBoundaryOverlay = {
          label: "CCG Boundaries",
          selectAllCheckbox: true,
          children: [
            {
              label: "Vale of York",
              layer: ccgBoundaryVoY,
            },
            {
              label: "North Yorkshire",
              layer: ccgBoundaryNY,
            },
            {
              label: "East Riding",
              layer: ccgBoundaryER,
            },
            {
              label: "Hull",
              layer: ccgBoundaryHull,
            },
          ],
        };

        updateOverlay("ccgBoundary", ccgBoundaryOverlay);
      }

      // zoom option here
      if (overlayCCGBoundary.zoomExtent) {
        thisMap.fitBounds(ccgBoundaryVoY.getBounds());
      }
    });
  }

  // Do you want to include the Ward Boundary layer (option to display is later)
  if (overlayWardBoundary.inc || overlayWardBoundary.zoomExtent) {
    Promise.allSettled([promGeoDataCYCWards]).then(() => {
      const layersMapWards = new Map();

      const geoDataCYCWards = L.geoJSON(geoWardBoundaries, {
        style: styleWard,
        pane: "wardBoundaryPane",
        onEachFeature: function (feature, layer) {
          const category = +feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc

          if (!layersMapWards.has(category)) {
            layersMapWards.set(category, L.layerGroup());
          }
          layersMapWards.get(category).addLayer(layer);
        },
      });

      if (overlayWardBoundary.display) {
        L.layerGroup(Array.from(layersMapWards.values())).addTo(thisMap);
      }

      if (overlayWardBoundary.inc || overlayWardBoundary.display) {
        const ol = overlayWards(layersMapWards);
        updateOverlay("wards", ol);
      }

      // zoom option here
      if (overlayWardBoundary.zoomExtent) {
        thisMap.fitBounds(geoDataCYCWards.getBounds());
      }
    });
  }

  // Do you want to include the LSOA Boundary layer (option to display is later)
  // This layer will not be filtered ie. full boundary
  if (overlayLsoaBoundary.inc || overlayLsoaBoundary.zoomExtent) {
    Promise.allSettled([promGeoDataLsoaBoundaries]).then(() => {
      // const layersMapByCCG = new Map();
      // Consider option to show by CCG here...

      const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
        style: styleLsoa,
        pane: "lsoaBoundaryPane",
        // onEachFeature: function (feature, layer) {
        //   const lsoa = feature.properties.lsoa;
        // },
        // filter: function (d) {
        //   // match site codes based on 6 char GP practice code
        //   const strPractice = d.properties.orgCode;

        //   return ccg === "03Q" ? true : false;
        // },
      });

      if (overlayLsoaBoundary.display) {
        // L.layerGroup(Array.from(layersMapByCCG.values())).addTo(thisMap);
        geoDataLsoaBoundaries.addTo(thisMap);
      }

      if (overlayLsoaBoundary.inc || overlayLsoaBoundary.display) {
        // const ol = overlayLSOAbyIMD(layersMapByCCG, "LSOA by CCG");
        const ol = overlayLSOAbyCCG(geoDataLsoaBoundaries);
        updateOverlay("lsoaBoundaryFull", ol);
      }

      // zoom option here
      if (overlayLsoaBoundary.zoomExtent) {
        thisMap.fitBounds(geoDataLsoaBoundaries.getBounds());
      }

      if (overlayLsoaBoundary.inc) {
        mapsWithLSOA.set(thisMap, geoDataLsoaBoundaries);
      }
    });
  }

  // Do you want to include the LSOA Boundary layer by IMD (option to display is later) - this can be slow
  // This layer will not be filtered ie. full boundary
  if (overlayLsoaBoundaryByIMD.inc || overlayLsoaBoundaryByIMD.zoomExtent) {
    Promise.allSettled([promGeoDataLsoaBoundaries, promDataIMD]).then(
      (lsoaBoundaries) => {
        const layersMapByIMD = new Map();

        const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
          style: styleLsoa,
          pane: "lsoaBoundaryPane",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa; // category variable, used to store the distinct feature eg. phc_no, practice_group etc

            let imdDecile;
            if (mapLSOAbyIMD.has(lsoa)) {
              imdDecile = mapLSOAbyIMD.get(lsoa); // IMD Decile
            } else {
              imdDecile = "exc"; // undefined
            }

            if (!layersMapByIMD.has(imdDecile)) {
              layersMapByIMD.set(imdDecile, L.layerGroup());
            }
            layersMapByIMD.get(imdDecile).addLayer(layer);
          },
        });

        if (overlayLsoaBoundaryByIMD.display) {
          L.layerGroup(Array.from(layersMapByIMD.values())).addTo(thisMap);
        }

        if (overlayLsoaBoundaryByIMD.inc || overlayLsoaBoundaryByIMD.display) {
          const ol = overlayLSOAbyIMD(layersMapByIMD, "LSOA by IMD");
          updateOverlay("lsoaBoundaryFull", ol);
        }

        // zoom option here
        if (overlayLsoaBoundaryByIMD.zoomExtent) {
          thisMap.fitBounds(geoDataLsoaBoundaries.getBounds());
        }

        if (overlayLsoaBoundaryByIMD.inc) {
          mapsWithLSOA.set(thisMap, geoDataLsoaBoundaries);
        }
      }
    );
  }

  // This is the option for maps which subsequently filter the lsoa
  if (overlayFilteredLsoa.inc) {
    mapsWithLSOAFiltered.set(thisMap, null);
  }

  if (userOverlayNationalTrusts) {
    promHospitalDetails.then((data) => {
      // Styling: https://gis.stackexchange.com/a/360454
      const nhsTrustSites = L.conditionalMarkers([]),
        nonNhsTrustSites = L.conditionalMarkers([]);

      let i = 0,
        j = 0; // counter for number of providers in each category

      data.forEach((d) => {
        const category = d.sector;
        const popupText = `<h3>${d.organisationCode}: ${d.organisationName}</h3>
          <p>${d.parentODSCode}: ${d.parentName}
          <br>${d.sector}</p>`;

        if (category === "NHS Sector") {
          const marker = trustMarker({
            position: d.markerPosition,
            className: "nhs",
            text: "H",
            popupText: popupText,
            popupClass: "popup-trustNHS",
          });
          marker.addTo(nhsTrustSites);
          i++;
        } else {
          // Independent Sector
          const marker = trustMarker({
            position: d.markerPosition,
            className: "independent",
            text: "H",
            popupText: popupText,
            popupClass: "popup-trustIS",
          });
          marker.addTo(nonNhsTrustSites);
          j++;
        }
      });

      // This option controls how many markers can be displayed
      nhsTrustSites.options.maxMarkers = i;
      nonNhsTrustSites.options.maxMarkers = j;

      // Overlay structure for Trust Sites
      const nationalTrusts = overlayNationalTrusts(
        nhsTrustSites,
        nonNhsTrustSites
      );

      updateOverlay("nationalTrusts", nationalTrusts);

      function trustMarker({
        position,
        className,
        text = "H",
        popupText,
        popupClass = "popup-dark",
      } = {}) {
        return L.marker(position, {
          icon: L.divIcon({
            className: `trust-marker ${className}`,
            html: text,
            iconSize: L.point(20, 20),
            popupAnchor: [0, -10],
          }),
        }).bindPopup(popupText, { className: popupClass }); // popup formatting applied in css, css/leaflet_tooltip.css
      }

      function overlayNationalTrusts(nhs, independent) {
        return {
          label: "National Hospital Sites <i class='fa-solid fa-circle-h'></i>",
          selectAllCheckbox: true,
          children: [
            {
              label:
                "NHS <i class='fa-solid fa-circle-h' style='font-size:14px;color:blue;'></i>",
              layer: nhs,
            },
            {
              label:
                "Independent <i class='fa-solid fa-circle-h' style='font-size:14px;color:green;'></i>",
              layer: independent,
            },
          ],
        };
      }
    });
  }

  return {
    map: thisMap,
    scaleBar: scaleBar,
    sideBar: sideBar,
    home: home,
    homeButton: homeButton,
    zoomTo: zoomTo,
    // LayerTreeControl
    // baselayers: baselayers,
    // overlays: overlays,
    updateOverlay: updateOverlay,
    layerControl: layerControl,
    refreshOverlayControl: refreshOverlayControl,
    promTesting: promTesting,
  };
}
