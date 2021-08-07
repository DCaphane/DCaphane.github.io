/*
Reusable map components:
	https://stackoverflow.com/questions/53594814/leaflet-multiple-maps-on-same-page
*/

// Controls
// Background and Sites layers

/* Add a sidebar
https://github.com/nickpeihl/leaflet-sidebar-v2
*/

// Populations smaller than this to be ignored
const minPopulationLSOA = 20;

// Keep track of maps
// Stores the map reference and the home location
const mapOfMaps = new Map();
// Keep track of which maps contain
const mapsWithGPMain = new Map();
const mapsWithGPSites = new Map(); // set of maps that include site codes

const mapsWithLSOA = new Map(), // default LSOA boundaries
  mapsWithLSOAFiltered = new Map(),
  // Contains lsoa (key) and it's population for the selected practice (value)
  mapsFilteredLSOA = new Map(); // selected lsoas

/*
Can use like the following:
updatePopUpText(mapsWithGPMain.get(mapMain.map)[0])
*/

function mapInitialise({
  mapDivID, // divID where map will be placed
  baselayer = "None",
  userOverlayGPMain = {},
  userOverlayGPSites = {},
  userOverlayCCGBoundary = {}, // = { inc: false, display: false, zoomExtent: true },
  userOverlayWardBoundary = {},
  userOverlayLsoaBoundary = {},
  userOverlayFilteredLsoa = {},
  userOverlayNationalTrusts = false,
} = {}) {
  const promTesting = Promise.allSettled([
    promGeoDataGP,
    gpDetails,
    promGeoVoYBoundary,
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
          break;
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

  function updateOverlay(olName, ol) {
    if (!overlayMap.has(olName)) {
      const arr = Array.from(overlayMap.values());
      const maxValue = Math.max(...arr);
      if (arr.length > 0) {
        overlayIndex = maxValue + 1;
      }

      overlayMap.set(olName, overlayIndex);
      overlays.children[overlayIndex] = ol;
    } else {
      const idx = overlayMap.get(olName);
      overlays.children[idx] = ol;
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
    Promise.allSettled([promGeoVoYBoundary]).then((ccgBoundaries) => {
      const ccgBoundary = L.geoJSON(ccgBoundaries[0].value, {
        style: styleCCG,
        pane: "ccgBoundaryPane",
      });

      if (overlayCCGBoundary.display) {
        ccgBoundary.addTo(thisMap);
      }

      if (overlayCCGBoundary.inc || overlayCCGBoundary.display) {
        const ccgBoundaryOverlay = {
          label: "CCG Boundaries",
          selectAllCheckbox: true,
          children: [
            {
              label: "Vale of York",
              layer: ccgBoundary,
            },
          ],
        };

        updateOverlay("ccgBoundary", ccgBoundaryOverlay);
      }

      // zoom option here
      if (overlayCCGBoundary.zoomExtent) {
        thisMap.fitBounds(ccgBoundary.getBounds());
      }
    });
  }

  // Do you want to include the Ward Boundary layer (option to display is later)
  if (overlayWardBoundary.inc || overlayWardBoundary.zoomExtent) {
    Promise.allSettled([promGeoDataCYCWards]).then((wardBoundaries) => {
      const layersMapWards = new Map();

      const geoDataCYCWards = L.geoJSON(wardBoundaries[0].value, {
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
    Promise.allSettled([promGeoDataLsoaBoundaries, promDataIMD]).then(
      (lsoaBoundaries) => {
        const layersMapByIMD = new Map();

        const geoDataLsoaBoundaries = L.geoJSON(lsoaBoundaries[0].value, {
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

        if (overlayLsoaBoundary.display) {
          L.layerGroup(Array.from(layersMapByIMD.values())).addTo(thisMap);
        }

        if (overlayLsoaBoundary.inc || overlayLsoaBoundary.display) {
          const ol = overlayLSOA(layersMapByIMD, "LSOA by IMD");
          updateOverlay("lsoaBoundaryFull", ol);
        }

        // zoom option here
        if (overlayLsoaBoundary.zoomExtent) {
          thisMap.fitBounds(geoDataLsoaBoundaries.getBounds());
        }

        if (overlayLsoaBoundary.inc) {
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
          const marker = trustMarker(d.markerPosition, "nhs", "H", popupText);
          marker.addTo(nhsTrustSites);
          i++;
        } else {
          // Independent Sector
          const marker = trustMarker(
            d.markerPosition,
            "independent",
            "H",
            popupText
          );
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

      function trustMarker(position, className, text = "H", popupText) {
        return L.marker(position, {
          icon: L.divIcon({
            className: `trust-marker ${className}`,
            html: text,
            iconSize: L.point(20, 20),
            popupAnchor: [0, -10],
          }),
        }).bindPopup(popupText);
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

// Popup text for the gp markers. This updates with the change in date to give the relevant population figure
function updatePopUpText(sourceLayer) {
  sourceLayer.eachLayer(function (layer) {
    const period = userSelections.selectedDate,
      practiceCode = layer.feature.properties.orgCode,
      // clinicalDirector = layer.feature.properties.clinical_director,
      pcnName = layer.feature.properties.pcn_name,
      population = dataPopulationGPSummary.get(period).get(practiceCode);

    let practiceName;
    if (practiceLookup.has(practiceCode)) {
      practiceName = titleCase(practiceLookup.get(practiceCode));
    } else {
      practiceName = "";
    }

    const popupText = `<h3>${pcnName}</h3>
      <p>${practiceCode}: ${practiceName}
      <br>Population (${formatPeriod(period)}): ${formatNumber(
      population
    )}</p>`;
    // <br>Clinical Director: ${clinicalDirector}

    layer.setPopupContent(popupText);
  });
}

// consider incorporating this into mapinit
// options around fitBounds, setView
function defaultHome({ zoomInt = 9 } = {}) {
  mapOfMaps.forEach(function (value, key) {
    key.flyTo(value, (zoom = zoomInt));
  });
  // const map = this.map;
  // map.fitBounds(layersMapBoundaries.get("voyCCGMain").getBounds());
}

// Example using a handful of selected Trust locations
const trustSitesLoc = {
  yorkTrust: [53.96895, -1.08427],
  scarboroughTrust: [54.28216, -0.43619],
  harrogateTrust: [53.99381, -1.51756],
  leedsTrust: [53.80687, -1.52034],
  southTeesTrust: [54.55176, -1.21479],
  hullTrust: [53.74411, -0.035813],
};

function trustMarker(location, text) {
  return L.marker(location, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "h-square",
      borderColor: "red",
      backgroundColor: "transparent",
      textColor: "rgba(255,0,0)", // Text color of marker icon
      popupAnchor: [0, -5], // adjusts offset position of popup
    }),
    zIndexOffset: 1000,
    draggable: false,
  }).bindPopup(text); // Text to display in pop up
}

// Separate marker for York Trust
function yorkTrust() {
  const map = this.map;
  return L.marker(trustSitesLoc.yorkTrust, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "h-square",
      borderColor: "red",
      backgroundColor: "transparent",
      textColor: "rgba(255,0,0)", // Text color of marker icon
    }),
    zIndexOffset: 1000,
    draggable: false,
  })
    .addTo(map)
    .bindPopup("York Hospital"); // Text to display in pop up
}

// function homeButton() {
//   const map = this.map;
//   return L.easyButton(
//     "fa-solid fa-house",
//     function (btn) {
//       // map.setView(trustSitesLoc.yorkTrust, 9);
//       map.setView(
//         layersMapBoundaries.get("voyCCGMain").getBounds().getCenter(),
//         9
//       );
//     },
//     "Zoom To Home"
//   ).addTo(map);
// }

/*
Define options of bouncing for all markers
https://github.com/hosuaby/Leaflet.SmoothMarkerBouncing#options-of-bouncing

When pcnFormatting is called, if bounce parameter is set to true,
  toggleBouncing is applied to the marker.
  This will stop/ start the bouncing when the marker is clicked

The function updateBouncingMarkers is applied when a practice change is made
Either via the practice selection drop down or on marker click
*/
L.Marker.setBouncingOptions({
  bounceHeight: 15, // height of the bouncing
  contractHeight: 12,
  bounceSpeed: 52, // bouncing speed coefficient
  contractSpeed: 52,
  // shadowAngle: null,
  elastic: true,
  exclusive: true,
});

function updateBouncingMarkers() {
  // https://github.com/hosuaby/Leaflet.SmoothMarkerBouncing
  /*
  // stop all bouncing
  This would apply to all maps with bouncing.
  If only wanted to apply to specific map (eg. mapMain)
    step 1: test userSelections.selectedPractice !== "All Practices"
    step 2: loop through markers (like below, no need to check practice) and set to .stopBouncing()
  */
  L.Marker.stopAllBouncingMarkers();

  // array of layers in the mapMain
  // mapsWithGPMain.forEach(function (value, key) {
  for (const value of mapsWithGPMain.values()) {
    const arr = Array.from(value[1].values());
    arr.forEach(function (test) {
      let obj = test._layers;
      Object.values(obj).forEach(function (val) {
        const gpPractice = val.feature.properties.orgCode;
        const marker = val._bouncingMotion.marker;
        if (gpPractice === userSelections.selectedPractice) {
          marker.bounce(); // starts/stops bouncing of the marker
        }
      });
    });
  }
}

function filterGPPracticeSites(zoomToExtent = false) {
  /* This will deselect the 'entire' GP Sites layer
  and return an additional filtered layer based on the selected practice
  */

  Promise.allSettled([promGeoDataGP, gpDetails]).then((data) => {
    mapsWithGPSites.forEach(function (value, key) {
      // value includes the original unfiltered sites layer, value[0] and the filtered layer if exists, value[1]

      if (key.hasLayer(value[0])) {
        // the original sites layer
        key.removeLayer(value[0]);
      }

      // the filtered sites layer
      if (value.length === 2) {
        if (key.hasLayer(value[1])) {
          key.removeLayer(value[1]);
        }
        value.pop(); // not necessary as will be overwritten?
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
        gpSites.addTo(key);

        value.push(gpSites); // append the filtered layer
        mapsWithGPSites.set(key, value);

        // if (zoomToExtent) {
        key.fitBounds(gpSites.getBounds().pad(0.1));
        // }
      } else {
        // reset to show all sites
        key.addLayer(value[0]);
        key.flyTo(mapOfMaps.get(key), 9);
      }
    });
    refreshMapOverlayControls();
  });
}

function styleLsoaTestOnly(feature) {
  return {
    fillColor: "#FFA400", // background
    fillOpacity: 0, // transparent
    weight: 0.9, // border
    color: "#FFA400", // border
    opacity: 1,
    // dashArray: "3",
  };
}

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightedPractice !== "undefined") {
    map.map.removeLayer(highlightedPractice);
  }

  Promise.allSettled([promGeoDataGP]).then((data) => {
    highlightedPractice = L.geoJSON(data[0].value, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.orgCode === selPractice) {
          return (markerLayer = L.marker(latlng, {
            icon: arrHighlightIcons[5],
            zIndexOffset: -5,
          }));
        }
      },
    });

    if (selPractice === "All Practices" || selPractice === undefined) {
      defaultHome();
    } else {
      map.map.addLayer(highlightedPractice);

      if (zoomToExtent) {
        // map.map.fitBounds(highlightedPractice.getBounds());
        const practiceLocation = highlightedPractice.getBounds().getCenter();
        map.map.setView(practiceLocation, 10);
      }
    }
  });
}

function overlayPCNs(mapObj) {
  return {
    label: "Sites by PCN",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        selectAllCheckbox: true,
        children: [
          {
            label: "North",
            selectAllCheckbox: true,
            children: [
              {
                label: "South Hambleton And Ryedale",
                layer: mapObj.get("South Hambleton And Ryedale"),
              },
            ],
          },
          {
            label: "Central",
            selectAllCheckbox: true,
            children: [
              {
                label: "Priory Medical Group",
                layer: mapObj.get("Priory Medical Group"),
              },
              {
                label: "West, Outer and North East York",
                layer: mapObj.get("West, Outer and North East York"),
              },
              {
                label: "York City Centre",
                layer: mapObj.get("York City Centre"),
              },
              {
                label: "York East",
                layer: mapObj.get("York East"),
              },
              {
                label: "York Medical Group",
                layer: mapObj.get("York Medical Group"),
              },
            ],
          },
          {
            label: "South",
            selectAllCheckbox: true,
            children: [
              {
                label: "Selby Town",
                layer: mapObj.get("Selby Town"),
              },
              {
                label: "Tadcaster & Selby Rural Area",
                layer: mapObj.get("Tadcaster & Selby Rural Area"),
              },
            ],
          },
        ],
      },
    ],
  };
}

function overlayTrusts() {
  return {
    label: "Hospital Sites <i class='fa-solid fa-circle-h'></i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "York",
        layer: trustMarker(trustSitesLoc.yorkTrust, "York Trust"),
      },
      {
        label: "Harrogate",
        layer: trustMarker(trustSitesLoc.harrogateTrust, "Harrogate Trust"),
      },
      {
        label: "Scarborough",
        layer: trustMarker(trustSitesLoc.scarboroughTrust, "Scarborough Trust"),
      },
      {
        label: "Leeds",
        layer: trustMarker(trustSitesLoc.leedsTrust, "Leeds Trust"),
      },
      {
        label: "South Tees",
        layer: trustMarker(trustSitesLoc.southTeesTrust, "South Tees Trust"),
      },
      {
        label: "Hull",
        layer: trustMarker(trustSitesLoc.hullTrust, "Hull Trust"),
      },
    ],
  };
}

