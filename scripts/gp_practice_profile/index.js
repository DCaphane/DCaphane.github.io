import {
  newTooltip,
  genID,
  legendWrapper,
  sidebarContent,
  titleCase,
  styleCCG,
  styleLsoa,
  styleWard,
  wardsStyle,
  wardsStyleLabels,
  pcnFormatting,
  chtWidthStd,
  chtHeightStd,
  chtWidthWide,
  chtHeightTall,
  chtHeightShort,
  margin,
  parseDate,
  parseDate2,
  formatPeriod,
  formatNumber,
  formatPercent1dp,
  formatPercent,
  promGeoDataGP,
  promGeoDataCYCWards,
  promGeoNationalCCGBoundaries,
  promGeoDataLsoaBoundaries,
  promGeoDataLsoaPopnCentroid,
  promHospitalDetails,
  promDataIMD,
  promDataRates,
  geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataLsoaPopnCentroid,
  geoDataNationalCCGBoundaries,
  dataIMD,
  importGeoData,
  mapLSOAbyIMD,
  dataRates,
  dataRatesMax,
  dataPopulationGP,
  dataPopulationGPSummary,
  dataPopulationGPLsoa,
  arrayGPLsoaDates,
  uniquePractices,
  promDataGPPopn,
  promDataGPPopnLsoa,
  initTrendChart,
  initPopnBarChart,
  practiceLookup,
} from "./aggregateModules.mjs";

// import initTrendChart from "./modules/d3Charts/gpPopnTrend.mjs"


export {userSelections}
// ############################### index.js #######################################
// Load the initial data and then variations on this for subsequent filtering
let trendChart,
  barChart,
  demographicChart,
  circlePopnIMDChart,
  highlightedPractice;

const userSelections = {
  selectedPractice: "All Practices",
  selectedPracticeName() {
    return practiceLookup.has(this.selectedPractice)
      ? titleCase(practiceLookup.get(this.selectedPractice))
      : "";
  },
  selectedPracticeCompare: "None",
  selectedPracticeCompareName() {
    return practiceLookup.has(this.selectedPracticeCompare)
      ? titleCase(practiceLookup.get(this.selectedPracticeCompare))
      : "";
  },
  selectedDate: null,
  nearestDate() {
    // Align the selected period to the nearest quarterly period
    // arrayGPLsoaDates is result of promise promDataGPPopnLsoa
    return (
      arrayGPLsoaDates.reduce(
        (p, n) =>
          Math.abs(p) > Math.abs(n - this.selectedDate)
            ? n - this.selectedDate
            : p,
        Infinity
      ) + this.selectedDate
    );
  },
};

Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa]).then((data) => {
  // default the selected date to the latest available
  userSelections.selectedDate = d3.max(data[0].value, function (d) {
    return d.Period;
  });
  // hard fixed, what is the latest date
  userSelections.latestPeriod = userSelections.selectedDate;
  userSelections.nearestQuarter = userSelections.nearestDate();
});

function initD3Charts() {
  trendChart = initTrendChart(dataPopulationGP, "cht_PopTrend");
  trendChart.chartTrendDraw();

  barChart = initPopnBarChart(dataPopulationGP, "cht_PopBar");
  barChart.fnRedrawBarChart();

  demographicChart = initChartDemog(dataPopulationGP, "cht_PopDemo");
  demographicChart.updateChtDemog();
}

function refreshChartsPostPracticeChange(practice) {
  console.log({ selectedPractice: practice });
  // change the selection box dropdown to reflect clicked practice
  document.getElementById("selPractice").value = `${
    userSelections.selectedPractice
  }: ${userSelections.selectedPracticeName()}`;

  filterGPPracticeSites();
  filterFunctionLsoa(true); // zoom to filtered lsoa
  // .then(() => {
  //   recolourPopnLSOA();
  //   recolourIMDLayer(imdDomainShort);
  // });

  trendChart.chartTrendDraw();

  demographicChart.updateChtDemog(
    practice,
    userSelections.selectedPracticeCompare
  );

  circlePopnIMDChart.updateD3BubbleLsoa();

  barChart.fnRedrawBarChart();

  // updateTextPractice();
  // updateTextPCN();
  updateBouncingMarkers();

  highlightFeature(practice, mapMain, false);

  sidebarContent.updateSidebarText("pcnSpecific", practice);
}

export function refreshChartsPostDateChange() {
  for (const value of mapsWithGPMain.values()) {
    updatePopUpText(value[0]);
  }
  demographicChart.updateChtDemog(
    userSelections.selectedPractice,
    userSelections.selectedPracticeCompare
  );
  filterFunctionLsoa(true); // zoom to filtered lsoa

  circlePopnIMDChart.updateD3BubbleLsoa();
  barChart.fnRedrawBarChart();
}

// // These would be hard coded to provide a lookup from the data key to the description
const dataRatesKeys = new Map();
dataRatesKeys.set("AE_01", "A&E Demo");
dataRatesKeys.set("selbyUTC", "Selby UTC");
dataRatesKeys.set("testNew", "Long Description testNew");

// ###########################################################################################

// ############################### gp_practice_dropdown.js #######################################

/*
For the practice selection dropdowns
Currently using unique practices as loaded in the data
This has to run after the data has been loaded - hence promise1, to get the unique practices
Consider separate approach to define unique practices eg. hardcode csv/ json

For restyling dropdowns, improved functionality:
  https://leaverou.github.io/awesomplete/
  https://github.com/LeaVerou/awesomplete

    To Consider:
      Currently, the sorting is done on the map.
      Consider something along the lines of the following:
        https://stackoverflow.com/questions/38448968/sorting-an-array-alphabetically-but-with-exceptions

      Change direction of dropdown at bottom of screen
        https://github.com/selectize/selectize.js/issues/29

  https://www.hongkiat.com/blog/search-select-using-datalist/
  https://codepen.io/rpsthecoder/embed/yJvRPE/?height=421&theme-id=12825&default-tab=result&embed-version=2
*/



let urls = [
  "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03Q&RelStatus=active&Limit=1000",
  // "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03M&RelStatus=active&Limit=1000"
];

const gpDetails = d3.json(urls[0]).then((data) => {
  const organisations = data.Organisations;

  organisations.forEach((d) => {
    const orgID = d.OrgId;
    const orgName = d.Name;

    practiceLookup.set(orgID, orgName);
  });
});

