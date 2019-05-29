/*
Based on this example:
    https://stackoverflow.com/questions/25044997/creating-population-pyramid-with-d3-js/25050764#25050764
*/

const practiceLookup = new Map([
    ["B81036", "Pocklington"],
    ["B82005", "Priory Medical Group"]
])

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent

let totalPopulation,
  populationOver65,
  maxValue = 0;

// for the demographic chart layout
const marginDemo = {
  top: 5,
  right: 15,
  bottom: 40,
  left: 15,
  middle: 20
};

// Demographic breakdown (age, sex)
const svgDemo = d3
  .select("#cht_PopDemo")
  .append("svg")
  .attr(
    "viewBox",
    "0 0 " +
      (chtWidthWide + marginDemo.left + marginDemo.right) +
      " " +
      (chtHeightShort + marginDemo.top + marginDemo.bottom)
  ) // to ensure x-axis appears
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  // .attr("class", "inner-region")
  .attr(
    "transform",
    "translate(" + marginDemo.left + "," + marginDemo.top + ")"
  );

// the width of each side of the chart
const regionWidth = chtWidthWide / 2 - marginDemo.middle;

// these are the x-coordinates of the y-axes
const pointA = regionWidth, // the x-coordinate of the zero line for male population
  pointB = chtWidthWide - regionWidth; // the corresponding point for the female population

// the xScale goes from 0 to the width of a region
// it will be reversed for the left x-axis
const xScale = d3
  .scaleLinear()
  .range([0, regionWidth]) // can add an adjustment here but bars need adjusting...
  .nice();

// const xScaleLeft = d3.scaleLinear().range([regionWidth, 0]);
// const xScaleRight = d3.scaleLinear().range([0, regionWidth]);
const xAxisAdj = 0.0005; // used to prevent cut off of the xAxis labels
const xAxisRight = d3.axisBottom(xScale).tickFormat(function(d) {
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

const tickAdj = 2; // used to ensure y-axis text centres

// set up axes
const yAxisLeft = d3
  .axisRight(yScale)
  .tickSize(tickAdj, 0) // sets the length (in svg units) of the tick marks coming out from the axis.
  .tickPadding(marginDemo.middle - tickAdj); // how far away from the end of the tick mark the text-anchor of the label text is placed

const yAxisRight = d3
  .axisLeft(yScale)
  .tickSize(tickAdj, 0) // sets the length (in svg units) of the tick marks coming out from the axis (inner, outer)
  .tickFormat(""); // set to the empty string to remove tick labels from one of the axes, so that no overlapping occurs.

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

// tooltip
const tipDemoF = d3
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
      formatPercent1dp(d.value.female / totalPopulation) +
      "</span>"
    );
  });

const tipDemoM = d3
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
      formatPercent1dp(d.value.male / totalPopulation) +
      "</span>"
    );
  });

svgDemo.call(tipDemoF);
svgDemo.call(tipDemoM);

