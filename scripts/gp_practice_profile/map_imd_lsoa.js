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

function recolourIMDLayer(defaultIMD = "imdRank") {
  Promise.all([geoDataLsoaBoundaries, dataIMD]).then(() => {
    dataIMD.then(function (v) {
      const maxValue = d3.max(v, function (d) {
        return d[defaultIMD];
      });

      const rawValues = v.map(function (d) {
        return d[defaultIMD];
      });
      // console.log(rawValues)

      // const colourScheme =
      //   imdDomainDesc !== undefined
      //     ? mapIMDDomain.get(imdDomainDesc).colourScheme
      //     : mapIMDDomain.get("IMD Rank").colourScheme;

      const colour = mapIMDDomain.get(imdDomainDesc).scale(rawValues);

      // refreshMapIMDLegend(maxValue, colourScheme);
      imdLegend.legend({
        color: mapIMDDomain.get(imdDomainDesc).legendColour(maxValue),
        title: mapIMDDomain.get(imdDomainDesc).legendTitle,
        leftSubTitle: mapIMDDomain.get(imdDomainDesc).leftSubTitle,
        rightSubTitle: mapIMDDomain.get(imdDomainDesc).rightSubTitle,
        tickFormat: mapIMDDomain.get(imdDomainDesc).tickFormat,
        width: 600,
        marginLeft: 50,
      });

      for (let key of layersMapIMD.keys()) {
        layersMapIMD.get(key).eachLayer(function (layer) {
          const lsoaCode = layer.feature.properties.lsoa;

          if (mapSelectedLSOA.has(lsoaCode)) {
            // the filter lsoaFunction populates a map object of lsoas (with relevant population)
            // dataIMD.then(function (v) {
            let obj = v.find((x) => x.lsoa === lsoaCode);
            if (obj !== undefined) {
              // console.log(obj[defaultIMD], maxValue);
              const value = obj[defaultIMD];

              layer.setStyle({
                // https://github.com/d3/d3-scale-chromatic
                fillColor: colour(value), //colourScheme(value / maxValue),
                fillOpacity: 0.9,
                weight: 1, // border
                color: "white", // border
                opacity: 1,
                // dashArray: "3",
              });

              layer.bindPopup(
                `<h3>${layer.feature.properties.lsoa}</h3>
              <p>IMD: ${formatNumber(value)}</p>
            `
              );
            }
            // });
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
    .provider("Stadia.AlidadeSmooth")
    .addTo(mapIMD.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

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
          { label: "Bright", layer: L.tileLayer.provider("Stadia.OSMBright") },
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
          { label: "Grey", layer: defaultBasemap },
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

const defaultProperties = {
  datasetDesc: "dummy description",
  scale(values) {
    return d3
      .scaleSequentialQuantile()
      .domain(values)
      .interpolator(this.colourScheme);
  },
  legendColour(maxValue) {
    return d3.scaleSequential([0, maxValue], this.colourScheme);
  },
  colourScheme: colourScaleRedReverse,
  legendTitle: "IMD Subtitle",
};

const imdRankProperties = Object.create(defaultProperties);
imdRankProperties.datasetDesc = "imdRank";
imdRankProperties.legendColour = function (maxValue) {
  return d3.scaleSequentialQuantile(d3.range(maxValue), this.colourScheme);
};
imdRankProperties.tickFormat = ",.0f";
// This works but re-written entire object so no value?
/*
const imdDecileProperties = Object.create(defaultProperties);
imdDecileProperties.datasetDesc = "imdDecile"
imdDecileProperties.scale = function(v) {
  const max = d3.max(v);
  return d3
    .scaleOrdinal(this.colourScheme)
    .domain(d3.range(1, max + 1))
    .range(this.colourScheme[max]);
}
imdDecileProperties.legendColour = function(maxValue) {
  return d3.scaleOrdinal(
    d3.range(1, maxValue + 1),
    this.colourScheme[maxValue]
  );
}
imdDecileProperties.colourScheme = d3.schemeSpectral
*/

const incomeRankProperties = Object.create(defaultProperties);
incomeRankProperties.datasetDesc = "imdRank";
const employmentRankProperties = Object.create(defaultProperties);
employmentRankProperties.datasetDesc = "employmentRank";
const educationRankProperties = Object.create(defaultProperties);
educationRankProperties.datasetDesc = "educationRank";
const healthRankProperties = Object.create(defaultProperties);
healthRankProperties.datasetDesc = "healthRank";
const crimeRankProperties = Object.create(defaultProperties);
crimeRankProperties.datasetDesc = "crimeRank";
const housingRankProperties = Object.create(defaultProperties);
housingRankProperties.datasetDesc = "housingRank";
const livingEnvironRankProperties = Object.create(defaultProperties);
livingEnvironRankProperties.datasetDesc = "livingEnvironRank";
const incomeChildRankProperties = Object.create(defaultProperties);
incomeChildRankProperties.datasetDesc = "incomeChildRank";
const incomeOlderRankProperties = Object.create(defaultProperties);
incomeOlderRankProperties.datasetDesc = "incomeOlderRank";
const childRankProperties = Object.create(defaultProperties);
childRankProperties.datasetDesc = "childRank";
const adultSkillsRankProperties = Object.create(defaultProperties);
adultSkillsRankProperties.datasetDesc = "adultSkillsRank";
const geogRankProperties = Object.create(defaultProperties);
geogRankProperties.datasetDesc = "geogRank";
const barriersRankProperties = Object.create(defaultProperties);
barriersRankProperties.datasetDesc = "barriersRank";
const indoorsRankProperties = Object.create(defaultProperties);
indoorsRankProperties.datasetDesc = "indoorsRank";
const outdoorsRankProperties = Object.create(defaultProperties);
outdoorsRankProperties.datasetDesc = "outdoorsRank";
const totalPopnProperties = Object.create(defaultProperties);
totalPopnProperties.datasetDesc = "totalPopn";
totalPopnProperties.colourScheme = d3.interpolateYlGnBu;
const dependentChildrenProperties = Object.create(defaultProperties);
dependentChildrenProperties.datasetDesc = "dependentChildren";
dependentChildrenProperties.colourScheme = d3.interpolateYlGnBu;
const popnMiddleProperties = Object.create(defaultProperties);
popnMiddleProperties.datasetDesc = "popnMiddle";
popnMiddleProperties.colourScheme = d3.interpolateYlGnBu;
const popnOlderProperties = Object.create(defaultProperties);
popnOlderProperties.datasetDesc = "popnOlder";
popnOlderProperties.colourScheme = d3.interpolateYlGnBu;
const popnWorkingProperties = Object.create(defaultProperties);
popnWorkingProperties.datasetDesc = "popnWorking";
popnWorkingProperties.colourScheme = d3.interpolateYlGnBu;

mapIMDDomain.set("IMD Rank", imdRankProperties);
mapIMDDomain.set("IMD Decile", {
  datasetDesc: "imdDecile",
  scale(v) {
    const max = d3.max(v);
    return d3
      .scaleOrdinal(this.colourScheme)
      .domain(d3.range(1, max + 1))
      .range(this.colourScheme[max]);
    // .interpolator(this.colourScheme);
  },
  legendColour(maxValue) {
    return d3.scaleOrdinal(
      d3.range(1, maxValue + 1),
      this.colourScheme[maxValue]
    );
  },
  colourScheme: d3.schemeSpectral,
});
mapIMDDomain.set("Income", incomeRankProperties);
mapIMDDomain.set("Employment", employmentRankProperties);
mapIMDDomain.set("Education Skills and Training", educationRankProperties);
mapIMDDomain.set("Health Deprivation and Disability", healthRankProperties);
mapIMDDomain.set("Crime", crimeRankProperties);
mapIMDDomain.set("Barriers to Housing and Services", housingRankProperties);
mapIMDDomain.set("Living Environment", livingEnvironRankProperties);
mapIMDDomain.set(
  "Income Deprivation Affecting Children Index",
  incomeChildRankProperties
);
mapIMDDomain.set(
  "Income Deprivation Affecting Older People",
  incomeOlderRankProperties
);
mapIMDDomain.set("Children and Young People Subdomain", childRankProperties);
mapIMDDomain.set("Adult Skills Subdomain", adultSkillsRankProperties);
mapIMDDomain.set("Geographical Barriers Subdomain", geogRankProperties);
mapIMDDomain.set("Wider Barriers Subdomain", barriersRankProperties);
mapIMDDomain.set("Indoors Subdomain", indoorsRankProperties);
mapIMDDomain.set("Outdoors Subdomain", outdoorsRankProperties);
mapIMDDomain.set("Total population mid 2015", totalPopnProperties);
mapIMDDomain.set(
  "Dependent Children aged 0 15 mid 2015",
  dependentChildrenProperties
);
mapIMDDomain.set("Population aged 16 59 mid 2015", popnMiddleProperties);
mapIMDDomain.set(
  "Older population aged 60 and over mid 2015",
  popnOlderProperties
);
mapIMDDomain.set("Working age population 18 59 64", popnWorkingProperties);

// default values
let imdDomainDesc = "IMD Rank",
  imdDomainShort = "imdRank";

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
    imdDomainDesc = d3.select("#selImdDomain option:checked").text();
    imdDomainShort = mapIMDDomain.get(imdDomainDesc).datasetDesc;
    console.log(imdDomainShort);
    recolourIMDLayer(imdDomainShort);
  });
})();
