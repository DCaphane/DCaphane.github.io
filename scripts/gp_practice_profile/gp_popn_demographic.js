/*
Based on this example:
    https://stackoverflow.com/questions/25044997/creating-population-pyramid-with-d3-js/25050764#25050764
    https://codepen.io/netkuy/pen/KzPaBe

    Transitions: https://gist.github.com/martinjc/7fa5deb1782da2fc6da15c3fad02c88b
    */

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
  .select("#cht_PopDemo")
  .append("svg")
  .attr(
    "viewBox",
    "0 0 " +
      (chtWidthWide + marginDemog.left + marginDemog.right) +
      " " +
      (chtHeightShort + marginDemog.top + marginDemog.bottom)
  ) // to ensure x-axis appears
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  // .attr("class", "inner-region")
  .attr(
    "transform",
    "translate(" + marginDemog.left + "," + marginDemog.top + ")"
  );

// the width of each side of the chart
const regionWidth = chtWidthWide / 2 - marginDemog.middle;

// these are the x-coordinates of the y-axes
const pointA = regionWidth, // the x-coordinate of the zero line for male population
  pointB = chtWidthWide - regionWidth; // the corresponding point for the female population

// Make groups for each side of chart
// scale(-1, 1) is used to reverse the left side so the bars grow left instead of right
let leftBarGroup, rightBarGroup;

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
  // Reverse the x-axis scale on the left side by reversing the range
  .tickFormat(function (d) {
    if (maxValue < 0.1) {
      return formatPercent1dp(d);
    } else {
      return formatPercent(d);
    }
  });

