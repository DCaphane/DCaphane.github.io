// const baseMapPCNSite = Object.assign({}, Basemaps);

const mapPCNSite = {
  map: mapInitialise.mapInit("mapPCNSite"),
  // layerControlTree: mapInitialise.layerControlTree(),
  // layerControl: mapInitialise.layerControl(basemapPCNSite),
  // subLayerControl: mapInitialise.subLayerControl(),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

// mapPCNSite.map.addControl(mapPCNSite.layerControl);

// Ward boundaries and ward groupings
// mapPCNSite.map.addControl(mapPCNSite.subLayerControl);

mapPCNSite.scaleBar.addTo(mapPCNSite.map);

const sidebarSites = mapPCNSite.sidebar("sidebarPCNSites");

homeButton.call(mapPCNSite);
// yorkTrust.call(mapPCNSite);

// Panes to control zIndex of geoJson layers
mapPCNSite.map.createPane("wardBoundaryPane");
mapPCNSite.map.getPane("wardBoundaryPane").style.zIndex = 375;

mapPCNSite.map.createPane("ccgBoundaryPane");
mapPCNSite.map.getPane("ccgBoundaryPane").style.zIndex = 374;

// ccg boundary
// ccgBoundary.call(mapPCNSite, true);
// addWardGroupsToMap.call(mapPCNSite);

pcnSites2.call(mapPCNSite);

function pcnSites2(zoomToExtent = false) {
  const map = this.map;
  geoDataPCNSites.then(function (v) {
    defaultSites = L.geoJson(v, {
      pointToLayer: pcnFormatting,
      // onEachFeature: function (feature, layer) {
      //   //console.log(layer.feature.properties.pcn_name)
      //   subCategories[layer.feature.properties.pcn_name] = null;
      // },
    });

    defaultSites.addTo(map);
    // mapWithSites.set(map, sitesLayer);
    if (zoomToExtent) {
      map.fitBounds(defaultSites.getBounds());
    }
  });
}

// getGeoData("Data/geo/pcn/primary_care_network_sites.geojson").then(function (
//   data
// ) {
//   siteData = data;
//   defaultSites = L.geoJson(data, {
//     pointToLayer: pcnFormatting,
//     onEachFeature: function (feature, layer) {
//       //console.log(layer.feature.properties.pcn_name)
//       subCategories[layer.feature.properties.pcn_name] = null;
//     },
//   }).addTo(mapPCNSite.map);
//   mapPCNSite.map.fitBounds(defaultSites.getBounds());
// });

Promise.all([geoDataPCN, geoDataCCGBoundary, geoDataCYCWards]).then(
  (values) => {
    const defaultBasemap = L.tileLayer
      .provider("OpenStreetMap.Mapnik")
      .addTo(mapPCNSite.map);

    // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
    const emptyBackground = (function emptyTile() {
      return L.tileLayer("", {
        zoom: 0,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
    })();

    const baseTree = {
      label: "Base Layers <i class='fas fa-globe'></i>",
      children: [
        {
          label: "Colour <i class='fas fa-layer-group'></i>;",
          children: [
            { label: "OSM", layer: defaultBasemap },
            {
              label: "CartoDB",
              layer: L.tileLayer.provider("CartoDB.Voyager"),
            },
            {
              label: "Water Colour",
              layer: L.tileLayer.provider("Stamen.Watercolor"),
            },
          ],
        },
        {
          label: "Black & White <i class='fas fa-layer-group'></i>",
          children: [
            { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron") },
            { label: "B&W", layer: L.tileLayer.provider("Stamen.Toner") },
            {
              label: "ST Hybrid",
              layer: L.tileLayer.provider("Stamen.TonerHybrid"),
            },
          ],
        },
        { label: "None", layer: emptyBackground },
      ],
    };

    const overlaysTree = {
      label: "Overlays",
      selectAllCheckbox: true,
      children: [],
    };

    const overlayTrusts = {
      label: "Hospital Sites <i class='fas fa-hospital-symbol'></i>",
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
          layer: trustMarker(
            trustSitesLoc.scarboroughTrust,
            "Scarborough Trust"
          ),
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

    const overlayCCGs = {
      label: "CCG Boundaries",
      selectAllCheckbox: true,
      children: [
        {
          label: "Vale of York",
          layer: layersMapBoundaries.get("voyCCGSite"),
        },
      ],
    };

    const overlayWards = {
      label: "Ward Boundaries",
      selectAllCheckbox: true,
      children: [
        {
          label: "CYC",
          selectAllCheckbox: true,
          children: [
            {
              label: "Ward Group: 1",
              layer: layersMapWards.get(1),
            },
            {
              label: "Ward Group: 2",
              layer: layersMapWards.get(2),
            },
            {
              label: "Ward Group: 3",
              layer: layersMapWards.get(3),
            },
            {
              label: "Ward Group: 4",
              layer: layersMapWards.get(4),
            },
            {
              label: "Ward Group: 5",
              layer: layersMapWards.get(5),
            },
            {
              label: "Ward Group: 6",
              layer: layersMapWards.get(6),
            },
          ],
        },
      ],
    };

    overlaysTree.children[0] = overlayTrusts;
    overlaysTree.children[1] = overlayCCGs;
    // overlaysTree.children[3] = overlayWards;

    const mapControl = L.control.layers.tree(baseTree, overlaysTree, {
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
    // .addTo(mapPCNSite.map);

    mapControl
      .addTo(mapPCNSite.map)
      // .setOverlayTree(overlaysTree)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true); // true to collapse the overlays tree
    // .expandSelected(true); // expand selected option in the overlays tree
  }
);