Promise.all([gpDetails, promDataGPPopn]).then(() => {
  // requires unique list of practices (uniquePractices)
  const dropDowns = document.getElementsByClassName("dropdown practice"); // select all elements with these classes

  for (let i = 0; i < dropDowns.length; i++) {
    // https://stackoverflow.com/questions/14910196/how-to-add-multiple-divs-with-appendchild/36937070
    let docFrag = document.createDocumentFragment();
    docFrag.appendChild(createElem("option", "All Practices"));

    for (const pCode of uniquePractices) {
      // value, key, map https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach

      if (practiceLookup.has(pCode)) {
        docFrag.appendChild(
          createElem(
            "option",
            `${pCode}: ${titleCase(practiceLookup.get(pCode))}`
          )
        ); // Note that this does NOT go to the DOM
      } else {
        createElem("option", pCode);
      }
    }

    dropDowns[i].append(docFrag);
  }

  // https://www.sitepoint.com/javascript-autocomplete-widget-awesomplete/

  const input1 = document.getElementById("selPractice");
  const comboplete1 = new Awesomplete(input1, {
    minChars: 0,
    maxItems: 30,
    sort: false,
  });
  Awesomplete.$("#btn-selPractice").addEventListener("click", function () {
    if (comboplete1.ul.childNodes.length === 0) {
      comboplete1.minChars = 0;
      comboplete1.evaluate();
    } else if (comboplete1.ul.hasAttribute("hidden")) {
      comboplete1.open();
    } else {
      comboplete1.close();
    }
  });

  // https://github.com/LeaVerou/awesomplete/issues/17034
  input1.addEventListener("awesomplete-select", function (event) {
    if (event.text.value !== "All Practices") {
      userSelections.selectedPractice = event.text.value.substring(0, 6);
    } else {
      userSelections.selectedPractice = event.text.value;
    }
    refreshChartsPostPracticeChange(userSelections.selectedPractice);
  });

  const input2 = document.getElementById("selPracticeCompare");
  const comboplete2 = new Awesomplete(input2, {
    minChars: 0,
    maxItems: 30,
    sort: false,
  });
  Awesomplete.$("#btn-selPracticeCompare").addEventListener(
    "click",
    function () {
      if (comboplete2.ul.childNodes.length === 0) {
        comboplete2.minChars = 0;
        comboplete2.evaluate();
      } else if (comboplete2.ul.hasAttribute("hidden")) {
        comboplete2.open();
      } else {
        comboplete2.close();
      }
    }
  );

  input2.addEventListener("awesomplete-select", function (event) {
    if (event.text.value !== "All Practices") {
      userSelections.selectedPracticeCompare = event.text.value.substring(0, 6);
    } else {
      userSelections.selectedPracticeCompare = event.text.value;
    }

    console.log("Compare: " + userSelections.selectedPracticeCompare);
    demographicChart.updateChtDemog(
      userSelections.selectedPractice,
      userSelections.selectedPracticeCompare
    );
  });
});

// Function to create a given element eg. option and in this case, the map key, k (practice code)
function createElem(elemType, text) {
  let elem = document.createElement(elemType);
  elem.appendChild(document.createTextNode(text));
  return elem;
}


// ############################### gp_popn_demographics.js #######################################

/*
Based on this example:
    https://stackoverflow.com/questions/25044997/creating-population-pyramid-with-d3-js/25050764#25050764
    https://codepen.io/netkuy/pen/KzPaBe

    Transitions: https://gist.github.com/martinjc/7fa5deb1782da2fc6da15c3fad02c88b
    */