function overlayWards(mapObj) {
  return {
    label: "Ward Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "CYC",
        selectAllCheckbox: true,
        children: [
          {
            label: "Ward Group: 1",
            layer: mapObj.get(1),
          },
          {
            label: "Ward Group: 2",
            layer: mapObj.get(2),
          },
          {
            label: "Ward Group: 3",
            layer: mapObj.get(3),
          },
          {
            label: "Ward Group: 4",
            layer: mapObj.get(4),
          },
          {
            label: "Ward Group: 5",
            layer: mapObj.get(5),
          },
          {
            label: "Ward Group: 6",
            layer: mapObj.get(6),
          },
        ],
      },
    ],
  };
}

function overlayLSOA(mapObj, labelDesc) {
  return {
    label: labelDesc,
    selectAllCheckbox: true,
    children: [
      {
        label: "IMD: 1 (Most Deprived)",
        layer: mapObj.get(1),
      },
      {
        label: "IMD: 2",
        layer: mapObj.get(2),
      },
      {
        label: "IMD: 3",
        layer: mapObj.get(3),
      },
      {
        label: "IMD: 4",
        layer: mapObj.get(4),
      },
      {
        label: "IMD: 5",
        layer: mapObj.get(5),
      },
      {
        label: "IMD: 6",
        layer: mapObj.get(6),
      },
      {
        label: "IMD: 7",
        layer: mapObj.get(7),
      },
      {
        label: "IMD: 8",
        layer: mapObj.get(8),
      },
      {
        label: "IMD: 9",
        layer: mapObj.get(9),
      },
      {
        label: "IMD: 10  (Least Deprived)",
        layer: mapObj.get(10),
      },
      {
        label: "Exc",
        layer: mapObj.get("exc"),
      },
    ],
  };
}

