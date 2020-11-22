imdDomain("selIMD");

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

Promise.all([geoDataLsoaBoundaries, dataIMD]).then(() => {
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
});

function recolourIMDLayer(defaultIMD = "imdDecile") {
  // imdRank
  Promise.all([geoDataLsoaBoundaries, dataIMD]).then(() => {
    dataIMD.then(function (v) {
      const maxValue = d3.max(v, function (d) {
        return d[defaultIMD];
      }); // imdRank
      // console.log(maxValue);

      for (let key of layersMapIMD.keys()) {
        layersMapIMD.get(key).eachLayer(function (layer) {
          const lsoaCode = layer.feature.properties.lsoa;

          if (mapSelectedLSOA.has(lsoaCode)) { // the filter lsoaFunction populates a map object of lsoas (with relevant population)
            dataIMD.then(function (v) {
              let obj = v.find((x) => x.lsoa === lsoaCode);
              if (obj !== undefined) {
                // console.log(obj[defaultIMD], maxValue);
                const value = obj[defaultIMD];

                layer.setStyle({
                  // https://github.com/d3/d3-scale-chromatic
                  fillColor: d3.interpolateYlGnBu(1 - value / maxValue),
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
          } else { // if population is less than set amount, make it transparent
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
    .provider("Stamen.TonerHybrid")
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
            label: "ST Hybrid",
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

function imdDomain(id = "selIMD") {
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
  select.options.add(new Option("imdRank", 0, true, true));
  select.options.add(new Option("imdDecile", 1));
  select.options.add(new Option("incomeRank", 2));
  select.options.add(new Option("employmentRank", 3));
  select.options.add(new Option("educationRank", 4));
  select.options.add(new Option("healthRank", 5));
  select.options.add(new Option("crimeRank", 6));
  select.options.add(new Option("housingRank", 7));
  select.options.add(new Option("livingEnvironRank", 8));
  select.options.add(new Option("incomeChildRank", 9));
  select.options.add(new Option("incomeOlderRank", 10));
  select.options.add(new Option("childRank", 11));
  select.options.add(new Option("adultSkillsRank", 12));
  select.options.add(new Option("geogRank", 13));
  select.options.add(new Option("barriersRank", 14));
  select.options.add(new Option("indoorsRank", 15));
  select.options.add(new Option("outdoorsRank", 16));
  select.options.add(new Option("totalPopn", 17));
  select.options.add(new Option("dependentChildren", 18));
  select.options.add(new Option("popnMiddle", 19));
  select.options.add(new Option("popnOlder", 20));
  select.options.add(new Option("popnWorking", 21));

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    const domain = d3.select("#selImdDomain option:checked").text();
    console.log(domain);
    recolourIMDLayer(domain);
  });
}

const mapIMDDomain = new Map();
// mapIMDDomain.set("Proper Description", [datasetDesc, colourOrder]);
mapIMDDomain.set("Index_of_Multiple_Deprivation_IMD_Rank", ["imdRank", 1])
mapIMDDomain.set("Index_of_Multiple_Deprivation_IMD_Decile", ["imdDecile", 1])
mapIMDDomain.set("Income_Rank", ["incomeRank", 1])
mapIMDDomain.set("Employment_Rank", ["employmentRank", 1])
mapIMDDomain.set("Education_Skills_and_Training_Rank", ["educationRank", 1])
mapIMDDomain.set("Health_Deprivation_and_Disability_Rank", ["healthRank", 1])
mapIMDDomain.set("Crime_Rank", ["crimeRank", 1])
mapIMDDomain.set("Barriers_to_Housing_and_Services_Rank", ["housingRank", 1])
mapIMDDomain.set("Living_Environment_Rank", ["livingEnvironRank", 1])
mapIMDDomain.set("Income_Deprivation_Affecting_Children_Index_Rank", ["incomeChildRank", 1])
mapIMDDomain.set("Income_Deprivation_Affecting_Older_People_Rank", ["incomeOlderRank", 1])
mapIMDDomain.set("Children_and_Young_People_Subdomain_Rank", ["childRank", 1])
mapIMDDomain.set("Adult_Skills_Subdomain_Rank", ["adultSkillsRank", 1])
mapIMDDomain.set("Geographical_Barriers_Subdomain_Rank", ["geogRank", 1])
mapIMDDomain.set("Wider_Barriers_Subdomain_Rank", ["barriersRank", 1])
mapIMDDomain.set("Indoors_Subdomain_Rank", ["indoorsRank", 1])
mapIMDDomain.set("Outdoors_Subdomain_Rank", ["outdoorsRank", 1])
mapIMDDomain.set("Total_population_mid_2015", ["totalPopn", 1])
mapIMDDomain.set("Dependent_Children_aged_0_15_mid_2015", ["dependentChildren", 1])
mapIMDDomain.set("Population_aged_16_59_mid_2015", ["popnMiddle", 1])
mapIMDDomain.set("Older_population_aged_60_and_over_mid_2015", ["popnOlder", 1])
mapIMDDomain.set("Working_age_population_18_59_64", ["popnWorking", 1])