function initChartDemog(dataInit, id) {
  const div = document.getElementById(id);
  // Total by Period and Age Band - Trend Chart Filtered
  // Initial data used as starting point (totals for all practices)
  const data_DemoInit = d3.rollup(
    dataInit,
    function (v) {
      return {
        total: d3.sum(v, function (d) {
          return d.Total_Pop;
        }),
        male: d3.sum(v, function (d) {
          return d.Male_Pop;
        }),
        female: d3.sum(v, function (d) {
          return d.Female_Pop;
        }),
      };
    },
    (d) => +d.Period,
    (d) => d.Age_Band
  );

  // const dataLevel_03 = d.get(+userSelections.selectedDate); // data_DemoInit

  // by age/ sex, by practice by period
  const dataLevel_04 = d3.rollup(
    dataInit,
    function (v) {
      return {
        total: d3.sum(v, function (d) {
          return d.Total_Pop;
        }),
        male: d3.sum(v, function (d) {
          return d.Male_Pop;
        }),
        female: d3.sum(v, function (d) {
          return d.Female_Pop;
        }),
      };
    },
    (d) => d.Practice,
    (d) => +d.Period,
    (d) => d.Age_Band
  );

  let maxValue = 0;

  // for the demographic chart layout
  const marginDemog = {
    top: 5,
    right: 15,
    bottom: 40,
    left: 15,
    middle: 20,
  };

  // Demographic breakdown (age, sex)
  const svgDemog = d3
    .select(div)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
            ${chtWidthWide + marginDemog.left + marginDemog.right}
            ${chtHeightShort + marginDemog.top + marginDemog.bottom}
            `
    ) // to ensure x-axis appears
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    // .attr("class", "inner-region")
    .attr("transform", `translate(${marginDemog.left}, ${marginDemog.top})`);

  // the width of each side of the chart
  const regionWidth = chtWidthWide / 2 - marginDemog.middle;

  // these are the x-coordinates of the y-axes
  const pointA = regionWidth, // the x-coordinate of the zero line for male population
    pointB = chtWidthWide - regionWidth; // the corresponding point for the female population

  // Make groups for each side of chart
  // scale(-1, 1) is used to reverse the left side so the bars grow left instead of right
  // let leftBarGroup, rightBarGroup;

  // the xScale goes from 0 to the width of a region
  // it will be reversed for the left x-axis
  // const xScale = d3
  //   .scaleLinear()
  //   .range([0, regionWidth]) // can add an adjustment here but bars need adjusting...
  //   .nice();

  const xScaleLeft = d3.scaleLinear().range([regionWidth, 0]).nice(); //  this reverses the direction of the scale (n to 0)
  const xScaleRight = d3.scaleLinear().range([0, regionWidth]).nice(); // (0 to n)
  const xAxisAdj = 0.0005; // used to prevent cut off of the xAxis labels

  let xAxisLeft = d3
    .axisBottom(xScaleLeft) // xScale.copy().range([pointA, 0])
    .tickSize(-(chtWidthWide - margin.left - margin.right))
    // Reverse the x-axis scale on the left side by reversing the range
    .tickFormat(function (d) {
      if (maxValue < 0.1) {
        return formatPercent1dp(d);
      } else {
        return formatPercent(d);
      }
    });

  let xAxisRight = d3
    .axisBottom(xScaleRight)
    .tickSize(-(chtWidthWide - margin.left - margin.right))
    .tickFormat(function (d) {
      if (maxValue < 0.1) {
        return formatPercent1dp(d);
      } else {
        return formatPercent(d);
      }
    });

  const yScale = d3
    .scaleBand()
    .rangeRound([chtHeightShort, 0])
    .paddingInner(0.2) // space between bars
    .paddingOuter(0); // space at top/ bottom of bars

  const tickAdj = 2; // used to ensure y-axis text centres horizontally

  // set up axes
  const yAxisLeft = d3
    .axisRight(yScale)
    .tickSize(tickAdj, 0) // sets the length (in svg units) of the tick marks coming out from the axis.
    .tickPadding(marginDemog.middle - tickAdj); // how far away from the end of the tick mark the text-anchor of the label text is placed

  const yAxisRight = d3
    .axisLeft(yScale)
    .tickSize(tickAdj, 0) // sets the length (in svg units) of the tick marks coming out from the axis (inner, outer)
    .tickFormat(""); // set to the empty string to remove tick labels from one of the axes, so that no overlapping occurs.

  // Hard code age bands using 'Age Band Org' (original) figures to keep in order
  // this version can be used if in the 'row' function use Age_Band: d.Age_Band_Org,
  // However, in earlier versions, age was capped at 85+ years
  // var ageBands = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95+']

  // For consistency historically, use the following
  // Age_Band: d.Age_Band,
  const ageBands = [
    "0-4",
    "5-9",
    "10-14",
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59",
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80-84",
    "85+",
  ];

  yScale.domain(ageBands);
  const emptyDemog = emptyDemographic();

  const tooltipDemog = newTooltip
    .tooltip(div)
    .style("height", "65px")
    .style("width", "120px");

  svgDemog
    .append("g")
    .attr("class", "axis y left")
    .attr("transform", translation(pointA, 0))
    .call(yAxisLeft)
    .selectAll("text")
    .style("text-anchor", "middle");

  svgDemog
    .append("g")
    .attr("class", "axis y right")
    .attr("transform", translation(pointB, 0))
    .call(yAxisRight);

  svgDemog
    .append("g")
    .attr("class", "axis x left grid")
    .attr("transform", translation(0, chtHeightShort));

  svgDemog
    .append("g")
    .attr("class", "axis x right grid")
    .attr("transform", translation(pointB, chtHeightShort));

  // Add row chart to highlight eg. over 65s
  // const footer = document.getElementById("over65s");
  const footer = document.getElementById("cht_PopDemo").nextElementSibling;
  const tooltipOverAge = newTooltip
    .tooltip(footer)
    .style("height", "60px")
    .style("width", "220px");

  // Population over age ...
  const chtHeightMini = chtHeightShort / 2;
  const svgOverAge = d3
    .select(footer)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
          ${chtWidthWide + margin.left + margin.right}
    ${chtHeightMini + 20}`
    )
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left - 20})`);

  const xScaleOverAge = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, chtWidthWide])
    .nice();
  const yScaleOverAge = d3
    .scaleBand()
    .rangeRound([chtHeightMini, 0])
    .paddingInner(0.2) // space between bars
    .paddingOuter(0.5); // space at top/ bottom of bars

  const xAxisOverAge = d3.axisBottom(xScaleOverAge).tickFormat(formatPercent),
    yAxisOverAge = d3.axisLeft(yScaleOverAge).tickSizeOuter(0);

  svgOverAge
    .append("g")
    // .attr("class", "x axis")
    .attr("id", "axis--x--overage")
    .attr("transform", `translate(0, ${chtHeightMini - 20})`)
    .call(xAxisOverAge)
    .append("text")
    .attr("x", chtWidthWide / 2)
    .attr("dy", "35px")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "#000000") // font colour
    .text("Population Aged Over 65");

  svgOverAge
    .append("g")
    // .attr("class", "y axis")
    .attr("id", "axis--yBar--overage")
    // .attr("transform", `translate(0,0)`)
    .call(yAxisOverAge);
  // text label for the y axis
  // .append("text")
  // .attr("transform", "rotate(-90)")
  // .attr("y", -35)
  // .attr("x", 0 - chtHeightMini / 2)
  // .attr("dy", "1em")
  // .style("text-anchor", "middle")
  // .style("font-weight", "bold")
  // .text("Practice");

  function updateChtDemog(practiceMain, practiceComp) {
    let chtDataP1, chtDataP2;

    // Main Practice Data
    if (userSelections.selectedPractice === "Default") {
      practiceMain = undefined;
    }

    if (!practiceMain || practiceMain === "All Practices") {
      practiceMain = undefined;
      // no practice selected, undefined - use the original data source (All Practices)
      chtDataP1 = data_DemoInit.get(userSelections.selectedDate);
    } else {
      chtDataP1 = dataLevel_04
        .get(practiceMain)
        .get(userSelections.selectedDate);
    }

    // Comparison Practice Data
    if (!practiceComp || practiceComp === "None") {
      practiceComp = undefined;
      // no practice comparison selected
      chtDataP2 = emptyDemog;
    } else if (practiceComp === "All Practices") {
      chtDataP2 = data_DemoInit.get(userSelections.selectedDate);
    } else {
      chtDataP2 = dataLevel_04
        .get(practiceComp)
        .get(userSelections.selectedDate);
    }

    chartDemogDraw(chtDataP1, chtDataP2);
  }

  function chartDemogDraw(dataP1, dataP2 = emptyDemog, ageOver = 65) {
    // d3 transition
    let t = d3.transition().duration(750).ease(d3.easeQuadInOut); // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe

    const totalPop1 = fnTotalPopulation(dataP1, "total"),
      totalPop2 = fnTotalPopulation(dataP2, "total"),
      totalPop1Male = fnTotalPopulation(dataP1, "male"),
      totalPop1Female = fnTotalPopulation(dataP1, "female");
    // console.log({
    //   pop1: totalPop1,
    //   pop2: totalPop2,
    //   pop1Male: totalPop1Male,
    //   pop1Female: totalPop1Female,
    // });

    // find the maximum data value on either side
    // Use this to provide a symmetrical x-axes

    let popn1MaxMale = 0,
      popn1MaxFemale = 0,
      popn2MaxMale = 0,
      popn2MaxFemale = 0;

    for (let value of dataP1.values()) {
      // totalPop += value.total;
      popn1MaxMale = Math.max(popn1MaxMale, value.male / totalPop1);
      popn1MaxFemale = Math.max(popn1MaxFemale, value.female / totalPop1);
    }

    if (totalPop2 > 0) {
      for (let value of dataP2.values()) {
        // totalPop += value.total;
        popn2MaxMale = Math.max(popn2MaxMale, value.male / totalPop2);
        popn2MaxFemale = Math.max(popn2MaxFemale, value.female / totalPop2);
      }
    }

    maxValue = Math.max(
      popn1MaxMale,
      popn1MaxFemale,
      popn2MaxMale,
      popn2MaxFemale
    );
    // console.log(maxValue);

    //xScale.domain([0, maxValue + xAxisAdj]);
    xScaleLeft.domain([0, maxValue + xAxisAdj]);
    xScaleRight.domain([0, maxValue + xAxisAdj]);
    // yScale.domain(chtDataDemog.map(function(d) {return d.key; }))
    // yScale.domain(ageBands);

    // x-axis drawn once xScale domain calculated
    svgDemog
      .select(".axis.x.left")
      .transition(t)
      .call(xAxisLeft)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -7) // shifts text up (+) or down (-)
      .attr("dy", ".35em") // shifts text left (+) or right
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");
    svgDemog
      .select(".axis.x.right")
      .transition(t)
      .call(xAxisRight)
      // to rotate the axis text
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -7) // shifts text up (+) or down (-)
      .attr("dy", ".35em") // shifts text left (+) or right
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

    // remove outside border
    svgDemog.selectAll("g.axis.x").select(".domain").remove();

    const arrP1 = Array.from(dataP1, ([key, value]) => ({
      ageBand: key,
      population: value,
    }));
    const arrP2 = Array.from(dataP2, ([key, value]) => ({
      ageBand: key,
      population: value,
    }));

    // https://observablehq.com/@d3/selection-join
    svgDemog
      .selectAll(".bar.left")
      .data(arrP1, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      // mouse events need to go before any transitions
      .on("click", function (event, d) {
        console.log("selAge:", d.ageBand);
      })
      .on("mousemove", function (event, d) {
        const sel = d3.select(this);
        sel.attr("class", "bar hover");

        const pos = this.getBoundingClientRect();

        const str = `<strong>Male: ${d.ageBand} yrs</strong><br>
                <span style="color:red">
                  Pop'n: ${formatNumber(d.population.male)}
                  </span><br>
                % Total: ${formatPercent1dp(d.population.male / totalPop1)}
                <br>
                % Male: ${formatPercent1dp(d.population.male / totalPop1Male)}
                  `;
        newTooltip.mousemoveH(tooltipDemog, str, event, pos);
      })
      .on("mouseout", function () {
        const sel = d3.select(this);
        sel.attr("class", "bar left");
        newTooltip.mouseout(tooltipDemog);
      })
      .attr("class", "bar left")
      .transition(t)
      .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
      .attr("y", function (d) {
        return yScale(d.ageBand);
      })
      .attr("width", function (d) {
        // console.log(d.population.male)
        return xScaleRight(d.population.male / totalPop1); // not sure why but xScaleLeft reverses this!
      })
      .attr("height", yScale.bandwidth());

    svgDemog
      .selectAll(".bar.right")
      .data(arrP1, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      .on("click", function (event, d) {
        console.log("selAge:", d.ageBand);
      })
      .on("mousemove", function (event, d) {
        const sel = d3.select(this);
        sel.attr("class", "bar hover");
        const pos = this.getBoundingClientRect();
        const str = `<strong>Female: ${d.ageBand} yrs</strong><br>
        <span style="color:red">
          Pop'n: ${formatNumber(d.population.female)}
          </span><br>
        % Total: ${formatPercent1dp(d.population.female / totalPop1)}
        <br>
        % Female: ${formatPercent1dp(d.population.female / totalPop1Female)}
          `;
        newTooltip.mousemoveH(tooltipDemog, str, event, pos);
      })
      .on("mouseout", function () {
        const sel = d3.select(this);
        sel.attr("class", "bar right");
        newTooltip.mouseout(tooltipDemog);
      })
      .attr("class", "bar right")
      .transition(t)
      .attr("transform", translation(pointB, 0))
      .attr("y", function (d) {
        return yScale(d.ageBand);
      })
      .attr("width", function (d) {
        // console.log(x.population.female)
        return xScaleRight(d.population.female / totalPop1); // not sure why but xScaleLeft reverses this!
      })
      .attr("height", yScale.bandwidth());

    // Comparison Bars
    svgDemog
      .selectAll(".bar-comp.left")
      .data(arrP2, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      .attr("class", "bar-comp left")
      .transition(t)
      .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
      .attr("y", function (d) {
        return yScale(d.ageBand) + 1;
      })
      .attr("width", function (d) {
        if (totalPop2 > 0) {
          return xScaleRight(d.population.male / totalPop2); // not sure why but xScaleLeft reverses this!
        } else {
          return 0;
        }
      })
      .attr("height", yScale.bandwidth() - 2);

    svgDemog
      .selectAll(".bar-comp.right")
      .data(arrP2, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      .attr("class", "bar-comp right")
      .transition(t)
      .attr("transform", translation(pointB, 0))
      .attr("y", function (d) {
        return yScale(d.ageBand) + 1;
      })
      .attr("width", function (d) {
        if (totalPop2 > 0) {
          return xScaleRight(d.population.female / totalPop2); // not sure why but xScaleLeft reverses this!
        } else {
          return 0;
        }
      })
      .attr("height", yScale.bandwidth() - 2);

    // Population greater than or equal to eg. 65 (default)
    const selectedPop1 = subPopulation(ageOver, dataP1);
    const selectedPop2 = subPopulation(ageOver, dataP2);

    const arrOverAge = [
      {
        practice: !userSelections.selectedPractice
          ? "All Practices"
          : userSelections.selectedPractice,
        popn: { selPopn: selectedPop1, pct: selectedPop1 / totalPop1 },
      },
    ];

    if (userSelections.selectedPracticeCompare === "None") {
      // do nothing
    } else {
      const objCompare = {
        practice: userSelections.selectedPracticeCompare,
        popn: { selPopn: selectedPop2, pct: selectedPop2 / totalPop2 },
      };
      arrOverAge.push(objCompare);
    }

    yScaleOverAge.domain(
      arrOverAge.map(function (d) {
        return d.practice;
      })
    );
    svgOverAge
      .select("#axis--yBar--overage")
      .transition(t)
      .call(yAxisOverAge)
      .selectAll("text");

    svgOverAge
      .selectAll(".backgroundBar")
      .data(arrOverAge)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "backgroundBar")
      .attr("width", function (d) {
        return xScaleOverAge(1);
      })
      .attr("y", function (d, i) {
        return yScaleOverAge(d.practice);
      })
      .attr("height", yScaleOverAge.bandwidth());

    svgOverAge
      .selectAll(".bar")
      .data(arrOverAge)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .on("mouseover", function (event, d) {
        const pos = this.getBoundingClientRect();
        const practiceName = practiceLookup.has(d.practice)
          ? `: ${titleCase(practiceLookup.get(d.practice))}`
          : "";
        const str = `<strong>${d.practice}${practiceName}</strong><br>
    <span style="color:red">
    Population over ${ageOver}: ${formatNumber(d.popn.selPopn)}
    </span><br>
    Percent over ${ageOver}: ${formatPercent1dp(d.popn.pct)}
    `;
        newTooltip.mouseover(tooltipOverAge, str, event, pos);
      })
      .on("mouseout", function () {
        newTooltip.mouseout(tooltipOverAge);
      })

      .attr("class", "bar")
      .transition(t)
      .attr("fill", function (d) {
        return d3.interpolateGreens(1 - d.popn.pct);
      })
      .attr("width", function (d) {
        return xScaleOverAge(d.popn.pct);
      })
      .attr("y", function (d, i) {
        return yScaleOverAge(d.practice);
      })
      .attr("height", yScaleOverAge.bandwidth());

    svgOverAge
      .selectAll(".pctValue")
      .data(arrOverAge)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("text").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "pctValue")
      .transition(t)
      .attr("x", function (d) {
        return xScaleOverAge(d.popn.pct);
      })
      .attr("y", function (d, i) {
        return yScaleOverAge(d.practice);
      })
      .attr("dx", "5px")
      .attr("dy", yScaleOverAge.bandwidth() / 2 + 7)
      .text(function (d) {
        return formatPercent1dp(d.popn.pct);
      });
  }

  function translation(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  function fnTotalPopulation(data, gender = "total") {
    // Get the population size and create a function for returning the percentage
    // gender can be total, female or male
    let totalPop = 0;

    if (data.size > 0) {
      for (let value of data.values()) {
        totalPop += value[gender];
      }
    }

    return totalPop;
  }

  function subPopulation(age = 0, data) {
    let populationOverAge = 0;

    if (data.size > 0) {
      for (let [key, value] of data) {
        if (key.substring(0, key.indexOf("-")) >= age) {
          populationOverAge += value.total;
        }
      }
    }

    // console.log('Over65s: ' + populationOverAge)
    // console.log('% 65s: ' + formatPercent(populationOverAge / totalPop1))

    return populationOverAge;
  }

  function emptyDemographic() {
    const demog = new Map();
    let empty = { total: 0, male: 0, female: 0 };

    // create an empty
    ageBands.forEach((item) => {
      demog.set(item, empty);
    });

    return demog;
  }

  return {
    updateChtDemog: updateChtDemog,
  };
}

// ###########################################################################################

// ############################### map_components.js #######################################

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
  mapsWithLSOAFiltered = new Map();

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

function refreshMapOverlayControls() {
  /*
  to refresh the map overlay buttons
  this needs to be done anytime something is changed that affects the overlay
  Uses the last map (arbitrary) to ensure all the data has been loaded
  */
  const lastMap = mapStore[mapStore.length - 1];
  lastMap.promTesting.then(() => {
    for (const thisMap of mapStore) {
      thisMap.refreshOverlayControl();
    }
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
  selbyMIU: [53.77748, -1.07832],
};

function selectedTrustMarker(location, text) {
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

// Dummy moveable (draggable) marker for demo only
function moveableMarker() {
  return L.marker(trustSitesLoc.yorkTrust, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "atom",
      borderColor: "Black", // "rgba(242,247,53)",
      backgroundColor: "transparent",
      textColor: "Black", // "rgba(242,247,53)", // Text color of marker icon
      popupAnchor: [0, -5], // adjusts offset position of popup
    }),
    zIndexOffset: 1001,
    draggable: true,
  }).bindPopup("Drag to move me"); // Text to display in pop up
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

function styleLsoaOrangeOutline() {
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
          return L.marker(latlng, {
            icon: arrHighlightIcons[5],
            zIndexOffset: -5,
          });
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
    label: "Local Hospital Sites <i class='fa-solid fa-circle-h'></i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "York",
        layer: selectedTrustMarker(trustSitesLoc.yorkTrust, "York Trust"),
      },
      {
        label: "Harrogate",
        layer: selectedTrustMarker(
          trustSitesLoc.harrogateTrust,
          "Harrogate Trust"
        ),
      },
      {
        label: "Scarborough",
        layer: selectedTrustMarker(
          trustSitesLoc.scarboroughTrust,
          "Scarborough Trust"
        ),
      },
      {
        label: "Leeds",
        layer: selectedTrustMarker(trustSitesLoc.leedsTrust, "Leeds Trust"),
      },
      {
        label: "South Tees",
        layer: selectedTrustMarker(
          trustSitesLoc.southTeesTrust,
          "South Tees Trust"
        ),
      },
      {
        label: "Hull",
        layer: selectedTrustMarker(trustSitesLoc.hullTrust, "Hull Trust"),
      },
      {
        label: "Selby MIU",
        layer: selectedTrustMarker(trustSitesLoc.selbyMIU, "Selby MIU"),
      },
      {
        label: "Move Me",
        layer: moveableMarker(),
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

function overlayLSOAbyCCG(data) {
  return {
    label: "LSOA by CCG",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: data,
      },
    ],
  };
}

function overlayLSOAbyIMD(mapObj, labelDesc) {
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

function overlayAddSeparator() {
  // Adds a horizontal line
  return {
    label: '<div class="leaflet-control-layers-separator"></div>',
  };
}

// ###########################################################################################

// ############################### map_functions.js #######################################

function recolourPopnLSOAIMD() {
  /*
    For updating the LSOA colours by population in the IMD chart
    */
  const maxValue = maxPopulation();

  // refreshMapPopnLegend(maxValue);
  imdLegend.legend({
    color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
    title: "Population",
    width: 600,
    marginLeft: 50,
  });

  mapsWithLSOAFiltered.get(mapIMD.map)[0].eachLayer(function (layer) {
    const lsoaCode = layer.feature.properties.lsoa;

    let value = actualPopulation(lsoaCode);

    if (value === undefined) {
      value = 0;
    }

    if (value > minPopulationLSOA) {
      layer.setStyle({
        // https://github.com/d3/d3-scale-chromatic
        fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
        fillOpacity: 0.8,
        weight: 1, // border
        color: "white", // border
        opacity: 1,
        // dashArray: "3",
      });
      // layer.on("click", function (e) {
      //   // update other charts
      //   console.log({ lsoa: selectedLsoa });
      // });
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
            <p>${userSelections.selectedPractice}</p>
            <p>${formatPeriod(userSelections.nearestDate())}</p>
        Pop'n: ${formatNumber(value)}
        `
    );
  });
}

