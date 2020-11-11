const mapPopn = {
  map: mapInitialise.mapInit("mapPopnLSOA"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

ccgBoundary.call(mapPopn, true);

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

Promise.all([geoDataCCGBoundary, geoDataCYCWards]).then(
  // geoDataPCN
  (values) => {
    const basemaps = {
      "Black and White": (function osm_bw() {
        return L.tileLayer(
          "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
          {
            minZoom: 0,
            maxZoom: 18,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        );
      })(),
      CartoDB: (function CartoDB_Voyager() {
        return L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            minZoom: 0,
            maxZoom: 19,
          }
        );
      })(),
      // http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
      "Stamen Toner": (function Stamen_Toner() {
        return L.tileLayer(
          "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}",
          {
            attribution:
              'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: "abcd",
            minZoom: 0,
            maxZoom: 20,
            ext: "png",
          }
        );
      })(),
      // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
      "No Background": (function emptyTile() {
        return L.tileLayer("", {
          zoom: 0,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
      })(),
    };

    basemaps.CartoDB.addTo(mapPopn.map);

    const baseTree = {
      label: "Base Layers <i class='fas fa-globe'></i>",
      children: [
        {
          label: "Colour <i class='fas fa-layer-group'></i>;",
          children: [{ label: "CartoDB", layer: basemaps.CartoDB }],
        },
        {
          label: "Black & White <i class='fas fa-layer-group'></i>",
          children: [
            { label: "Grey", layer: basemaps["Black and White"] },
            { label: "B&W", layer: basemaps["Stamen Toner"] },
          ],
        },
        { label: "None", layer: basemaps["No Background"] },
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
          layer: layersMapBoundaries.get("voyCCGPopn"),
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
    overlaysTree.children[2] = overlayWards;

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

    mapControl
      .addTo(mapPopn.map)
      // .setOverlayTree(overlaysTree)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true); // true to collapse the overlays tree
    // .expandSelected(true); // expand selected option in the overlays tree
  }
);
