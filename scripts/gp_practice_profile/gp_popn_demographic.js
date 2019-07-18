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
  middle: 20
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

const xScaleLeft = d3
  .scaleLinear()
  .range([regionWidth, 0])
  .nice(); //  this reverses the direction of the scale (n to 0)
const xScaleRight = d3
  .scaleLinear()
  .range([0, regionWidth])
  .nice(); // (0 to n)
const xAxisAdj = 0.0005; // used to prevent cut off of the xAxis labels

let xAxisLeft = d3
  .axisBottom(xScaleLeft) // xScale.copy().range([pointA, 0])
  // Reverse the x-axis scale on the left side by reversing the range
  .tickFormat(function(d) {
    if (maxValue < 0.1) {
      return formatPercent1dp(d);
    } else {
      return formatPercent(d);
    }
  });

let xAxisRight = d3.axisBottom(xScaleRight).tickFormat(function(d) {
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
  "85+"
];

yScale.domain(ageBands);
const emptyDemog = emptyDemographic();

// tooltip
let tipDemoF = d3
  .tip()
  .attr("class", "d3-tip")
  .direction("n")
  .offset([-10, 0])
  .html(function(d, i) {
    return (
      "<strong>Female</strong><br>Age: " +
      d.key +
      '<br><span style="color:red">' +
      "Population: " +
      formatNumber(d.value.female) +
      "</span>" +
      '<br><span style="color:red">' +
      "% Total: " +
      formatPercent1dp(d.value.female / totalPop1) +
      "</span>"
    );
  });

let tipDemoM = d3
  .tip()
  .attr("class", "d3-tip")
  .direction("n")
  .offset([-10, 0])
  .html(function(d, i) {
    return (
      "<strong>Male</strong><br>Age: " +
      d.key +
      '<br><span style="color:red">' +
      "Population: " +
      formatNumber(d.value.male) +
      "</span>" +
      '<br><span style="color:red">' +
      "% Total: " +
      formatPercent1dp(d.value.male / totalPop1) +
      "</span>"
    );
  });

svgDemog.call(tipDemoF);
svgDemog.call(tipDemoM);

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

promise1.then(data => {
  let chtDataDemog = [];

  data.forEach(function(d) {
    if (d.Period.getTime() === selectedDate.getTime())
      chtDataDemog.push(d.values);
  });

  chartDemogDraw(chtDataDemog[0]);
});

function updateChtDemog(practiceMain, practiceComp) {
  const unfmtDataP1 = [],
    unfmtDataP2 = [],
    chtDataP1 = [],
    chtDataP2 = [];

  // Main Practice Data
  if (selectedPractice === "Default") {
    practiceMain = undefined;
  }

  if (!practiceMain || practiceMain === "All Practices") {
    practiceMain = undefined;
    // no practice selected, undefined - use the original data source (All Practices)
    data_DemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        // comparing dates
        chtDataP1.push(d.values);
    });
  } else {
    dataLevel_04.forEach(function(d) {
      if (d.key === practiceMain) {
        unfmtDataP1.push(d.values);

        unfmtDataP1[0].forEach(function(d) {
          if (new Date(d.key).getTime() === selectedDate.getTime())
            chtDataP1.push(d.values);
        });
      }
    });
  }

  // Comparison Practice Data
  if (!practiceComp) {
    practiceComp = undefined;
    // no practice comparison selected
    emptyDemog.forEach(function(d) {
      chtDataP2.push(d.values);
    });
  } else if (practiceComp === "All Practices") {
    data_DemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        // comparing dates
        chtDataP2.push(d.values);
    });
  } else {
    dataLevel_04.forEach(function(d) {
      if (d.key === practiceComp) {
        unfmtDataP2.push(d.values);

        unfmtDataP2[0].forEach(function(d) {
          if (new Date(d.key).getTime() === selectedDate.getTime())
            chtDataP2.push(d.values);
        });
      }
    });
  }

  chartDemogDraw(chtDataP1[0], chtDataP2[0]);
}