let imdDomainDescD3 = "Population",
  imdDomainShortD3 = "Population";

function imdDomainD3({ id, thisMap } = {}) {
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

// Map IMD by LSOA
function recolourIMDLayer(defaultIMD = "imdRank") {
  // const maxValue = d3.max(v, function (d) {
  //   return d[defaultIMD];
  // });

  if (defaultIMD === "population") {
    recolourPopnLSOAIMD();
  } else {
    /*
        rawValues are the values in the appropriate field
        These are ignored for the IMD indicators since they are hardcoded based on the number of LSOAs: 1 to 32,844
        However, for the 'imd' population figures, these are used
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

    if (mapsWithLSOAFiltered.has(mapIMD.map)) {
      mapsWithLSOAFiltered.get(mapIMD.map)[0].eachLayer(function (layer) {
        const lsoaCode = layer.feature.properties.lsoa;

        if (mapsFilteredLSOA.has(lsoaCode)) {
          // the filter lsoaFunction populates a map object of lsoas (with relevant population)
          let obj = dataIMD.find((x) => x.lsoa === lsoaCode);
          if (obj !== undefined) {
            // console.log(obj[defaultIMD], maxValue);
            const value = obj[defaultIMD];

            layer.setStyle({
              // https://github.com/d3/d3-scale-chromatic
              fillColor: colour(value), //colourScheme(value / maxValue),
              fillOpacity: 0.8,
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
}
// }

/*
For colouring the choropleth map and legend

Scale is used to colour the maps.
legendColour is used to create the colour bar (ramp)

Some scales require the whole dataset (values) for the domain. This can be derived using eg. d3.range(m, n) which returns an array of m-n+1 values from m to n
Other scales only require the min and max values as an array. This can be derived using d3.extent (values) or d3.min and d3.max
*/
const noLSOAs = 32_844, // this is the number of lsoas nationally
  arrNoLSOAs = d3.range(1, noLSOAs + 1); // returns an array [1, 2, ..., noLSOAs]

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

const mapIMDDomain = new Map();

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
let imdDomainDesc = "Population",
  imdDomainShort = "population";

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
  select.options.add(new Option("Population", 0, true, true));
  let counter = 1;
  for (let key of mapIMDDomain.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }

  for (let key of dataRatesLookup.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }
  // for (let key of mapIMDDomain.keys()) {
  //   if (counter !== 0) {
  //     select.options.add(new Option(key, counter));
  //   } else {
  //     select.options.add(new Option(key, 0, true, true));
  //   }
  //   counter++;
  // }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    imdDomainDesc = d3.select("#selImdDomain option:checked").text();

    if (mapIMDDomain.has(imdDomainDesc)) {
      imdDomainShort = mapIMDDomain.get(imdDomainDesc).datasetDesc;
    } else if (dataRatesLookup.has(imdDomainDesc)) {
      imdDomainShort = dataRatesLookup.get(imdDomainDesc);
    } else if (imdDomainDesc === "Population") {
      imdDomainShort = "population";
    } else {
      imdDomainShort = "population";
    }

    // if (imdDomainDesc !== "Population") {
    //   imdDomainShort = mapIMDDomain.get(imdDomainDesc).datasetDesc;
    // } else {
    //   imdDomainShort = "population";
    // }

    console.log({ imdDomainShort: imdDomainShort });
    recolourIMDLayer(imdDomainShort);
  });
})();