async function mapMarkersNationalTrust() {
  // Styling: https://gis.stackexchange.com/a/360454
  const nhsTrustSites = L.conditionalMarkers([]),
    nonNhsTrustSites = L.conditionalMarkers([]);

  let i = 0,
    j = 0; // counter for number of providers in each category
  const data = await promHospitalDetails;

  data.forEach((d) => {
    const category = d.sector;
    const popupText = `<h3>${d.organisationCode}: ${d.organisationName}</h3>
      <p>${d.parentODSCode}: ${d.parentName}
      <br>${d.sector}</p>`;

    if (category === "NHS Sector") {
      const marker = trustMarker(d.markerPosition, "nhs", "H", popupText);
      marker.addTo(nhsTrustSites);
      i++;
    } else {
      // Independent Sector
      const marker = trustMarker(
        d.markerPosition,
        "independent",
        "H",
        popupText
      );
      marker.addTo(nonNhsTrustSites);
      j++;
    }
  });

  // This option controls how many markers can be displayed
  nhsTrustSites.options.maxMarkers = i;
  nonNhsTrustSites.options.maxMarkers = j;

  // Overlay structure for Trust Sites
  const nationalTrusts = overlayNationalTrusts(nhsTrustSites, nonNhsTrustSites);

  // Add overlay to mapMain
  overlaysTreeMain.children[4] = nationalTrusts;

  function trustMarker(position, className, text = "H", popupText) {
    return L.marker(position, {
      icon: L.divIcon({
        className: `trust-marker ${className}`,
        html: text,
        iconSize: L.point(20, 20),
        popupAnchor: [0, -10],
      }),
    }).bindPopup(popupText);
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
}

function refreshMapOverlayControls() {
  /*
  to refresh the map overlay buttons
  this needs to be done anytime something is changed that affects the overlay
  */

  mapD3Bubble.promTesting.then((d) => {
    mapMain.refreshOverlayControl();
    // mapSites.refreshOverlayControl();
    mapPopn.refreshOverlayControl();
    mapIMD.refreshOverlayControl();
    mapD3Bubble.refreshOverlayControl();
  });
  // for (const [key, value] of mapOverlays) {
  //   key.refreshOverlayControl(value)
  // }
}

// function refreshMapMainControl() {
//   mapControlMain
//     .setOverlayTree(overlaysTreeMain)
//     .collapseTree() // collapse the baselayers tree
//     // .expandSelected() // expand selected option in the baselayer
//     .collapseTree(true);
// }

// function refreshMapControlSites() {
//   mapControlSites
//     .setOverlayTree(overlaysTreeSites)
//     .collapseTree() // collapse the baselayers tree
//     // .expandSelected() // expand selected option in the baselayer
//     .collapseTree(true);
// }

// function refreshMapControlPopn() {
//   mapControlPopn
//     .setOverlayTree(overlaysTreePopn)
//     .collapseTree() // collapse the baselayers tree
//     // .expandSelected() // expand selected option in the baselayer
//     .collapseTree(true);
// }

// function refreshMapControlIMD() {
//   mapControlIMD
//     .setOverlayTree(overlaysTreeIMD)
//     .collapseTree() // collapse the baselayers tree
//     // .expandSelected() // expand selected option in the baselayer
//     .collapseTree(true);
// }

// function refreshMapControlBubble() {
//   mapControlBubble
//     .setOverlayTree(overlaysTreeBubble)
//     .collapseTree() // collapse the baselayers tree
//     // .expandSelected() // expand selected option in the baselayer
//     .collapseTree(true);
// }

// const layersMapBoundaries = new Map();

// function ccgBoundary(zoomToExtent = true) {
//   const ccgBoundary = L.geoJSON(geoDataCCGBoundary, {
//     style: styleCCG,
//     pane: "ccgBoundaryPane",
//   });

//   layersMapBoundaries.set("voyCCGMain", ccgBoundary);
//   ccgBoundary.addTo(mapMain.map);
//   const overlayCCGs = {
//     label: "CCG Boundaries",
//     selectAllCheckbox: true,
//     children: [
//       {
//         label: "Vale of York",
//         layer: ccgBoundary, //layersMapBoundaries.get("voyCCGMain"),
//       },
//     ],
//   };
//   overlaysTreeMain.children[2] = overlayCCGs;

//   /* copy the layer - returns an object only so wrap  in L.geojson
//     https://stackoverflow.com/questions/54385218/using-getbounds-on-geojson-feature
//     https://github.com/Leaflet/Leaflet/issues/6484
//     */

//   const ccgBoundaryCopy1 = L.geoJson(ccgBoundary.toGeoJSON(), {
//     style: styleCCG,
//     pane: "ccgBoundaryPane",
//   });

//   ccgBoundaryCopy1.addTo(mapSites.map);
//   const overlayCCGsSites = {
//     label: "CCG Boundaries",
//     selectAllCheckbox: true,
//     children: [
//       {
//         label: "Vale of York",
//         layer: ccgBoundaryCopy1,
//       },
//     ],
//   };
//   overlaysTreeSites.children[1] = overlayCCGsSites;

//   const ccgBoundaryCopy2 = L.geoJson(ccgBoundary.toGeoJSON(), {
//     style: styleCCG,
//     pane: "ccgBoundaryPane",
//   });

//   const overlayCCGsPopn = {
//     label: "CCG Boundaries",
//     selectAllCheckbox: true,
//     children: [
//       {
//         label: "Vale of York",
//         layer: ccgBoundaryCopy2,
//       },
//     ],
//   };
//   overlaysTreePopn.children[1] = overlayCCGsPopn;

//   const ccgBoundaryCopy3 = L.geoJson(ccgBoundary.toGeoJSON(), {
//     style: styleCCG,
//     pane: "ccgBoundaryPane",
//   });

//   const overlayCCGsIMD = {
//     label: "CCG Boundaries",
//     selectAllCheckbox: true,
//     children: [
//       {
//         label: "Vale of York",
//         layer: ccgBoundaryCopy3,
//       },
//     ],
//   };
//   overlaysTreeIMD.children[1] = overlayCCGsIMD;

//   const ccgBoundaryCopy4 = L.geoJson(ccgBoundary.toGeoJSON(), {
//     style: styleCCG,
//     pane: "ccgBoundaryPane",
//   });
//   const overlayCCGsD3 = {
//     label: "CCG Boundaries",
//     selectAllCheckbox: true,
//     children: [
//       {
//         label: "Vale of York",
//         layer: ccgBoundaryCopy4,
//       },
//     ],
//   };
//   overlaysTreeBubble.children[1] = overlayCCGsD3;

//   if (zoomToExtent) {
//     const arrMaps = [mapMain, mapSites, mapPopn, mapIMD, mapD3Bubble];

//     arrMaps.forEach(function (arrMap, index, myArray) {
//       // console.log(arrMap.map);
//       arrMap.map.fitBounds(ccgBoundary.getBounds());
//     });

//     // mapMain.map.fitBounds(ccgBoundary.getBounds());
//     // mapSites.map.fitBounds(ccgBoundaryCopy1.getBounds());
//     // mapPopn.map.fitBounds(ccgBoundaryCopy2.getBounds());
//     // mapIMD.map.fitBounds(ccgBoundaryCopy3.getBounds());
//     // mapD3Bubble.map.fitBounds(ccgBoundaryCopy4.getBounds());
//   }
// }

// const layersMapWards = new Map();

// function addWardGroupsToMap(zoomToExtent = false) {
//   const map = this.map;

//   const wardBoundaries = L.geoJson(geoDataCYCWards, {
//     style: styleWard,
//     pane: "wardBoundaryPane",
//     onEachFeature: function (feature, layer) {
//       const category = +feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc

//       if (!layersMapWards.has(category)) {
//         layersMapWards.set(category, L.layerGroup());
//       }
//       layersMapWards.get(category).addLayer(layer);
//     },
//   });

//   const ol = overlayWards(layersMapWards);
//   overlaysTreeMain.children[3] = ol;

//   if (zoomToExtent) {
//     map.fitBounds(wardBoundaries.getBounds());
//   }
// }

// function addPracticeToMap(zoomToExtent = false) {
//   const map = this.map;
//   const layersMapGpMain = new Map();

//   const practiceMain = L.geoJson(geoDataGP, {
//     // https://leafletjs.com/reference-1.7.1.html#geojson
//     pointToLayer: function (feature, latlng) {
//       return pcnFormatting(feature, latlng, { addBounce: true });
//     },
//     onEachFeature: function (feature, layer) {
//       // popup text applied here: mapMainPopupText.updatePopUpText()
//       layer.bindPopup("", { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css
//       layer.on("mouseover", function (e) {
//         this.openPopup();
//       });
//       layer.on("mouseout", function (e) {
//         this.closePopup();
//       });
//       layer.on("click", function (e) {
//         // console.log(e.sourceTarget.feature.properties.practice_code);
//         const selectedPractice = feature.properties.orgCode;
//         if (userSelections.selectedPractice !== selectedPractice) {
//           // update the Practice in userSelections
//           userSelections.selectedPractice = selectedPractice;
//           // update other charts
//           refreshChartsPostPracticeChange(selectedPractice);
//         }
//       });

//       const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
//       // Initialize the category array if not already set.
//       if (!layersMapGpMain.has(category)) {
//         layersMapGpMain.set(category, L.layerGroup());
//       }
//       layersMapGpMain.get(category).addLayer(layer);
//     },
//     filter: function (d) {
//       if (d.properties.type === "main") return true;
//     },
//   });
//   L.layerGroup(Array.from(layersMapGpMain.values())).addTo(map);

//   // Add to overlay control
//   const ol = overlayPCNs(layersMapGpMain); // function to align sites by pcn to overlay tree
//   overlaysTreeMain.children[0] = ol;

//   if (zoomToExtent) {
//     map.fitBounds(practiceMain.getBounds());
//   }

//   function updatePopUpText() {
//     practiceMain.eachLayer(function (layer) {
//       const period = userSelections.selectedDate,
//         practiceCode = layer.feature.properties.orgCode,
//         // clinicalDirector = layer.feature.properties.clinical_director,
//         pcnName = layer.feature.properties.pcn_name,
//         population = dataPopulationGPSummary.get(period).get(practiceCode);

//       let practiceName;
//       if (practiceLookup.has(practiceCode)) {
//         practiceName = titleCase(practiceLookup.get(practiceCode));
//       } else {
//         practiceName = "";
//       }

//       const popupText = `<h3>${pcnName}</h3>
//         <p>${practiceCode}: ${practiceName}
//         <br>Population: ${formatNumber(population)}</p>`;
//       // <br>Clinical Director: ${clinicalDirector}

//       layer.setPopupContent(popupText);
//     });
//   }

//   return {
//     layersMapGpMain: layersMapGpMain,
//     updatePopUpText: updatePopUpText,
//   };
// }

// const layersMapGPSites = new Map();
// const layersMapPopn = new Map();

// function gpSites(zoomToExtent = false) {
//   // This add the GP Sites layer in its entirety
//   // const map = this.map;
//   const sitesLayer = L.geoJson(geoDataGP, {
//     pointToLayer: pcnFormatting,
//     onEachFeature: function (feature, layer) {
//       const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. pcn
//       const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
//         <p>${layer.feature.properties.orgCode}: ${layer.feature.properties.orgName}
//         <br>Parent Org:${layer.feature.properties.parent}</p>`;

//       layer.bindPopup(popupText, { className: "popup-dark" });
//       layer.on("mouseover", function (e) {
//         this.openPopup();
//       });
//       layer.on("mouseout", function (e) {
//         this.closePopup();
//       });
//       layer.on("click", function (e) {
//         mapSites.map.setView(e.latlng, 11);
//         console.log(layer.feature.properties.orgCode);
//       });

//       // Initialize the category array if not already set.
//       if (!layersMapGPSites.has(category)) {
//         layersMapGPSites.set(category, L.layerGroup());
//       }
//       layersMapGPSites.get(category).addLayer(layer);
//     },
//   });

//   const popnLayer = L.geoJson(geoDataGP, {
//     pointToLayer: pcnFormatting,
//     onEachFeature: function (feature, layer) {
//       const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. pcn
//       const popupText = `<h3>${layer.feature.properties.pcn_name}</h3>
//         <p>${layer.feature.properties.orgCode}: ${layer.feature.properties.orgName}
//         <br>Parent Org:${layer.feature.properties.parent}</p>`;

//       layer.bindPopup(popupText);
//       layer.on("mouseover", function (e) {
//         this.openPopup();
//       });
//       layer.on("mouseout", function (e) {
//         this.closePopup();
//       });
//       layer.on("click", function (e) {
//         // update other charts
//         mapPopn.map.setView(e.latlng, 11);
//         console.log(layer.feature.properties.orgCode);
//       });

//       // Initialize the category array if not already set.
//       if (!layersMapPopn.has(category)) {
//         layersMapPopn.set(category, L.layerGroup());
//       }
//       layersMapPopn.get(category).addLayer(layer);
//     },
//   });

//   const gpSitesMap = L.layerGroup(Array.from(layersMapGPSites.values()));
//   gpSitesMap.addTo(mapSites.map);

//   const popnSitesMap = L.layerGroup(Array.from(layersMapPopn.values()));
//   popnSitesMap.addTo(mapPopn.map);

//   const ol = overlayPCNs(layersMapGPSites);
//   overlaysTreeSites.children[2] = ol;

//   const ol1 = overlayPCNs(layersMapPopn);
//   overlaysTreePopn.children[4] = ol1;

//   mapsWithGPSites.set(mapSites.map, gpSitesMap); // keep track of which maps include GP Sites
//   if (zoomToExtent) {
//     mapSites.map.fitBounds(gpSitesMap.getBounds());
//     // mapPopn.map.fitBounds(popnSitesMap.getBounds());
//   }
// }

// const layersMapByIMD = new Map();

// function lsoaBoundary(zoomToExtent = false) {
//   // This section adds the lsoa layer in its entirety along with labels (permanent Tooltip)
//   const lsoaLayer = L.geoJSON(geoDataLsoaBoundaries, {
//     // style: styleLsoa, // default colour scheme for lsoa boundaries
//     onEachFeature: function (feature, layer) {
//       // layer.bindPopup(`<h1>${feature.properties.lsoa}</h1>`);

//       let obj = dataIMD.find((x) => x.lsoa === layer.feature.properties.lsoa);
//       if (obj !== undefined) {
//         const category = obj.imdDecile;

//         // Initialize the category array if not already set.
//         if (!layersMapByIMD.has(category)) {
//           layersMapByIMD.set(category, L.layerGroup());
//         }
//         layersMapByIMD.get(category).addLayer(layer);
//       }
//     },
//   });

//   if (!mapsWithLSOAFiltered.has("voyCCGPopn")) {
//     mapsWithLSOAFiltered.set("voyCCGPopn", lsoaLayer);
//   }

//   // Add an overlay (checkbox entry) with the given name to the control
//   const ol = overlayLSOA(layersMapByIMD);
//   overlaysTreeIMD.children[2] = ol;

//   const lsoaLayerCopy1 = L.geoJson(lsoaLayer.toGeoJSON(), {
//     style: styleLsoa, // default colour scheme for lsoa boundaries
//     pane: "lsoaBoundaryPane",
//   });
//   const overlayLsoaD3Bubble = {
//     label: "LSOA Boundaries",
//     selectAllCheckbox: true,
//     children: [
//       {
//         label: "Vale of York",
//         layer: lsoaLayerCopy1,
//       },
//     ],
//   };
//   overlaysTreeBubble.children[0] = overlayLsoaD3Bubble;

//   return;
// }
