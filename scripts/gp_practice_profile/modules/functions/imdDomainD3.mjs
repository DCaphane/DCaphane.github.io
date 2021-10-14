import {
  newTooltip,
  geoDataLsoaPopnCentroid,
  dataRates,
  dataRatesMax,
  dataRatesKeys,
  dataPopulationGPLsoa,
  actualPopulation,
  minPopulationLSOA,
  maxPopulation,
  legendWrapper,
  genID,
  dataIMD,
  formatNumber,
  userSelections,
} from "../../aggregateModules.mjs";
const mapIMDDomain = new Map();

let imdDomainDescD3 = "Population",
  imdDomainShortD3 = "Population";

/*
For colouring the choropleth map and legend

Scale is used to colour the maps.
legendColour is used to create the colour bar (ramp)

Some scales require the whole dataset (values) for the domain. This can be derived using eg. d3.range(m, n) which returns an array of m-n+1 values from m to n
Other scales only require the min and max values as an array. This can be derived using d3.extent (values) or d3.min and d3.max
*/
const noLSOAs = 32_844, // this is the number of lsoas nationally
  arrNoLSOAs = d3.range(1, noLSOAs + 1); // returns an array [1, 2, ..., noLSOAs]

// let lsoaCentroidLegend // = legendWrapper("footerMapD3Leaf", genID.uid("lsoa"));