let firstPass = true;

function filterGPPracticeSites(zoomToExtent = false) {
  /* This will deselect the 'entire' GP Sites layer
  and return an additional filtered layer based on the selected practice
  */

  Promise.allSettled([promGeoDataGP, gpDetails]).then((data) => {
    mapsWithGPSites.forEach(function (value, key) {
      // value includes the original unfiltered sites layer, value[0] and the filtered layer if exists, value[1]
      let isLayerDisplayed = false;
      let isFilteredLayerDisplayed = false;
      if (key.hasLayer(value[0])) {
        // the original sites layer
        key.removeLayer(value[0]);
        isLayerDisplayed = true;
      }

      // Does the map already show the filtered sites layer
      if (value.length > 1) {
        if (key.hasLayer(value[1])) {
          key.removeLayer(value[1]);
          isFilteredLayerDisplayed = true;
        }
        // value.pop(); // not necessary as will be overwritten?
        delete value[1]; // keeps the array length but the filtered sites layer (in index 1) becomes undefined
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
        if (isFilteredLayerDisplayed || firstPass) {
          gpSites.addTo(key);
          firstPass = false;
        }

        value[1] = gpSites; // append the filtered layer

        // Selected GP Sites Overlay
        const ol = {
          label: "Selected Practice Sites",
          layer: gpSites,
        };
        value[2] = ol; // append the overlay

        mapsWithGPSites.set(key, value);

        if (zoomToExtent) {
          key.fitBounds(gpSites.getBounds().pad(0.1));
        }
      } else {
        // reset to show all sites
        if (isLayerDisplayed) {
          // (isLayerDisplayed || key === mapPopn.map)
          key.addLayer(value[0]);
        }
        key.flyTo(mapOfMaps.get(key), 9);

        // Remove the overlay
        value[2] = null; // null will be used in the filter function to remove the overlay
      }
    });
    // refreshFilteredGPSitesOverlays();
  });
}

