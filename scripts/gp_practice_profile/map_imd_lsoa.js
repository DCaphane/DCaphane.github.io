function recolourIMDLayer(defaultIMD = "imdRank") {
  // const maxValue = d3.max(v, function (d) {
  //   return d[defaultIMD];
  // });

  /*
      rawValues are the values in the appropriate field
      These are ignored for the IMD indicators since they are hardcoded based on the number of LSOAs: 1 to 32,844
      However, for the population figures, these are used
      */
  const rawValues = dataIMD.map(function (d) {
    return d[defaultIMD];
  });
  // console.log(rawValues)

  const colour = mapIMDDomain.get(imdDomainDesc).scale(rawValues);

  imdLegend.legend({
    color: colour, //mapIMDDomain.get(imdDomainDesc).legendColour(rawValues),
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
        let obj = dataIMD.find((x) => x.lsoa === lsoaCode);
        if (obj !== undefined) {
          // console.log(obj[defaultIMD], maxValue);
          const value = obj[defaultIMD];

          layer.setStyle({
            // https://github.com/d3/d3-scale-chromatic
            fillColor: colour(value), //colourScheme(value / maxValue),
            fillOpacity: 0.6,
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
}

const mapIMDDomain = new Map();

/*
For colouring the heatmaps and legend

Scale is used to colour the maps.
legendColour is used to create the colour bar (ramp)

Some scales require the whole dataset (values) for the domain. This can be derived using eg. d3.range(m, n) which returns an array of m-n+1 values from m to n
Other scales only require the min and max values as an array. This can be derived using d3.extent (values) or d3.min and d3.max
*/
const noLSOAs = 32_844; // this is the number of lsoas nationally
const arrNoLSOAs = d3.range(1, noLSOAs + 1); // returns an array [1, 2, ..., noLSOAs]

const defaultIMDProperties = {
  datasetDesc: "datasetFieldName", // which field in the dataset to refer to
  scale(values) {
    // values not used here but are used in the population fields so need to pass the parameter
    return d3
      .scaleQuantize()
      .domain([1, noLSOAs])
      .range(d3.quantize(this.colourScheme, 10));
  },
  // legendColour(values) {
  //   // values not used here but are used in the population fields so need to pass the parameter
  //   return d3
  //     .scaleSequential()
  //     .domain([1, noLSOAs + 1])
  //     .interpolator(this.colourScheme);
  // },
  colourScheme: (t) => d3.interpolateReds(1 - t), // this reverses the interpolateReds colour scheme
  legendTitle: "IMD Subtitle",
  leftSubTitle: "Most Deprived",
  rightSubTitle: "Least Deprived",
  tickFormat: ",.0f", // thousands comma, no decimals
};

const defaultIMDPopnProperties = {
  datasetDesc: "datasetFieldName", // which field in the dataset to refer to
  scale(values) {
    // values not used here but are used in the population fields so need to pass the parameter
    return d3
      .scaleSequentialQuantile()
      .domain(values)
      .interpolator(this.colourScheme);
    // Alternative option example
    // return d3.scaleQuantize()
    // .domain(d3.extent(values))
    // .range(d3.quantize(this.colourScheme, 10));
  },
  // legendColour(values) {
  //   // values not used here but are used in the population fields so need to pass the parameter
  //   return d3
  //     .scaleSequentialQuantile()
  //     .domain((values))
  //     .interpolator(this.colourScheme);
  //   // Alternative option example
  //   // return d3.scaleQuantize()
  //   // .domain(d3.extent(values))
  //   // .range(d3.quantize(this.colourScheme, 10));
  // },
  colourScheme: d3.interpolateBlues,
  legendTitle: "Sub Population",
  leftSubTitle: "",
  rightSubTitle: "",
  tickFormat: ",.0f", // thousands comma, no decimals
};

const imdRankProperties = Object.create(defaultIMDProperties);
imdRankProperties.datasetDesc = "imdRank";
const incomeRankProperties = Object.create(defaultIMDProperties);
incomeRankProperties.datasetDesc = "incomeRank";
const employmentRankProperties = Object.create(defaultIMDProperties);
employmentRankProperties.datasetDesc = "employmentRank";
const educationRankProperties = Object.create(defaultIMDProperties);
educationRankProperties.datasetDesc = "educationRank";
const healthRankProperties = Object.create(defaultIMDProperties);
healthRankProperties.datasetDesc = "healthRank";
const crimeRankProperties = Object.create(defaultIMDProperties);
crimeRankProperties.datasetDesc = "crimeRank";
const housingRankProperties = Object.create(defaultIMDProperties);
housingRankProperties.datasetDesc = "housingRank";
const livingEnvironRankProperties = Object.create(defaultIMDProperties);
livingEnvironRankProperties.datasetDesc = "livingEnvironRank";
const incomeChildRankProperties = Object.create(defaultIMDProperties);
incomeChildRankProperties.datasetDesc = "incomeChildRank";
const incomeOlderRankProperties = Object.create(defaultIMDProperties);
incomeOlderRankProperties.datasetDesc = "incomeOlderRank";
const childRankProperties = Object.create(defaultIMDProperties);
childRankProperties.datasetDesc = "childRank";
const adultSkillsRankProperties = Object.create(defaultIMDProperties);
adultSkillsRankProperties.datasetDesc = "adultSkillsRank";
const geogRankProperties = Object.create(defaultIMDProperties);
geogRankProperties.datasetDesc = "geogRank";
const barriersRankProperties = Object.create(defaultIMDProperties);
barriersRankProperties.datasetDesc = "barriersRank";
const indoorsRankProperties = Object.create(defaultIMDProperties);
indoorsRankProperties.datasetDesc = "indoorsRank";
const outdoorsRankProperties = Object.create(defaultIMDProperties);
outdoorsRankProperties.datasetDesc = "outdoorsRank";
const totalPopnProperties = Object.create(defaultIMDPopnProperties);
totalPopnProperties.datasetDesc = "totalPopn";
const dependentChildrenProperties = Object.create(defaultIMDPopnProperties);
dependentChildrenProperties.datasetDesc = "dependentChildren";
const popnMiddleProperties = Object.create(defaultIMDPopnProperties);
popnMiddleProperties.datasetDesc = "popnMiddle";
const popnOlderProperties = Object.create(defaultIMDPopnProperties);
popnOlderProperties.datasetDesc = "popnOlder";
const popnWorkingProperties = Object.create(defaultIMDPopnProperties);
popnWorkingProperties.datasetDesc = "popnWorking";

mapIMDDomain.set("IMD Rank", imdRankProperties);
mapIMDDomain.set("IMD Decile", {
  datasetDesc: "imdDecile",
  scale() {
    const deciles = 10;
    return d3
      .scaleOrdinal()
      .domain(d3.range(1, deciles + 1))
      .range(this.colourScheme[deciles]);
  },
  legendColour() {
    const deciles = 10;
    return d3
      .scaleOrdinal()
      .domain(d3.range(1, deciles + 1))
      .range(this.colourScheme[deciles]);
  },
  colourScheme: d3.schemeSpectral,
  legendTitle: "IMD Decile",
  leftSubTitle: "Most Deprived",
  rightSubTitle: "Least Deprived",
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