const defaultIMDProperties = {
  datasetDesc: "datasetFieldName", // which field in the dataset to refer to
  scale(values) {
    // values not used here but is subsequently used in the population fields so need to pass the parameter here
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

const defaultRatesProperties = {
  datasetDesc: "ratesDataFieldName", // which field in the dataset to refer to
  scale() {
    return (
      d3
        .scaleOrdinal()
        // .domain(["lower", "nosig", "higher"])
        .domain([-1, 0, 1])
        .range(["green", "grey", "red"])
    );
  },
  legendColour() {
    return (
      d3
        .scaleOrdinal()
        // .domain(["lower", "nosig", "higher"])
        .domain([-1, 0, 1])
        .range(["green", "grey", "red"])
    );
  },
  // colourScheme: d3.schemeSpectral,
  legendTitle: "Rates Demo",
  leftSubTitle: "lower",
  rightSubTitle: "higher",
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

const ae_01RatesProperties = Object.create(defaultRatesProperties);
ae_01RatesProperties.datasetDesc = "AE_01";
const selbyUTCRatesProperties = Object.create(defaultRatesProperties);
selbyUTCRatesProperties.datasetDesc = "selbyUTC";
const testNewRatesProperties = Object.create(defaultRatesProperties);
testNewRatesProperties.datasetDesc = "testNew";

// const mapRatesDomain = new Map();

// These would be hard coded to provide a lookup from the data key to the description
const dataRatesLookup = new Map();
dataRatesLookup.set("A&E Demo", ae_01RatesProperties);
dataRatesLookup.set("Selby UTC", selbyUTCRatesProperties);
dataRatesLookup.set("Long Description testNew", testNewRatesProperties);

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

export function imdDomainD3({ id, thisMap } = {}) {
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
  select.setAttribute("id", "selImdDomainD3");

  // Option constructor: args text, value, defaultSelected, selected
  select.options.add(new Option("Population", 0, true, true));
  let counter = 1; // start at 1 and append population as 0 option
  for (let key of mapIMDDomain.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }
  for (let key of dataRatesLookup.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    imdDomainDescD3 = d3.select("#selImdDomainD3 option:checked").text();
    if (imdDomainDescD3 === "Population") {
      imdDomainShortD3 = "Population";
    } else if (dataRatesLookup.has(imdDomainDescD3)) {
      imdDomainShortD3 = dataRatesLookup.get(imdDomainDescD3).datasetDesc;
    } else {
      imdDomainShortD3 = mapIMDDomain.get(imdDomainDescD3).datasetDesc;
    }
    console.log({ imdDomain: imdDomainDescD3 });
    // refreshBubbleChart()
    updateD3BubbleLsoa();
    // updateBubbleColour(imdDomainShortD3);
  });

  // Define the div for the tooltip
  const tooltipD3Lsoa = newTooltip.tooltip(div);
  tooltipD3Lsoa.style("height", "75px").style("width", "180px");

  // add SVG to Leaflet map via Leaflet
  const svgLayer = L.svg();
  svgLayer.addTo(thisMap);

  const svg = d3.select("#mapIMDD3").select("svg"),
    g = svg.select("g").attr("class", "bubble-group");

  // svg for bubble legend
  const bubbleLegend = d3
    .select("#footerMapD3Leaf")
    .append("svg")
    .attr("width", "100")
    .attr("height", "50")
    .attr("viewBox", [0, 0, 100, 50])
    // .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("class", "bubble-legend");

  // Project any point to map's current state
  // function projectPoint(x, y) {
  //   const point = thisMap.latLngToLayerPoint(new L.LatLng(y, x));
  //   this.stream.point(point.x, point.y);
  // }

  // const transform = d3.geoTransform({ point: projectPoint }),
  //   path = d3.geoPath().projection(transform);

  let d3BubbleEnter;
  const lsoaCentroidLegend = legendWrapper(
    "footerMapD3Leaf",
    genID.uid("lsoa")
  );

  function updateBubbleColour(defaultIMD = "Population") {
    if (defaultIMD === "Population") {
      // Style and legend for population
      const maxValue = maxPopulation();

      lsoaCentroidLegend.legend({
        color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
        title: "Population",
        width: 600,
        marginLeft: 50,
      });

      d3BubbleEnter.style("fill", function (d) {
        return d3.interpolateYlGnBu(d.lsoaPopulation / maxValue);
      });
    } else if (dataRatesMax.has(defaultIMD)) {
      // convert short description back to long
      const shortDesc = dataRatesKeys.get(defaultIMD);

      const colour = defaultRatesProperties.legendColour();

      lsoaCentroidLegend.legend({
        color: colour,
        title: dataRatesLookup.get(shortDesc).legendTitle,
        leftSubTitle: dataRatesLookup.get(shortDesc).leftSubTitle,
        rightSubTitle: dataRatesLookup.get(shortDesc).rightSubTitle,
        tickFormat: dataRatesLookup.get(shortDesc).tickFormat,
        width: 600,
        marginLeft: 50,
      });

      // The colour is determined by the overall significance  - not at individual practice level
      // if (userSelections.selectedPractice === "All Practices") {
      d3BubbleEnter.style("fill", function (d) {
        if (dataRates.get(defaultIMD).get("All").has(d.lsoa)) {
          let sig = dataRates.get(defaultIMD).get("All").get(d.lsoa)[0].signf;
          return colour(sig);
        } else {
          return "transparent";
        }
      });
    } else {
      // for IMD
      // an array of the individual values
      const rawValues = dataIMD.map(function (d) {
        return d[defaultIMD];
      });
      // console.log(rawValues)

      const colour = mapIMDDomain.get(imdDomainDescD3).scale(rawValues);

      lsoaCentroidLegend.legend({
        color: colour, //mapIMDDomain.get(imdDomainDescD3).legendColour(rawValues),
        title: mapIMDDomain.get(imdDomainDescD3).legendTitle,
        leftSubTitle: mapIMDDomain.get(imdDomainDescD3).leftSubTitle,
        rightSubTitle: mapIMDDomain.get(imdDomainDescD3).rightSubTitle,
        tickFormat: mapIMDDomain.get(imdDomainDescD3).tickFormat,
        width: 600,
        marginLeft: 50,
      });

      d3BubbleEnter.style("fill", function (d) {
        let obj = dataIMD.find((x) => x.lsoa === d.lsoa);
        if (obj !== undefined) {
          // console.log(obj[defaultIMD], maxValue);
          const value = obj[defaultIMD];
          return colour(value);
        } else {
          return null;
        }
      });
    }
  }

  const lsoaCentroidDetails = [];

  // v is the full dataset
  // console.log(v);

  /* From the LSOA polygon, populate an array of objects showing:
       lsoa name, polygon center, default to 0 population as will subsequently be derived
      Can derive the geometric centre using geoDataLsoaBoundaries and .getCenter()
      Population centroid figures are published
       */
  L.geoJson(geoDataLsoaPopnCentroid, {
    onEachFeature: function (feature, layer) {
      let obj = {};
      obj.lsoa = layer.feature.properties.lsoa11cd; // lsoa code
      // obj.lsoaCentre = layer.getBounds().getCenter(); // geometric centre of the layer polygon (lsoa)
      const coordsLngLat = layer.feature.geometry.coordinates;
      obj.lsoaCentre = [coordsLngLat[1], coordsLngLat[0]]; // reverse order of LngLat to LatLng
      obj.lsoaPopulation = 0;
      lsoaCentroidDetails.push(obj);
    },
  });

  // Initialise D3 Circle Map
  updateD3BubbleLsoa();

  function updateD3BubbleLsoa() {
    /*
      Update the population details or counts when using rates based data sets
      For the rates based data, the circle size uses the volume of activity rather than the population
      Colour will be used to show whether the rate is statistically significant eg. lower / higher rate
      */
    if (dataRatesMax.has(imdDomainShortD3)) {
      lsoaCentroidDetails.forEach((lsoa) => {
        let value = 0;
        if (userSelections.selectedPractice === "All Practices") {
          if (dataRates.get(imdDomainShortD3).get("All").has(lsoa.lsoa)) {
            value = dataRates
              .get(imdDomainShortD3)
              .get("All")
              .get(lsoa.lsoa)[0].activityU;
          } else {
            value = 0;
          }
        } else if (
          dataRates.get(imdDomainShortD3).has(userSelections.selectedPractice)
        ) {
          if (
            dataRates
              .get(imdDomainShortD3)
              .get(userSelections.selectedPractice)
              .has(lsoa.lsoa)
          ) {
            value = dataRates
              .get(imdDomainShortD3)
              .get(userSelections.selectedPractice)
              .get(lsoa.lsoa)[0].activityU;
          } else {
            value = 0;
          }
        } else {
          value = 0;
        }

        // For rates data, lsoaPopulation is actually the volume of eg. attendances
        lsoa.lsoaPopulation = value;
      });
    } else {
      lsoaCentroidDetails.forEach((lsoa) => {
        let value = actualPopulation(lsoa.lsoa);

        if (value === undefined) {
          value = 0;
        }
        lsoa.lsoaPopulation = value;
      });
    }

    const maxValue = d3.max(lsoaCentroidDetails, function (d) {
      return d.lsoaPopulation;
    });
    // , maxValueNice = Math.ceil(maxValue / 100) * 100; //  round to the nearest 100

    const radius = d3
      .scaleSqrt()
      .domain([0, maxValue]) // 1e4 or 10,000
      .range([0, 20]);

    const d3BubbleSelection = g.selectAll("circle").data(
      lsoaCentroidDetails
        .filter((popn) => popn.lsoaPopulation > minPopulationLSOA)
        .sort(
          // sort the bubbles so smaller populations appear above larger population
          function (a, b) {
            return b.lsoaPopulation - a.lsoaPopulation;
          },
          function (d) {
            return d.lsoa;
          }
        )
    );

    d3BubbleEnter = d3BubbleSelection
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("circle").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .on("click", function (event, d) {
        console.log(d);
      })
      .on("mouseover", function (event, d) {
        const sel = d3.select(this);
        sel.classed("hover", true);
        sel.raise();
        sel.style("fill-opacity", 1);
        const pos = this.getBoundingClientRect();
        // console.log(d)

        let str,
          subString = "";

        if (imdDomainDescD3 === "Population") {
          str = `LSOA: <strong>${
            d.lsoa
          }</strong><br>Pop'n: <span style="color:red">${formatNumber(
            d.lsoaPopulation
          )}</span>`;
        } else if (dataRatesMax.has(imdDomainShortD3)) {
          let value,
            latestPopn,
            stdRate = 0,
            crudeRate = 0;

          if (userSelections.selectedPractice === "All Practices") {
            latestPopn = dataPopulationGPLsoa
              .get(userSelections.nearestQuarter)
              .get("All")
              .get(d.lsoa);

            if (dataRates.get(imdDomainShortD3).get("All").has(d.lsoa)) {
              value = dataRates
                .get(imdDomainShortD3)
                .get("All")
                .get(d.lsoa)[0].activityU;
              stdRate = dataRates
                .get(imdDomainShortD3)
                .get("All")
                .get(d.lsoa)[0].rate;
            } else {
              value = 0;
            }
          } else {
            latestPopn = dataPopulationGPLsoa
              .get(userSelections.nearestQuarter)
              .get(userSelections.selectedPractice)
              .get(d.lsoa);

            if (
              dataRates
                .get(imdDomainShortD3)
                .has(userSelections.selectedPractice)
            ) {
              if (
                dataRates
                  .get(imdDomainShortD3)
                  .get(userSelections.selectedPractice)
                  .has(d.lsoa)
              ) {
                value = dataRates
                  .get(imdDomainShortD3)
                  .get(userSelections.selectedPractice)
                  .get(d.lsoa)[0].activityU;
              } else {
                value = 0;
              }
            } else {
              value = 0;
            }
          }

          crudeRate = (value / latestPopn) * 1000;

          str = `LSOA: <strong>${
            d.lsoa
          }</strong><br>Pop'n: <span style="color:red">${formatNumber(
            latestPopn
          )}</span>`;

          subString = `<br><strong>Attendances:
            </strong><span style="color:red">${formatNumber(value)}</span>`;

          if (userSelections.selectedPractice === "All Practices") {
            subString += `<br><strong>std Rate:
            </strong><span style="color:red">${formatNumber(stdRate)}</span>`;
          } else {
            subString += `<br><strong>std Rate:
              </strong><span style="color:red">n/a</span>`;
          }

          subString += `<br><strong>Crude Rate:
            </strong><span style="color:red">${formatNumber(crudeRate)}</span>`;
        } else {
          str = `LSOA: <strong>${
            d.lsoa
          }</strong><br>Pop'n: <span style="color:red">${formatNumber(
            d.lsoaPopulation
          )}</span>`;

          let obj = dataIMD.find((x) => x.lsoa === d.lsoa);

          if (obj !== undefined) {
            const value = obj[imdDomainShortD3];

            subString = `<br><strong>${imdDomainDescD3}:
            </strong><span style="color:red">${formatNumber(value)}</span>`;
          } else {
            return "";
          }
        }
        //  // Option to return IMD Rank as a default option instead of "" above
        // else {
        //   let obj = dataIMD.find((x) => x.lsoa === d.lsoa);

        //   if (obj !== undefined) {
        //     const value = obj.imdRank;

        //     subString = `<br><strong>IMD Rank:
        //   </strong><span style="color:red">${formatNumber(value)}</span>`;
        //   } else {
        //     return "";
        //   }
        // }

        newTooltip.counter++;
        newTooltip.mouseover(tooltipD3Lsoa, str + subString, event, pos);
      })
      .on("mouseout", function (event, d) {
        const sel = d3.select(this);
        sel.classed("hover", false);
        sel.lower();
        sel.style("fill-opacity", 0.8);
        newTooltip.mouseout(tooltipD3Lsoa);
      })
      .attr("class", "bubble")
      .attr("r", function (d) {
        if (d.lsoaPopulation > 0) {
          return radius(d.lsoaPopulation);
        } else {
          return 0;
        }
      })
      // .style("fill", function (d) {
      //   return d3.interpolateYlGnBu(d.lsoaPopulation / maxValue);
      // })
      .style("fill-opacity", function (d) {
        const lsoaCode = d.lsoa;

        let value = actualPopulation(lsoaCode);

        if (value > minPopulationLSOA) {
          return 0.8;
        } else {
          // console.log({ testing: lsoaCode });
          return 0.1;
        }
      })
      .style("pointer-events", "all");

    updateBubblePosition(); // Needed otherwise only updates after change in eg. zoom
    updateBubbleColour(imdDomainShortD3); // ensures colour matches dropdown

    const legendData = [maxValue / 10, maxValue / 2, maxValue];
    const d3BubbleLegend = bubbleLegend
      .selectAll(".bubble-legend")
      .data(legendData)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("circle").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "bubble-legend")
      .attr("transform", "translate(50,50)") // this is bubbleLegend svg width / 2, and move to bottom
      .attr("cy", function (d) {
        return -radius(d);
      })
      .attr("r", radius);

    const d3BubbleLegendText = bubbleLegend
      .selectAll(".bubble-legend-text")
      .data(legendData)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) =>
          enter
            .append("text")
            .attr("class", "bubble-legend-text")
            .call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("transform", "translate(50,50)") // this is bubbleLegend svg width / 2, and move to bottom
      .attr("y", function (d) {
        return -2 * radius(d);
      })
      .attr("dx", "5em")
      .attr("dy", "1em")
      .text(function (d) {
        if (d > 99) {
          return d3.format(",")(Math.round(d / 100) * 100);
        } else {
          return d3.format(",")(Math.round(d / 10) * 10);
        }
      });
  }

  function updateBubblePosition() {
    d3BubbleEnter.attr("transform", function (d) {
      const layerPoint = thisMap.latLngToLayerPoint(d.lsoaCentre);
      return "translate(" + layerPoint.x + "," + layerPoint.y + ")";
    });

    return {
      updateD3BubbleLsoa: updateD3BubbleLsoa,
      // updateBubbleColour: updateBubbleColour,
    };
  }

  // Every time the map changes (post viewreset, move or moveend) update the SVG paths
  thisMap.on("viewreset move moveend", updateBubblePosition);

  return {
    updateD3BubbleLsoa: updateD3BubbleLsoa,
    // updateBubbleColour: updateBubbleColour,
  };
}

export { mapIMDDomain, dataRatesLookup };