function refreshFilteredGPSitesOverlays() {
  // mapStore is an array of the maps that use the filtered GP Sites
  let refreshOverlay = false;
  for (let mapGPSites of mapStore) {
    if (mapsWithGPSites.has(mapGPSites.map)) {
      const arr = mapsWithGPSites.get(mapGPSites.map);
      if (arr.length > 2) {
        if (arr[2] !== null) {
          // if it's null then delete the overlay label
          refreshOverlay = true;
          mapGPSites.updateOverlay("gpSitesFiltered", arr[2]);
        } else {
          mapGPSites.updateOverlay(
            "gpSitesFiltered",
            "",
            true // option to delete overlay
          );
        }
      }
    } else {
      // console.log({gpSitesMap: 'update gpSites map array'})
    }
  }

  // Once the lsoa has been refreshed, update the overlay
  if (refreshOverlay) {
    // refreshMapOverlayControls();
  }
}

// Contains lsoa (key) and it's population for the selected practice (value)
const mapsFilteredLSOA = new Map(); // selected lsoas

async function filterFunctionLsoa(zoomToExtent = false) {
  /*
  Consider moving this into the init function if not splitting by eg. IMD
  */
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promDataGPPopnLsoa,
    promDataIMD,
  ])
    .then((lsoaBoundaries) => {
      mapsFilteredLSOA.clear();

      mapsWithLSOAFiltered.forEach(function (value, key) {
        // Remove the original layer
        if (value !== null && value !== undefined) {
          if (key.hasLayer(value[0])) {
            key.removeLayer(value[0]);
          }
        }

        const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
          style: styleLsoaOrangeOutline,
          pane: "lsoaBoundaryPane2",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa;

            layer.on("click", function (e) {
              // update other charts
              const selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
              console.log({ lsoa: selectedLsoa });
            });
          },
          filter: function (d) {
            // console.log(d.properties.lsoa)
            const lsoaCode = d.properties.lsoa;

            let population = actualPopulation(lsoaCode);

            if (population > minPopulationLSOA) {
              mapsFilteredLSOA.set(lsoaCode, population);
              return true;
            }
          },
        });

        geoDataLsoaBoundaries.addTo(key);

        const ol = {
          label: "LSOA by Population",
          layer: geoDataLsoaBoundaries,
          // selectAllCheckbox: true,
          // children: [{ layer: geoDataLsoaBoundaries }]
        };
        mapsWithLSOAFiltered.set(key, [geoDataLsoaBoundaries, ol]); // filtered lsoa map, popn over eg. 20

        // if (incLayer) {
        // L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);
        // }

        if (zoomToExtent) {
          key.fitBounds(geoDataLsoaBoundaries.getBounds());
        }
      });
    })
    .then(() => {
      // recolourPopnLSOA();
      recolourIMDLayer(imdDomainShort);
    })
    .then(() => {
      /*
      Previously tried running this within the above .then statement but this typically results in
      an error when trying to remove a layer
      */
      const lastMap = mapStore[mapStore.length - 1];
      lastMap.promTesting.then(() => {
        refreshFilteredGPSitesOverlays();
        refreshFilteredLSOAOverlays();
      });
    });
}