// ################  Demographics Chart for selected Practice and Period  ##########################
function chartDemographics(practiceCode, selectedDate) {
  svgDemo.selectAll("*").remove();

  let DateDemoInit = [],
    chtDataDemo = [];

  if (selectedPractice === "Default") {
    practiceCode = undefined;
  }

  // if (!practiceCode) {
  //   practiceCode = undefined;
  // }

  // console.log(practiceCode)

  if (!selectedDate) {
    selectedDate = new Date(selectedDate);
  }
  //console.log(selectedDate)

  if (!practiceCode) {
    practiceCode = undefined;
    // no practice selected, undefined
    data_DemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        // comparing dates
        Array.prototype.push.apply(chtDataDemo, d.values);
    });
  } else {
    dataLevel_04.forEach(function(d) {
      if (d.key === practiceCode)
        Array.prototype.push.apply(DateDemoInit, d.values);
    });

    DateDemoInit.forEach(function(d) {
      d.Period = new Date(d.key);
    });

    DateDemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        Array.prototype.push.apply(chtDataDemo, d.values);
    });
  }

  // console.log(DateDemoInit)
  // console.log(chtDataDemo)

  // format data
  chtDataDemo.forEach(function(d) {
    d.Period = new Date(d.key);
    d.male = +d.value.male;
    d.female = +d.value.female;
    d.Population = +d.value.total;
  });
  // console.log(chtDataDemo)

  // Make groups for each side of chart
  // scale(-1, 1) is used to reverse the left side so the bars grow left instead of right
  const leftBarGroup = svgDemo
    .append("g")
    .attr("transform", translation(pointA, 0) + "scale(-1, 1)");

  const rightBarGroup = svgDemo
    .append("g")
    .attr("transform", translation(pointB, 0));

  // Get the total population size and create a function for returning the percentage
  (totalPopulation = d3.sum(chtDataDemo, function(d) {
    return d.Population;
  })),
    (percentage = function(d) {
      return d / totalPopulation;
    });
  // console.log(totalPopulation)

  populationOver65 = 0;

  chtDataDemo.forEach(function(d) {
    if (d.key.substring(0, d.key.indexOf("-")) > 64) {
      populationOver65 = populationOver65 + d.Population;
    }
  });
  // console.log('Over65s: ' + populationOver65)
  // console.log('% 65s: ' + formatPercent(populationOver65 / totalPopulation))

  d3.select("#circleOver65").html(
    formatPercent1dp(populationOver65 / totalPopulation)
  );

  // find the maximum data value on either side
  // since this will be shared by both of the x-axes
  maxValue = Math.max(
    d3.max(chtDataDemo, function(d) {
      return percentage(d.male);
    }),
    d3.max(chtDataDemo, function(d) {
      return percentage(d.female);
    })
  );
  // console.log(maxValue)

  xScale.domain([0, maxValue + xAxisAdj]);
  // xScaleLeft.domain([0, maxValue]);
  // xScaleRight.domain([0, maxValue]);
  // yScale.domain(chtDataDemo.map(function(d) {return d.key; }))
  yScale.domain(ageBands);

  let xAxisLeft = d3
    .axisBottom(xScale.copy().range([pointA, 0]))
    // Reverse the x-axis scale on the left side by reversing the range
    .tickFormat(function(d) {
      if (maxValue < 0.1) {
        return formatPercent1dp(d);
      } else {
        return formatPercent(d);
      }
    });

  // Draw axes
  svgDemo
    .append("g")
    .attr("class", "axis y left")
    .attr("transform", translation(pointA, 0))
    .call(yAxisLeft)
    .selectAll("text")
    .style("text-anchor", "middle");

  svgDemo
    .append("g")
    .attr("class", "axis y right")
    .attr("transform", translation(pointB, 0))
    .call(yAxisRight);

  svgDemo
    .append("g")
    .attr("class", "axis x left")
    .attr("transform", translation(0, chtHeightShort))
    .call(xAxisLeft)
    // to rotate the axis text
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -7) // shifts text up (+) or down (-)
    .attr("dy", ".35em") // shifts text left (+) or right
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end");

  svgDemo
    .append("g")
    .attr("class", "axis x right")
    .attr("transform", translation(pointB, chtHeightShort))
    .call(xAxisRight)
    // to rotate the axis text
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -7) // shifts text up (+) or down (-)
    .attr("dy", ".35em") // shifts text left (+) or right
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end");

  // Draw bars
  leftBarGroup
    .selectAll(".bar.left")
    .data(chtDataDemo)
    .enter()
    .append("rect")
    .attr("class", "bar left")
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d.key);
    })
    .attr("width", function(d) {
      return xScale(percentage(d.male));
    })
    .attr("height", yScale.bandwidth())
    .on("mouseenter", tipDemoM.show)
    .on("mouseover", function(d) {
      d3.select(this).attr("class", "bar hover");
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("class", "bar left");
    })
    .on("mouseleave", tipDemoM.hide);

  rightBarGroup
    .selectAll(".bar.right")
    .data(chtDataDemo)
    .enter()
    .append("rect")
    .attr("class", "bar right")
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d.key);
    })
    .attr("width", function(d) {
      return xScale(percentage(d.female));
    })
    .attr("height", yScale.bandwidth())
    .on("mouseenter", tipDemoF.show)
    .on("mouseover", function(d) {
      d3.select(this).attr("class", "bar hover");
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("class", "bar right");
    })
    .on("mouseleave", tipDemoF.hide);
}

