const mapIMD = {
  map: mapInitialise.mapInit("mapIMDLSOA"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapIMD.scaleBar.addTo(mapIMD.map);

const sidebarIMD = mapIMD.sidebar("sidebar4");

homeButton.call(mapIMD);

// Panes to control zIndex of geoJson layers
mapIMD.map.createPane("lsoaBoundaryPane");
mapIMD.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapIMD.map.createPane("ccgBoundaryPane");
mapIMD.map.getPane("ccgBoundaryPane").style.zIndex = 374;

// Promise.all([geoDataLsoaBoundaries, dataIMD]).then(() => {
//   L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
//   ccgBoundary(true);
// });

function recolourIMDLayer(defaultIMD = "imdRank") {
  // imdRank
  Promise.all([geoDataLsoaBoundaries, dataIMD]).then(() => {
    dataIMD.then(function (v) {
      const maxValue = d3.max(v, function (d) {
        return d[defaultIMD];
      }); // imdRank
      // console.log(maxValue);

      refreshMapIMDLegend(maxValue);

      for (let key of layersMapIMD.keys()) {
        layersMapIMD.get(key).eachLayer(function (layer) {
          const lsoaCode = layer.feature.properties.lsoa;

          if (mapSelectedLSOA.has(lsoaCode)) {
            // the filter lsoaFunction populates a map object of lsoas (with relevant population)
            dataIMD.then(function (v) {
              let obj = v.find((x) => x.lsoa === lsoaCode);
              if (obj !== undefined) {
                // console.log(obj[defaultIMD], maxValue);
                const value = obj[defaultIMD];

                layer.setStyle({
                  // https://github.com/d3/d3-scale-chromatic
                  fillColor: d3.interpolateRdGy(value / maxValue),
                  fillOpacity: 0.9,
                  weight: 1, // border
                  color: "red", // border
                  opacity: 1,
                  dashArray: "3",
                });

                layer.bindPopup(
                  `<h3>${layer.feature.properties.lsoa}</h3>
              <p>IMD: ${formatNumber(value)}</p>
            `
                );
              }
            });
          } else {
            // if population is less than set amount, make it transparent
            layer.setStyle({
              // no (transparent) background
              fillColor: "#ff0000", // background
              fillOpacity: 0, // transparent
              weight: 0, // border
              color: "red", // border
              opacity: 0,
            });
          }
        });
      }
    });
  });
}

// Make global to enable subsequent change to overlay
const overlaysTreeIMD = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const baseTreeIMD = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stamen.TonerLite")
    .addTo(mapIMD.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  return {
    label: "Base Layers <i class='fas fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fas fa-layer-group'></i>;",
        children: [
          { label: "OSM", layer: L.tileLayer.provider("OpenStreetMap.Mapnik") },
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
            label: "ST Light",
            layer: defaultBasemap,
          },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

overlaysTreeIMD.children[0] = overlayTrusts();

const mapControlIMD = L.control.layers.tree(baseTreeIMD, overlaysTreeIMD, {
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

mapControlIMD
  .addTo(mapIMD.map)
  // .setOverlayTree(overlaysTreeIMD)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true); // true to collapse the overlays tree
// .expandSelected(true); // expand selected option in the overlays tree

const mapIMDDomain = new Map();
// mapIMDDomain.set("Proper Description", [datasetDesc, colourOrder]);
mapIMDDomain.set("IMD Rank", ["imdRank", 1]);
mapIMDDomain.set("IMD Decile", ["imdDecile", 1]);
mapIMDDomain.set("Income", ["incomeRank", 1]);
mapIMDDomain.set("Employment", ["employmentRank", 1]);
mapIMDDomain.set("Education Skills and Training", ["educationRank", 1]);
mapIMDDomain.set("Health Deprivation and Disability", ["healthRank", 1]);
mapIMDDomain.set("Crime", ["crimeRank", 1]);
mapIMDDomain.set("Barriers to Housing and Services", ["housingRank", 1]);
mapIMDDomain.set("Living Environment", ["livingEnvironRank", 1]);
mapIMDDomain.set("Income Deprivation Affecting Children Index", [
  "incomeChildRank",
  1,
]);
mapIMDDomain.set("Income Deprivation Affecting Older People", [
  "incomeOlderRank",
  1,
]);
mapIMDDomain.set("Children and Young People Subdomain", ["childRank", 1]);
mapIMDDomain.set("Adult Skills Subdomain", ["adultSkillsRank", 1]);
mapIMDDomain.set("Geographical Barriers Subdomain", ["geogRank", 1]);
mapIMDDomain.set("Wider Barriers Subdomain", ["barriersRank", 1]);
mapIMDDomain.set("Indoors Subdomain", ["indoorsRank", 1]);
mapIMDDomain.set("Outdoors Subdomain", ["outdoorsRank", 1]);
mapIMDDomain.set("Total population mid 2015", ["totalPopn", 1]);
mapIMDDomain.set("Dependent Children aged 0 15 mid 2015", [
  "dependentChildren",
  1,
]);
mapIMDDomain.set("Population aged 16 59 mid 2015", ["popnMiddle", 1]);
mapIMDDomain.set("Older population aged 60 and over mid 2015", [
  "popnOlder",
  1,
]);
mapIMDDomain.set("Working age population 18 59 64", ["popnWorking", 1]);

(function imdDomain(id = "selIMD") {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const div = document.getElementById(id);
  // Create the drop down to sort the chart
  const span = document.createElement("div");

  span.setAttribute("class", "search");
  span.textContent = "Domain: ";
  div.appendChild(span);

  // Add a drop down
  const frag = document.createDocumentFragment(),
    select = document.createElement("select");

  select.setAttribute("class", "dropdown-input");
  select.setAttribute("id", "selImdDomain");

  // Option constructor: args text, value, defaultSelected, selected
  let counter = 0;
  for (let key of mapIMDDomain.keys()) {
    if (counter !== 0) {
      select.options.add(new Option(key, counter));
    } else {
      select.options.add(new Option(key, 0, true, true));
    }
    counter++;
  }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    const domainDesc = d3.select("#selImdDomain option:checked").text();
    const domain = mapIMDDomain.get(domainDesc)[0];
    console.log(domain);
    recolourIMDLayer(domain);
  });
})();