async function filterFunctionLsoaByIMD(zoomToExtent = false) {
  /*
  This procedures works but is potentially slow since removing all layers rather than one overarching one
  */
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promDataGPPopnLsoa,
    promDataIMD,
  ])
    .then((lsoaBoundaries) => {
      mapsFilteredLSOA.clear();

      mapsWithLSOAFiltered.forEach(function (value, key) {
        const incLayer = key.hasLayer(value);
        // Remove the original layer
        if (value !== null) {
          if (key.hasLayer(value[0])) {
            key.removeLayer(value[0]);
          } else {
            value[2]();
          }
        }

        const layersMapByIMD = new Map();

        const geoDataLsoaBoundaries = L.geoJSON(lsoaBoundaries[0].value, {
          style: styleLsoaOrangeOutline,
          pane: "lsoaBoundaryPane2",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa;

            let imdDecile;
            if (mapLSOAbyIMD.has(lsoa)) {
              imdDecile = mapLSOAbyIMD.get(lsoa); // IMD Decile
            } else {
              imdDecile = "exc"; // undefined
            }

            // Initialize the category array if not already set.
            if (!layersMapByIMD.has(imdDecile)) {
              layersMapByIMD.set(imdDecile, L.layerGroup());
            }
            layersMapByIMD.get(imdDecile).addLayer(layer);

            layer.on("click", function (e) {
              // update other charts
              const selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
              console.log({ lsoa: selectedLsoa });
            });
          },
          filter: function (d) {
            // console.log(d.properties.lsoa)
            const lsoaCode = d.properties.lsoa;

            let population = actualPopulation(lsoaCode);

            if (population > minPopulationLSOA) {
              mapsFilteredLSOA.set(lsoaCode, population);
              return true;
            }
          },
        });

        L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);

        function removeFeature() {
          layersMapByIMD.forEach(function (value) {
            key.removeLayer(value);
          });
        }

        const ol = overlayLSOA(layersMapByIMD, "LSOA Population");
        mapsWithLSOAFiltered.set(key, [
          geoDataLsoaBoundaries,
          ol,
          removeFeature,
        ]); // filtered lsoa map, popn over eg. 20

        // if (incLayer) {
        // L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);
        // }

        if (zoomToExtent) {
          key.fitBounds(geoDataLsoaBoundaries.getBounds());
        }
      });
    })
    .then(() => {
      // recolourPopnLSOA();
      recolourIMDLayer(imdDomainShort);
      refreshFilteredLSOAOverlays();
    });
}