// ################  Demographics Chart Compare for selected Practice and Period  ##########################
function chartDemographicsCompare(practiceCode, selectedDate) {
  svgDemo.selectAll(".barComp").remove();

  let DateDemoInit = [],
    chtDataDemo = [];

  // if (selectedPractice === selectedPracticeCompare) {
  //    return; }

  if (selectedPracticeCompare === "None") {
    return;
  }

  if (selectedPracticeCompare === "Default") {
    practiceCode = undefined;
  }

  // if (!practiceCode) {
  //   practiceCode = undefined;
  // }

  // console.log(practiceCode)

  if (!selectedDate) {
    selectedDate = new Date(selectedDate);
  }
  // console.log(selectedDate)

  if (!practiceCode) {
    practiceCode = undefined;
    // no practice selected, undefined
    data_DemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        // comparing dates
        Array.prototype.push.apply(chtDataDemo, d.values);
    });
  } else {
    dataLevel_04.forEach(function(d) {
      if (d.key === practiceCode)
        Array.prototype.push.apply(DateDemoInit, d.values);
    });

    DateDemoInit.forEach(function(d) {
      d.Period = new Date(d.key);
    });

    DateDemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        Array.prototype.push.apply(chtDataDemo, d.values);
    });
  }

  // console.log(DateDemoInit)
  // console.log(chtDataDemo)

  // format data
  chtDataDemo.forEach(function(d) {
    d.Period = new Date(d.key);
    d.male = +d.value.male;
    d.female = +d.value.female;
    d.Population = +d.value.total;
  });
  // console.log(chtDataDemo)

  // Make groups for each side of chart
  // scale(-1, 1) is used to reverse the left side so the bars grow left instead of right
  let leftBarGroup = svgDemo
    .append("g")
    .attr("transform", translation(pointA, 0) + "scale(-1, 1)");
  let rightBarGroup = svgDemo
    .append("g")
    .attr("transform", translation(pointB, 0));

  // Get the total population size and create a function for returning the percentage
  let totalPopulationComp = d3.sum(chtDataDemo, function(d) {
      return d.Population;
    }),
    percentage = function(d) {
      return d / totalPopulationComp;
    };
  // console.log(totalPopulationComp)

  populationOver65 = 0;

  chtDataDemo.forEach(function(d) {
    if (d.key.substring(0, d.key.indexOf("-")) > 64) {
      populationOver65 = populationOver65 + d.Population;
    }
  });
  // console.log('Over65s: ' + populationOver65)
  // console.log('% 65s: ' + formatPercent(populationOver65 / totalPopulationComp))

  d3.select("#circleOver65Compare").html(
    formatPercent1dp(populationOver65 / totalPopulationComp)
  );

  // find the maximum data value on either side
  // since this will be shared by both of the x-axes
  /*
                  maxValue = Math.max(
                    d3.max(chtDataDemo, function(d) { return percentage(d.male); }),
                    d3.max(chtDataDemo, function(d) { return percentage(d.female); })
                  );
                  */
  // console.log(maxValue)

  xScale.domain([0, maxValue + xAxisAdj]);
  // xScaleLeft.domain([0, maxValue]);
  // xScaleRight.domain([0, maxValue]);
  // yScale.domain(chtDataDemo.map(function(d) {return d.key; }))
  yScale.domain(ageBands);

  // Draw bars
  leftBarGroup
    .selectAll(".barComp")
    .data(chtDataDemo)
    .enter()
    .append("rect")
    .attr("class", "barComp")
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d.key) + 1;
    })
    .attr("width", function(d) {
      return xScale(percentage(d.male));
    })
    .attr("height", yScale.bandwidth() - 2);

  rightBarGroup
    .selectAll(".barComp")
    .data(chtDataDemo)
    .enter()
    .append("rect")
    .attr("class", "barComp")
    .attr("x", 0)
    .attr("y", function(d) {
      return yScale(d.key) + 1;
    })
    .attr("width", function(d) {
      return xScale(percentage(d.female));
    })
    .attr("height", yScale.bandwidth() - 2);
}

function translation(x, y) {
  return "translate(" + x + "," + y + ")";
}
