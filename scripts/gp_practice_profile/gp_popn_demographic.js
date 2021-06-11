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
    .attr("class", "axis x left")
    .attr("transform", translation(0, chtHeightShort));

  svgDemog
    .append("g")
    .attr("class", "axis x right")
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