function refreshFilteredLSOAOverlays() {
  // mapStore is an array of the maps that use the filtered LSOA
  let refreshOverlay = false;
  for (let mapLSOA of mapStore) {
    if (mapsWithLSOAFiltered.has(mapLSOA.map)) {
      const arr = mapsWithLSOAFiltered.get(mapLSOA.map);
      if (arr.length > 1) {
        refreshOverlay = true;
        mapLSOA.updateOverlay("filteredLSOA", arr[1]);
      }
    } else {
      // console.log({lsoaFilteredMap: 'update lsoa map array'})
    }
  }

  // Once the lsoa has been refreshed, update the overlay
  if (refreshOverlay) {
    refreshMapOverlayControls();
  }
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

function maxPopulation() {
  return userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
    ? d3.max(
        dataPopulationGPLsoa
          .get(userSelections.nearestDate())
          .get(userSelections.selectedPractice)
          .values()
      )
    : d3.max(
        dataPopulationGPLsoa
          .get(userSelections.nearestDate())
          .get("All")
          .values()
      );
}

function actualPopulation(lsoa) {
  return userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
    ? dataPopulationGPLsoa
        .get(userSelections.nearestDate())
        .get(userSelections.selectedPractice)
        .get(lsoa)
    : dataPopulationGPLsoa
        .get(userSelections.nearestDate())
        .get("All")
        .get(lsoa);
}

// function recolourPopnLSOA() {
//   /*
//     For updating the LSOA colours in mapPopulation
//     */
//   const maxValue = maxPopulation();

//   // refreshMapPopnLegend(maxValue);
//   popnLegend.legend({
//     color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
//     title: "Population",
//     width: 600,
//     marginLeft: 50,
//   });

//   mapsWithLSOAFiltered.get(mapPopn.map)[0].eachLayer(function (layer) {
//     const lsoaCode = layer.feature.properties.lsoa;

//     let value = actualPopulation(lsoaCode);

//     if (value === undefined) {
//       value = 0;
//     }

//     if (value > minPopulationLSOA) {
//       layer.setStyle({
//         // https://github.com/d3/d3-scale-chromatic
//         fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
//         fillOpacity: 0.8,
//         weight: 1, // border
//         color: "white", // border
//         opacity: 1,
//         // dashArray: "3",
//       });
//       // layer.on("click", function (e) {
//       //   // update other charts
//       //   console.log({ lsoa: selectedLsoa });
//       // });
//     } else {
//       layer.setStyle({
//         // no (transparent) background
//         fillColor: "#ff0000", // background
//         fillOpacity: 0, // transparent
//         weight: 0, // border
//         color: "red", // border
//         opacity: 0,
//       });
//     }

//     layer.bindPopup(
//       `<h3>${layer.feature.properties.lsoa}</h3>
//             <p>${userSelections.selectedPractice}</p>
//             <p>${formatPeriod(userSelections.nearestDate())}</p>
//         Pop'n: ${formatNumber(value)}
//         `
//     );
//   });
// }

// ###########################################################################################

// ############################### map_init.js #######################################

// Set up the maps

// Used to keep track of the map overlay for subsequent refresh
const mapOverlays = new Map();
const mapStore = []; // used to store the variable that stores each map. Can be used in subsequent loops...
// GP Main Site Map
const mapMain = mapInitialise({
  mapDivID: "mapMain", // mapMain is the div id to place the map
  baselayer: "Bright", // set the default baselayer. Default is Bright
  userOverlayGPMain: { inc: true, display: true },
  userOverlayCCGBoundary: { display: true },
  userOverlayWardBoundary: { inc: true },
  userOverlayNationalTrusts: true,
});
mapMain.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
// mapMain.home = {lat: 54.018213, lng: -10.0} // can change the home button position
mapMain.homeButton(); // mapMain.homeButton({ latLng: trustSitesLoc.yorkTrust, zoom: 12 });
mapStore.push(mapMain);
const sidebarMapMain = mapMain.sideBar(); // default is left, can use mapMain.sideBar({side: "right"});
sidebarMapMain.addPanel(sidebarContent.panelOverview);
sidebarMapMain.addPanel(sidebarContent.panelSpecific);
sidebarMapMain.addPanel(sidebarContent.panelMail);
sidebarMapMain.addPanel(sidebarContent.panelDummy);
sidebarMapMain.addPanel(sidebarContent.panelSettings);

mapMain.updateOverlay("selectedTrusts", overlayTrusts());

/*
// Population Map by lsoa
const mapPopn = mapInitialise({
  mapDivID: "mapPopnLSOA",
  baselayer: "Dark",
  userOverlayGPSites: { inc: true, display: true },
  userOverlayLsoaBoundary: { inc: true, display: false },
  userOverlayFilteredLsoa: { inc: true },
});
mapPopn.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapPopn.homeButton();
mapStore.push(mapPopn);
const sidebarPopn = mapPopn.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarPopn.addPanel(sidebarContent.panelOverview);

mapPopn.updateOverlay("selectedTrusts", overlayTrusts());

const popnLegend = legendWrapper("footerMapPopn", genID.uid("popn"));
*/

/*
IMD Map by LSOA

  The data only imports lsoas in VoY CCG boundary
  The extent of the national data is 1 (most deprived area) to 32,844 (least deprived area)
  Since this is only a subset, the values will not always extend from 1 to 32,844

  For the imd charts, the domain should be 1 to 32,844 (hard coded) - this keeps it consistent, esp. if extend the data
  For the population charts, the domain represents the extent

Useful IMD FAQ: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/853811/IoD2019_FAQ_v4.pdf
*/

const mapIMD = mapInitialise({
  mapDivID: "mapIMDLSOA",
  baselayer: "Dark", // Jawg Matrix
  userOverlayGPSites: { inc: true, display: true },
  userOverlayLsoaBoundary: { inc: true, display: false },
  userOverlayFilteredLsoa: { inc: true },
  userOverlayNationalTrusts: true,
});
mapIMD.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapIMD.homeButton();
mapStore.push(mapIMD);
const sidebarIMD = mapIMD.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarIMD.addPanel(sidebarContent.panelOverview);
sidebarIMD.addPanel(sidebarContent.panelIMDSpecific);

const imdLegend = legendWrapper("footerMapIMD", genID.uid("imd"));

mapIMD.updateOverlay("selectedTrusts", overlayTrusts());
mapIMD.updateOverlay("separatorLine", overlayAddSeparator());

/*
Population and IMD by LSOA (D3 Circle Map)
https://bost.ocks.org/mike/bubble-map/

https://labs.os.uk/public/os-data-hub-tutorials/web-development/d3-overlay

Drawing points of interest using this demo:
  https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/

*/

const mapD3Bubble = mapInitialise({
  mapDivID: "mapIMDD3",
  baselayer: "OS Light", // High Contrast
  userOverlayLsoaBoundary: { inc: true },
  userOverlayFilteredLsoa: { inc: true },
  // userOverlayGPMain: { inc: true, display: false },
  userOverlayGPSites: { inc: true, display: false },
  userOverlayNationalTrusts: true,
});
mapD3Bubble.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapD3Bubble.homeButton();
mapStore.push(mapD3Bubble);
const lsoaCentroidLegend = legendWrapper("footerMapD3Leaf", genID.uid("lsoa"));

mapD3Bubble.updateOverlay("selectedTrusts", overlayTrusts());
mapD3Bubble.updateOverlay("separatorLine", overlayAddSeparator());

// bubbleGroup to run a function in the overlayers tree
const htmlD3Bubble = svgCheckBox("mapIMDD3");

// returns a html string with a checkbox to enable toggling of the d3 svg circle layer
function svgCheckBox(id) {
  const cboxId = genID.uid("cbox").id;

  return `<span class="d3Toggle" onmouseover="this.style.cursor='pointer'" onclick="toggleBubbles('${id}', '${cboxId}')";><input type="checkbox" id="${cboxId}" checked> Toggle Circles</span>`;
}

mapD3Bubble.updateOverlay("functionCall", {
  label: htmlD3Bubble,
});

function toggleBubbles(elemParentID, cboxID) {
  // function to toggle the D3 circle bubbles
  // need this specific element if more than one d3 bubble map
  const bubbleGroup = d3.select(`#${elemParentID} .bubble-group`);
  const checkBox = document.getElementById(cboxID);

  if (bubbleGroup.style("visibility") === "hidden") {
    bubbleGroup.style("visibility", "visible");
    checkBox.checked = true;
  } else {
    bubbleGroup.style("visibility", "hidden");
    checkBox.checked = false;
  }
  /*
  const bubbleGroup = document
    .getElementById(elemParentID) // need this specific element if more than one d3 bubble map
    .getElementsByClassName("bubble-group")[0];

  const checkBox = document.getElementById("d3Check");
  if (bubbleGroup.style.visibility === "hidden") {
    bubbleGroup.style.visibility = "visible";
    checkBox.checked = true;
  } else {
    bubbleGroup.style.visibility = "hidden";
    checkBox.checked = false;
  }
*/
}

// const sidebarD3 = mapD3Bubble.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});

// Functions to create the charts runs last - after all the data is available
Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa]).then(() => {
  initD3Charts();

  Promise.allSettled([importGeoData]).then(() => {
    // The following require the above population data and the geoData
    circlePopnIMDChart = imdDomainD3({
      id: "selD3Leaf",
      thisMap: mapD3Bubble.map,
    });
    filterFunctionLsoa(true);
    //   .then(() => {
    //   recolourPopnLSOA();
    //   recolourIMDLayer(imdDomainShort);
    // });

    Promise.allSettled([promGeoDataGP, gpDetails]).then(() => {
      // Main practice site popup text. Requires practiceLookup
      // updatePopUpText(mapsWithGPMain.get(mapMain.map)[0]) // can be used to update an individual map
      for (const value of mapsWithGPMain.values()) {
        updatePopUpText(value[0]);
      }
    });
    // not sure if this is necessary...
    Promise.allSettled([
      promHospitalDetails,
      promGeoDataCYCWards,
      promGeoDataLsoaBoundaries,
      promDataIMD,
    ]).then(() => {
      // refreshes the overlaysTree to ensure everything is included and collapsed
      refreshMapOverlayControls();
    });
  });
});

// GP Associated Sites Map
/*
const mapSites = mapInitialise({
  mapDivID: "mapSites",
  // baselayer: "Grey",
  userOverlayGPSites: { inc: true, display: true },
  userOverlayCCGBoundary: { display: true },
});
mapSites.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapSites.homeButton();
mapStore.push(mapSites)
const sidebarSites = mapSites.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarSites.addPanel(sidebarContent.panelOverview);

mapSites.updateOverlay("selectedTrusts", overlayTrusts());
*/

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
//   label: "OS Feature Demo <i class='fa-solid fa-square-h'></i>",
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

// ###########################################################################################

// ############################### functions.js #######################################

// Function to create Title Case
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
// ############################### functions.js #######################################
