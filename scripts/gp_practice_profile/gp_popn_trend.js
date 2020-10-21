function initTrendChart(dataInit, id) {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const div = document.getElementById(id);

  /*
Line and marker transitions
	https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
*/

  // const practiceOptions = [],
  // 	practiceOptions2 = [];

  let yAxisZero = false;

  // Total by Period for initial Trend Chart
  const d = d3.rollup(
    dataInit,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => d.Period
  );

  // Practices by Period - Trend Chart Filtered
  const dataLevel_02 = d3.rollup(
    dataInit,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => d.Practice,
    (d) => +d.Period
  );

  // Trend by Period
  const svgTrend = d3
    .select(div)
    .append("svg")
    .attr("viewBox", "0 0 " + chtWidthWide + " " + (chtHeightShort + 100))
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xPeriod = d3.scaleTime().rangeRound([0, chtWidthWide - 120]),
    yValue = d3.scaleLinear().rangeRound([chtHeightShort, 0]);

  const xAxisPeriod = d3.axisBottom(xPeriod),
    yAxis = d3.axisLeft(yValue);

  svgTrend
    .append("g")
    .attr("class", "x axis")
    .attr("id", "axis--x")
    .attr("transform", "translate(0," + chtHeightShort + ")")
    .attr("x", chtWidthWide / 2)
    .attr("y", 30)
    .call(xAxisPeriod)
    .append("text")
    .attr("x", chtWidthWide / 2)
    .attr("y", 30)
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Period");

  svgTrend
    .append("g")
    .attr("class", "y axis")
    .attr("id", "axis--y")
    .call(yAxis)
    // text label for the y axis
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 10 - margin.left)
    .attr("x", 0 - chtHeightShort / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Population");

  const trendMarkers = svgTrend.append("g");

  svgTrend.append("g").append("path").attr("class", "trend-line");

  const plotLine = d3
    .line()
    // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
    .curve(d3.curveMonotoneX)
    .x(function (d) {
      return xPeriod(d.period);
    })
    .y(function (d) {
      return yValue(d.population);
    });

  // Toggle the y-axis on the trend chart to show 0 or nice
  const trendYAxisZero = document.getElementById("trend-yAxis");
  trendYAxisZero.addEventListener("click", function () {
    yAxisZero = trendYAxisZero.checked;
    chartTrendDraw();
  });

  // Define the div for the tooltip

  const tooltipTrend = newTooltip.tooltip(div);
  tooltipTrend.style("height", "40px");

  function chartTrendDraw() {
    let newData;
    if (!selectedPractice || selectedPractice === "All Practices") {
      // no practice selected, default
      newData = d;
    } else {
      newData = dataLevel_02.get(selectedPractice);
    }

    const arr = Array.from(newData, ([key, value]) => ({
      period: key,
      population: value,
    }));

    xPeriod.domain(d3.extent(newData.keys())).nice();
    // d3 transition
    const t = d3.transition("trend").duration(750).ease(d3.easeQuadInOut);

    svgTrend
      .select("#axis--x")
      .transition(t)
      .call(xAxisPeriod)
      .selectAll("text");

    if (yAxisZero) {
      yValue.domain([0, d3.max(newData.values())]).nice();
    } else {
      yValue.domain(d3.extent(newData.values())).nice();
    }

    svgTrend.select("#axis--y").transition(t).call(yAxis).selectAll("text");

    // https://observablehq.com/@d3/selection-join
    // Circle Markers
    trendMarkers
      .selectAll(".trend-circle") // trend circles
      .data(arr, function (d) {
        return d.period;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) =>
          enter
            .append("circle")
            // .datum(function (d, i) {
            //   let x, y;
            //   [x, y, i] = [d, data.get(d), i];
            //   // console.log([x, y, i])
            //   return [x, y, i];
            // })
            // mouse events need to go before any transitions
            .on("click", function (event, d) {
              selectedDate = d.period;
              console.log("selectedDate:", formatPeriod(d.period)); // selectedDate
              // line below needs to be selectAll (2 instances, current and new?)
              // this removes any previously applied formatting
              d3.selectAll(".trend-circle.highlight").attr(
                "class",
                "trend-circle"
              );
              const sel = d3.select(this);
              sel.raise();
              sel.classed("highlight", true);
              demographicChart.updateChtDemog(
                selectedPractice,
                selectedPracticeCompare
              );
              recolourLSOA();
            })
            .on("mouseover", function (event, d) {
              const sel = d3.select(this);
              sel.raise(); // brings the marker to the top
              sel.classed("highlight toTop", true);

              // console.log(event.target);
              const str = `<strong>${formatPeriod(
                new Date(d.period)
              )}</strong><br>
            <span style="color:red">
              ${formatNumber(d.population)}
              </span>`;
                newTooltip.counter++;
              newTooltip.mouseover(tooltipTrend, str, event);
            })
            .on("mouseout", function (event, d) {
              const sel = d3.select(this);
              sel.lower();
              sel.attr("class", "trend-circle faa-vertical animated-hover");
              sel.classed("highlight animated", function (d) {
                return d.period === selectedDate;
              });
              newTooltip.mouseout(tooltipTrend);
            })
            // .on("mouseleave", function () {
            //   const item = d3.select(this);

            // })
            // .on("mousemove", function (event, d) {

            // })
            .call((enter) =>
              enter
                .transition(t)
                // .delay(function ([x, y, i]) {
                //   // a different delay for each circle
                //   return i * 50;
                // })
                .attr("cy", function (d) {
                  return yValue(d.population);
                })
            ),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        // update.call((update) =>
        //   update.transition(t).attr("cy", function (d) {
        //     return yValue(data.get(yValue));
        //   })
        // ),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "trend-circle faa-vertical animated-hover")
      .classed("highlight animated", function (d) {
        return d.period === selectedDate;
      })
      .transition(t)
      .attr("r", 6)
      .attr("cx", function (d) {
        return xPeriod(d.period);
      })
      .attr("cy", function (d) {
        return yValue(d.population);
      })
      .style("fill", "rgba(70, 180, 130, 0.5");

    svgTrend
      .selectAll(".trend-line")
      .data([arr])
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.call((enter) => enter.append("path")),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "trend-line")
      .transition(t)
      .attr("d", plotLine);
  }

  return {
    chartTrendDraw: chartTrendDraw,
  };
}
