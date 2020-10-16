/*
Line and marker transitions
	https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
*/

// const practiceOptions = [],
// 	practiceOptions2 = [];

let yAxisZero = false;

// Trend by Period
const svgTrend = d3
  .select("#cht_PopTrend")
  .append("svg")
  .attr("viewBox", "0 0 " + chtWidthWide + " " + (chtHeightShort + 100))
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xPeriod = d3.scaleTime().rangeRound([0, chtWidthWide - 120]),
  yPeriod = d3.scaleLinear().rangeRound([chtHeightShort, 0]);

const xAxisPeriod = d3.axisBottom(xPeriod),
  yAxisPeriod = d3.axisLeft(yPeriod);

const plotLine = d3
  .line()
  // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
  .curve(d3.curveMonotoneX)
  .x(function (d) {
    return xPeriod(d[0]);
  })
  .y(function (d) {
    return yPeriod(d[1]);
  });

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
  .call(yAxisPeriod)
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

// Define the div for the tooltip
const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function fnChartTrendData() {
  xPeriod.domain(d3.extent(dataLevel_01.keys())).nice();

  chartTrendDraw(dataLevel_01);
}

function updateChtTrend(practiceCode) {
  if (!practiceCode || practiceCode === "All Practices") {
    // no practice selected, default
    chartTrendDraw(dataLevel_01);
  } else {
    chartTrendDraw(dataLevel_02.get(practiceCode));
  }
}

function chartTrendDraw(data) {
  // d3 transition
  let t = d3.transition().duration(750).ease(d3.easeBounce);

  let tooltip = Tooltip("#cht_PopTrend");
  tooltip.style("height", "40px");

  svgTrend.select("#axis--x").transition(t).call(xAxisPeriod).selectAll("text");

  if (yAxisZero) {
    yPeriod.domain([0, d3.max(data.values())]).nice();
  } else {
    yPeriod.domain(d3.extent(data.values())).nice();
  }

  svgTrend.select("#axis--y").transition(t).call(yAxisPeriod).selectAll("text");

  // https://observablehq.com/@d3/selection-join
  // Circle Markers
  trendMarkers
    .selectAll(".trend-circle") // trend circles
    .data(data.keys(), function (d) {
      return d; // period
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("circle")
          .datum(function (d, i) {
            let x, y;
            [x, y, i] = [d, data.get(d), i];
            // console.log([x, y, i])
            return [x, y, i];
          })
          .attr("class", "trend-circle faa-vertical animated-hover")
          .classed("highlight animated", function ([x, y, i]) {
            return x === selectedDate;
          })
          // mouse events need to go before any transitions
          .on("click", function (event, [x, y, i]) {
            selectedDate = x;
            console.log("selectedDate:", formatPeriod(x)); // selectedDate
            // line below needs to be selectAll (2 instances, current and new?)
            // this removes any previously applied formatting
            d3.selectAll(".trend-circle.highlight").attr(
              "class",
              "trend-circle"
            );
            const sel = d3.select(this);
            sel.raise();
            sel.classed("highlight", true);
            updateChtDemog(selectedPractice, selectedPracticeCompare);
            recolourLSOA();
            // fnInitChartBarData(dataImport);
          })
          .on("mouseover", function () {
            const sel = d3.select(this);
            sel.raise(); // brings the marker to the top
            sel.classed("highlight toTop", true);
            mouseover(sel, tooltip);
          })
          .on("mouseout", function (d) {
            const sel = d3.select(this);
            sel.lower();
            sel.attr("class", "trend-circle faa-vertical animated-hover");
            sel.classed("highlight animated", function ([x, y, i]) {
              return x === selectedDate;
            });
          })
          .on("mouseleave", function () {
            const item = d3.select(this);
            mouseleave(item, tooltip);
          })
          .on("mousemove", function (event, [x, y, i]) {
            const str = `<strong>${formatPeriod(new Date(x))}</strong><br>
            <span style="color:red">
              ${formatNumber(y)}
              </span>`;
            tooltipText(tooltip, str, event);
          })
          .attr("r", 6)
          .attr("cx", function ([x, y, i]) {
            return xPeriod(x);
          })
          .call((enter) =>
            enter
              .transition(t)
              .delay(function ([x, y, i]) {
                // a different delay for each circle
                return i * 50;
              })
              .attr("cy", function ([x, y, i]) {
                return yPeriod(y);
              })
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call((update) =>
          update.transition(t).attr("cy", function ([x, y, i]) {
            return yPeriod(data.get(yPeriod));
          })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call((exit) => exit.transition(t).remove())
    );

  svgTrend
    .selectAll(".trend-line")
    .datum(data)
    .attr("class", "trend-line")
    .transition(t)
    .attr("d", plotLine);
}

// Toggle the y-axis on the trend chart to show 0 or nice
const trendYAxisZero = document.getElementById("trend-yAxis");
trendYAxisZero.addEventListener("click", function () {
  yAxisZero = trendYAxisZero.checked;
  updateChtTrend(selectedPractice);
});