let xAxisRight = d3.axisBottom(xScaleRight).tickFormat(function (d) {
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
  .attr("class", "axis x left")
  .attr("transform", translation(0, chtHeightShort));

svgDemog
  .append("g")
  .attr("class", "axis x right")
  .attr("transform", translation(pointB, chtHeightShort));

function fnChartDemogData(data) {
  let chtDataDemog = data.get(selectedDate);
  // console.log(chtDataDemog);
  chartDemogDraw(chtDataDemog);
}

function updateChtDemog(practiceMain, practiceComp) {
  let chtDataP1, chtDataP2;

  // Main Practice Data
  if (selectedPractice === "Default") {
    practiceMain = undefined;
  }

  if (!practiceMain || practiceMain === "All Practices") {
    practiceMain = undefined;
    // no practice selected, undefined - use the original data source (All Practices)
    chtDataP1 = data_DemoInit.get(selectedDate);
  } else {
    chtDataP1 = dataLevel_04.get(practiceMain).get(selectedDate);
  }

  // Comparison Practice Data
  if (!practiceComp || practiceComp === "None") {
    practiceComp = undefined;
    // no practice comparison selected
    chtDataP2 = emptyDemog;
  } else if (practiceComp === "All Practices") {
    chtDataP2 = data_DemoInit.get(selectedDate);
  } else {
    chtDataP2 = dataLevel_04.get(practiceComp).get(selectedDate);
  }

  chartDemogDraw(chtDataP1, chtDataP2);
}

function chartDemogDraw(dataP1, dataP2 = emptyDemog) {
  // d3 transition
  let t = d3.transition().duration(750).ease(d3.easeBounce); // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe

  const tooltipL = newTooltip.tooltip("#cht_PopDemo"),
    tooltipR = newTooltip.tooltip("#cht_PopDemo");

  tooltipL.style("height", "60px");
  tooltipR.style("height", "60px");

  const totalPop1 = fnTotalPopulation(dataP1),
    totalPop2 = fnTotalPopulation(dataP2);
  // console.log({pop1: totalPop1, pop2: totalPop2})

  // find the maximum data value on either side
  // since this will be shared by both of the x-axes

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

  // https://observablehq.com/@d3/selection-join
  svgDemog
    .selectAll(".bar.left")
    .data(dataP1.keys(), function (d) {
      return d;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .datum(function (d, i) {
            let x, y;
            [x, y, i] = [dataP1.get(d), d, i];
            // console.log([x, y, i])
            return [x, y, i];
          })
          .attr("class", "bar left")
          // mouse events need to go before any transitions
          .on("click", function (event, [x, y, i]) {
            console.log("selAge:", y);
          })
          .on("mouseover", function (d) {
            const sel = d3.select(this);
            sel.attr("class", "bar hover");
            newTooltip.mouseover(sel, tooltipL);
          })
          .on("mousemove", function (event, [x, y, i]) {
            const str = `<strong>Male: ${y} yrs</strong><br>
            <span style="color:red">
              Popn: ${formatNumber(x.male)}
              </span><br>
            % Popn: ${formatPercent1dp(x.male / totalPop1)}
              `;
            newTooltip.tooltipText(tooltipL, str, event);
          })
          .on("mouseout", function (d) {
            const sel = d3.select(this);
            sel.attr("class", "bar left");
          })
          .on("mouseleave", function () {
            const item = d3.select(this);
            newTooltip.mouseleave(item, tooltipL);
          })
          .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
          .attr("y", function ([x, y, i]) {
            return yScale(y);
          })
          .call((enter) =>
            enter
              .transition(t)
              .delay(function ([x, y, i]) {
                // a different delay for each bar
                if (y.indexOf("-") > 0) {
                  return y.substring(0, y.indexOf("-")) * 10;
                } else {
                  return 85 * 10;
                }
              })
              .attr("width", function ([x, y, i]) {
                // console.log(x.male)
                return xScaleRight(x.male / totalPop1); // not sure why but xScaleLeft reverses this!
              })
              .attr("height", yScale.bandwidth())
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("width", function ([x, y, i]) {
              return xScaleRight(x.male / totalPop1); // not sure why left reverses this!
            })
            .attr("y", function ([x, y, i]) {
              return yScale(y);
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call((exit) => exit.transition(t).remove())
    );

  svgDemog
    .selectAll(".bar.right")
    .data(dataP1.keys(), function (d) {
      return d;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .datum(function (d, i) {
            let x, y;
            [x, y, i] = [dataP1.get(d), d, i];
            // console.log([x, y, i])
            return [x, y, i];
          })
          .attr("class", "bar right")
          .on("click", function (event, [x, y, i]) {
            console.log("selAge:", y);
          })
          .on("mouseover", function (d) {
            const sel = d3.select(this);
            sel.attr("class", "bar hover");
            newTooltip.mouseover(sel, tooltipR);
          })
          .on("mousemove", function (event, [x, y, i]) {
            const str = `<strong>Female: ${y} yrs</strong><br>
            <span style="color:red">
              Popn: ${formatNumber(x.female)}
              </span><br>
            % Popn: ${formatPercent1dp(x.female / totalPop1)}
              `;
            newTooltip.tooltipText(tooltipR, str, event);
          })
          .on("mouseout", function (d) {
            const sel = d3.select(this);
            sel.attr("class", "bar right");
          })
          .on("mouseleave", function () {
            const item = d3.select(this);
            newTooltip.mouseleave(item, tooltipR);
          })
          .attr("transform", translation(pointB, 0))
          .attr("y", function ([x, y, i]) {
            return yScale(y);
          })
          .call((enter) =>
            enter
              .transition(t)
              .delay(function ([x, y, i]) {
                // a different delay for each bar
                if (y.indexOf("-") > 0) {
                  return y.substring(0, y.indexOf("-")) * 10;
                } else {
                  return 85 * 10;
                }
              })
              .attr("width", function ([x, y, i]) {
                // console.log(x.female)
                return xScaleRight(x.female / totalPop1); // not sure why but xScaleLeft reverses this!
              })
              .attr("height", yScale.bandwidth())
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("width", function ([x, y, i]) {
              return xScaleRight(x.female / totalPop1); // not sure why left reverses this!
            })
            .attr("y", function ([x, y, i]) {
              return yScale(y);
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call((exit) => exit.transition(t).remove())
    );

  // Comparison Bars
  svgDemog
    .selectAll(".bar-comp.left")
    .data(dataP2.keys(), function (d) {
      return d;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .datum(function (d, i) {
            let x, y;
            [x, y, i] = [dataP2.get(d), d, i];
            // console.log([x, y, i])
            return [x, y, i];
          })
          .attr("class", "bar-comp left")
          // any mouse events required go here
          .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
          .attr("y", function ([x, y, i]) {
            return yScale(y) + 1;
          })
          .call((enter) =>
            enter
              .transition(t)
              .attr("width", function ([x, y, i]) {
                if (totalPop2 > 0) {
                  return xScaleRight(x.male / totalPop2); // not sure why but xScaleLeft reverses this!
                } else {
                  return 0;
                }
              })
              .attr("height", yScale.bandwidth() - 2)
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("width", function ([x, y, i]) {
              if (totalPop2 > 0) {
                return xScaleRight(x.male / totalPop2); // not sure why but xScaleLeft reverses this!
              } else {
                return 0;
              }
            })
            .attr("y", function ([x, y, i]) {
              return yScale(y) + 1;
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call((exit) => exit.transition(t).remove())
    );

  svgDemog
    .selectAll(".bar-comp.right")
    .data(dataP2.keys(), function (d) {
      return d;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .datum(function (d, i) {
            let x, y;
            [x, y, i] = [dataP2.get(d), d, i];
            // console.log([x, y, i])
            return [x, y, i];
          })
          .attr("class", "bar-comp right")
          .attr("transform", translation(pointB, 0))
          .attr("y", function ([x, y, i]) {
            return yScale(y) + 1;
          })
          .call((enter) =>
            enter
              .transition(t)
              .attr("width", function ([x, y, i]) {
                if (totalPop2 > 0) {
                  return xScaleRight(x.female / totalPop2); // not sure why but xScaleLeft reverses this!
                } else {
                  return 0;
                }
              })
              .attr("height", yScale.bandwidth() - 2)
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("width", function ([x, y, i]) {
              if (totalPop2 > 0) {
                return xScaleRight(x.female / totalPop2); // not sure why but xScaleLeft reverses this!
              } else {
                return 0;
              }
            })
            .attr("y", function ([x, y, i]) {
              return yScale(y) + 1;
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call((exit) => exit.transition(t).remove())
    );

  // Population over eg. 65
  const ageOver = 65; //greater than or equal to
  const selectedPop1 = formatPercent1dp(
    subPopulation(ageOver, dataP1) / totalPop1
  );
  d3.select("#circleOver65").html(selectedPop1);
  const selectedPop2 = formatPercent1dp(
    subPopulation(ageOver, dataP2) / totalPop2
  );
  // add check for totalPop2 is valid here
  d3.select("#circleOver65Compare").html(selectedPop2);
}

function translation(x, y) {
  return "translate(" + x + "," + y + ")";
}

function fnTotalPopulation(data) {
  // Get the total population size and create a function for returning the percentage
  let totalPop = 0;

  if (data.size > 0) {
    for (let value of data.values()) {
      totalPop += value.total;
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