function chartDemogDraw(dataP1, dataP2 = emptyDemog) {
  // d3 transition
  let t = d3
    .transition()
    .duration(750)
    .ease(d3.easeBounce); // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe

  totalPop1 = fnTotalPopulation(dataP1);
  const totalPop2 = fnTotalPopulation(dataP2);

  // find the maximum data value on either side
  // since this will be shared by both of the x-axes
  maxValue = Math.max(
    d3.max(dataP1, function(d) {
      return d.value.male / totalPop1;
    }),
    d3.max(dataP1, function(d) {
      return d.value.female / totalPop1;
    }),
    d3.max(dataP2, function(d) {
      if (totalPop2 > 0) {
        return d.value.male / totalPop2;
      } else {
        return 0;
      }
    }),
    d3.max(dataP2, function(d) {
      if (totalPop2 > 0) {
        return d.value.female / totalPop2;
      } else {
        return 0;
      }
    })
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
    .data(dataP1, function(d) {
      return d.key;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .attr("class", "bar left")
          // mouse events need to go before any transitions
          .on("mouseenter", tipDemoM.show)
          .on("mouseover", function(d) {
            d3.select(this).attr("class", "bar hover");
          })
          .on("mouseout", function(d) {
            d3.select(this).attr("class", "bar left");
          })
          .on("mouseleave", tipDemoM.hide)
          .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
          .attr("y", function(d) {
            return yScale(d.key);
          })
          .call(enter =>
            enter
              .transition(t)
              // .delay(function(d, i) { // a different delay for each bar
              //   if (d.key.indexOf("-") > 0) {
              //   return d.key.substring(0, d.key.indexOf("-")) * 10;
              //   } else {
              //     return (85 * 10);
              //   }
              // })
              .attr("width", function(d) {
                return xScaleRight(d.value.male / totalPop1); // not sure why but xScaleLeft reverses this!
              })
              .attr("height", yScale.bandwidth())
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call(update =>
          update
            .transition(t)
            .attr("width", function(d) {
              return xScaleRight(d.value.male / totalPop1); // not sure why left reverses this!
            })
            .attr("y", function(d) {
              return yScale(d.key);
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call(exit => exit.transition(t).remove())
    );

  svgDemog
    .selectAll(".bar.right")
    .data(dataP1, function(d) {
      return d.key;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .attr("class", "bar right")
          .on("mouseenter", tipDemoF.show)
          .on("mouseover", function(d) {
            d3.select(this).attr("class", "bar hover");
          })
          .on("mouseout", function(d) {
            d3.select(this).attr("class", "bar right");
          })
          .on("mouseleave", tipDemoF.hide)
          .attr("transform", translation(pointB, 0))
          .attr("y", function(d) {
            return yScale(d.key);
          })
          .call(enter =>
            enter
              .transition(t)
              // .delay(function(d, i) { // a different delay for each bar
              //   if (d.key.indexOf("-") > 0) {
              //   return d.key.substring(0, d.key.indexOf("-")) * 10;
              //   } else {
              //     return (85 * 10);
              //   }
              // })
              .attr("width", function(d) {
                return xScaleRight(d.value.female / totalPop1); // not sure why but xScaleLeft reverses this!
              })
              .attr("height", yScale.bandwidth())
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call(update =>
          update
            .transition(t)
            .attr("width", function(d) {
              return xScaleRight(d.value.female / totalPop1); // not sure why left reverses this!
            })
            .attr("y", function(d) {
              return yScale(d.key);
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call(exit => exit.transition(t).remove())
    );

  // Comparison Bars
  svgDemog
    .selectAll(".bar-comp.left")
    .data(dataP2, function(d) {
      return d.key;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .attr("class", "bar-comp left")
          // any mouse events required go here
          .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
          .attr("y", function(d) {
            return yScale(d.key) + 1;
          })
          .call(enter =>
            enter
              .transition(t)
              .attr("width", function(d) {
                return xScaleRight(d.value.male / totalPop2); // not sure why but xScaleLeft reverses this!
              })
              .attr("height", yScale.bandwidth() - 2)
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call(update =>
          update
            .transition(t)
            .attr("width", function(d) {
              return xScaleRight(d.value.male / totalPop2); // not sure why left reverses this!
            })
            .attr("y", function(d) {
              return yScale(d.key) + 1;
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call(exit => exit.transition(t).remove())
    );

  svgDemog
    .selectAll(".bar-comp.right")
    .data(dataP2, function(d) {
      return d.key;
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .attr("class", "bar-comp right")
          .attr("transform", translation(pointB, 0))
          .attr("y", function(d) {
            return yScale(d.key) + 1;
          })
          .call(enter =>
            enter
              .transition(t)
              .attr("width", function(d) {
                return xScaleRight(d.value.female / totalPop2); // not sure why but xScaleLeft reverses this!
              })
              .attr("height", yScale.bandwidth() - 2)
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call(update =>
          update
            .transition(t)
            .attr("width", function(d) {
              return xScaleRight(d.value.female / totalPop2); // not sure why left reverses this!
            })
            .attr("y", function(d) {
              return yScale(d.key) + 1;
            })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call(exit => exit.transition(t).remove())
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
  const x = d3.sum(data, function(d) {
    return d.value.total;
  });
  // console.log(totalPop1)
  return x;
}

function subPopulation(age = 0, data) {
  let populationOver = 0;
  data.forEach(function(d) {
    if (d.key.substring(0, d.key.indexOf("-")) >= age) {
      populationOver += d.value.total;
    }
  });
  // console.log('Over65s: ' + populationOver)
  // console.log('% 65s: ' + formatPercent(populationOver / totalPop1))

  return populationOver;
}

function emptyDemographic() {
  let demog = [];
  let empty = { total: 0, male: 0, female: 0 };

  // create an empty
  ageBands.forEach(item => {
    const subGroup = {};
    subGroup.key = item;
    subGroup.value = empty;

    demog.push(subGroup);
  });

  return demog;
}
