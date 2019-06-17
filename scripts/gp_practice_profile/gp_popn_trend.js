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
  .x(function(d) {
    return xPeriod(d.key);
  })
  .y(function(d) {
    return yPeriod(d.value);
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

svgTrend
  .append("g")
  .append("path")
  .attr("class", "trend-line");

// Define the div for the tooltip
const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Tooltips
const tipTrend = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d, i) {
    return (
      "<strong>" +
      formatPeriod(d.key) +
      ':<br></strong> <span style="color:red">' +
      formatNumber(d.value) +
      "</span>"
    );
  });

svgTrend.call(tipTrend);

promise1.then(() => {
  let chtDataTrend = []; // Convert original data source to an array of objects
  chtDataTrend = dataLevel_01; // Total by Period for initial Trend Chart

  // format data
  chtDataTrend.forEach(function(d) {
    d.key = new Date(d.key); // period
    d.value = +d.value.total; // total population
  });
  // console.log(chtDataTrend)

  xPeriod
    .domain(
      d3.extent(chtDataTrend, function(d) {
        return d.key; // min and max periods
      })
    )
    .nice();

  chartTrendDraw(chtDataTrend);
});

function updateChtTrend(practiceCode) {
  let chtDataTrend = [];

  if (!practiceCode || practiceCode === "All Practices") {
    // no practice selected, default
    chtDataTrend = dataLevel_01;
  } else {
    dataLevel_02.forEach(function(d) {
      // this loops over the outer array, Practice by Period

      if (d.key === practiceCode) {
        const arr = []; // this is required to avoid over writing the original dataLevel_02

        arr.push(d.values); // creates an array of objects, Period by Total Pop'n
        arr[0].forEach(function(d) {
          const obj = {};
          obj.key = new Date(d.key); // period
          obj.value = +d.value.total; // total population
          chtDataTrend.push(obj);
        });
      }
    });
  }
  //console.log(chtDataTrend)

  chartTrendDraw(chtDataTrend);
}

function chartTrendDraw(data) {
  // d3 transition
  let t = d3
    .transition()
    .duration(750)
    .ease(d3.easeBounce);

  svgTrend
    .select("#axis--x")
    .transition(t)
    .call(xAxisPeriod)
    .selectAll("text");

  if (yAxisZero) {
    yPeriod
      .domain([
        0,
        d3.max(data, function(d) {
          return d.value;
        })
      ])
      .nice();
  } else {
    yPeriod
      .domain(
        d3.extent(data, function(d) {
          return d.value;
        })
      )
      .nice();
  }

  svgTrend
    .select("#axis--y")
    .transition(t)
    .call(yAxisPeriod)
    .selectAll("text");

  // https://observablehq.com/@d3/selection-join
  // Circle Markers
  trendMarkers
    .selectAll(".trend-circle") // trend circles
    .data(data, function(d) {
      return d.key; // period
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("circle")
          .attr("class", "trend-circle faa-vertical animated-hover")
          .classed("highlight animated", function(d) {
            return d.key.getTime() == selectedDate.getTime();
          })
          // mouse events need to go before any transitions
          .on("click", function(d) {
            selectedDate = d.key;
            console.log(selectedDate);
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
          })
          .on("mouseenter", tipTrend.show)
          .on("mouseover", function(d) {
            const sel = d3.select(this);
            sel.raise(); // brings the marker to the top
            sel.classed("highlight toTop", true);
          })
          .on("mouseout", function(d) {
            const sel = d3.select(this);
            sel.lower();
            sel.attr("class", "trend-circle faa-vertical animated-hover");
            sel.classed("highlight animated", function(d) {
              return d.key.getTime() == selectedDate.getTime();
            });
          })
          .on("mouseleave", tipTrend.hide)
          .attr("r", 6)
          .attr("cx", function(d) {
            return xPeriod(d.key);
          })
          .call(enter =>
            enter
              .transition(t)
              .delay(function(d, i) {
                // a different delay for each circle
                return i * 50;
              })
              .attr("cy", function(d) {
                return yPeriod(d.value);
              })
          ),
      (
        update // UPDATE old elements present in new data.
      ) =>
        update.call(update =>
          update.transition(t).attr("cy", function(d) {
            return yPeriod(d.value);
          })
        ),
      (
        exit // EXIT old elements not present in new data.
      ) => exit.call(exit => exit.transition(t).remove())
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
trendYAxisZero.addEventListener("click", function() {
  yAxisZero = trendYAxisZero.checked;
  updateChtTrend(selectedPractice);
});

/*
// Circle Markers - not sure how to impolemtn using this method
svgTrend
.selectAll(".trend-line") // trend circles
.datum(data)
.join(
  (
    enter // ENTER new elements present in new data.
  ) =>
    enter
      .append("path")
      .attr("class", "trend-line")
      // mouse events need to go before any transitions
      .attr("d", plotLine)
      .call(enter =>
        enter
          .transition(t)
          .delay(function(d, i) {
            // a different delay for each circle
            return i * 50;
          })
          .attr("d", plotLine)
      ),
  (
    update // UPDATE old elements present in new data.
  ) => update.call(update => update.transition(t).attr("d", plotLine)),
  (
    exit // EXIT old elements not present in new data.
  ) => exit.call(exit => exit.transition(t).remove())
);
*/
