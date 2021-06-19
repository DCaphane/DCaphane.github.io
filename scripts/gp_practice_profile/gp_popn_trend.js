/*
Brush Resources

https://observablehq.com/@d3/focus-context
https://stackoverflow.com/q/65896903
https://stackoverflow.com/q/14665482

https://observablehq.com/@d3/brush-snapping-transitions

-- To Do
Add a bit to the x domain so the last month is completely visible
Add a bit to the y domain so the circles are visible (not below 0)
*/

function initTrendChart(dataInit, id) {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const div = document.getElementById(id);
  // Explanation of clip path: http://www.d3noob.org/2015/07/clipped-paths-in-d3js-aka-clippath.html
  const clipIdTrend = genID.uid("clip");
  // clipIdTrend = {id: "O-clip-1", href: "http://127.0.0.1:5501/d3_learning_focus.html#O-clip-1"}

  const margin = { top: 20, right: 20, bottom: 30, left: 60 },
    height = 300,
    width = 500,
    miniMapHeight = 100;

  /*
Line and marker transitions
	https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
*/

  let yAxisZero = false;
  let gb; // groupBrush
  let defaultSelection, fullRangeSelection;
  let dataArr; // stores the updated data (eg. after practice selected)
  let initialiseBool = true; // so the brush is only added to the chart once
  let brushRange; // store the position of the brush after it moves

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

  function xAxis(g, x, height) {
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      //height used as parameter but not passed as defined in outer scope in original
      d3
        .axisBottom(x)
        .ticks(chtWidthWide / 80)
        .tickSizeOuter(0)
    );
  }

  const x = d3
    .scaleTime()
    // .domain(d3.extent(data, (d) => d.period))
    .nice()
    .range([margin.left + 4, width - margin.right - 8]); // marker size, r = 6 + line size

  function yAxis(g, y, title) {
    const axis = g
      .attr("transform", `translate(${margin.left},0)`)
      // tick sizes here the width of the chart (used as minor gridlines)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)));

    // this removes the outside (square) border
    // https://github.com/d3/d3-axis/issues/48
    axis.call((g) => g.select(".domain").remove());

    // Inline formatting moved to css, .grid line
    // yAxis
    //   .selectAll("line")
    //   .style("stroke", "lightgrey")
    //   .style("opacity", "0.7")
    //   .style("shape-rendering", "crispEdges");

    axis.call((g) =>
      g
        .selectAll(".title")
        .data([title])
        .join("text")
        .attr("class", "title")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", 0 - chtHeightShort / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .attr("fill", "currentColor")
        .text(title)
    );
  }

  // function yGridlines(g, y) {
  //   const yGrid = g.attr("transform", `translate(${margin.left},0)`)
  //     .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(""))

  //   yGrid.select("path")
  //     .style("stroke","none")

  //     yGrid.selectAll("line")
  //     .style("stroke", "#eee")
  //   .style("shape-rendering", "crispEdges")
  //   .style("opacity", "0.8")
  // }

  const y = d3
    .scaleLinear()
    // .domain([0, d3.max(data, (d) => d.population)])
    // .domain(d3.extent(data, (d) => d.population))
    .range([height - margin.bottom - 3, margin.top + 2]);

  const yMini = d3.scaleLinear().rangeRound([miniMapHeight, 0]);

  function plotLine(x, y) {
    return (
      d3
        .line()
        // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
        .curve(d3.curveMonotoneX)
        .x(function (d) {
          return x(d.period);
        })
        .y(function (d) {
          return y(d.population);
        })
    );
  }

  function plotLineMini(x, y) {
    return (
      d3
        .line()
        // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
        .curve(d3.curveMonotoneX)
        .x(function (d) {
          return x(d.period);
        })
        .y(function (d) {
          return y(d.population);
        })
    );
  }

  // Trend by Period
  const svgTrend = d3
    .select(div)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block");
  // Review the following lines
  // .attr("preserveAspectRatio", "xMidYMid meet")
  // .append("g")
  // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svgTrend
    .append("clipPath")
    .attr("id", clipIdTrend.id)
    .append("rect")
    .attr("x", margin.left)
    .attr("y", 0)
    .attr("height", height - margin.bottom)
    .attr("width", width - margin.left - margin.right);

  const gridY = svgTrend.append("g"),
    mainGx = svgTrend.append("g"),
    mainGy = svgTrend.append("g").attr("class", "grid");

  /*
The order trendPath and trendMarkers determines which appears on top
To have the markers on top, draw the path (line) first and then 'paint' the circles on top
*/

  const trendPath = svgTrend
    .append("path")
    // .datum(dataArr)
    .attr("clip-path", clipIdTrend)
    .attr("class", "trend-line");

  const trendMarkers = svgTrend.append("g");
  trendMarkers.attr("clip-path", clipIdTrend);

  // Toggle the y-axis on the trend chart to show 0 or nice
  const trendYAxisZero = document.getElementById("trend-yAxis");
  trendYAxisZero.addEventListener("click", function () {
    yAxisZero = trendYAxisZero.checked;
    chartTrendDraw();
  });

  // Define the div for the tooltip

  const tooltipTrend = newTooltip.tooltip(div);
  tooltipTrend.style("height", "40px");

  // Minimap
  const svgMini = d3
    .select(div)
    .append("svg")
    .attr("viewBox", [0, 0, width, miniMapHeight])
    .style("display", "block");
  // .attr("preserveAspectRatio", "xMidYMid meet")
  // .append("g")
  // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // svgMini
  //   .append("g")
  //   .attr("class", "x axis")
  //   .attr("id", "axis--x--mini")
  //   .attr("transform", `translate(0, ${miniMapHeight})`)
  //   .attr("x", chtWidthWide / 2)
  //   .attr("y", 30)
  //   .call(xAxis);

  svgMini.append("path").attr("fill", "steelblue").attr("class", "trend-line");
  const selectedPeriodMini = svgMini.append("g");
  // const selectedPeriodMarker = d3.symbol().type(d3.symbolCircle).size(64);

  // svgMini
  //   .append("g")
  //   .attr("class", "y axis")
  //   .attr("id", "axis--y--mini")
  //   .call(yAxisMini);

  // Controls the brush range
  // Need to match the x-scale Range
  const brush = d3
    .brushX()
    .extent([
      [x.range()[0], 0.5],
      [x.range()[1], miniMapHeight - margin.bottom + 0.5],
      0,
    ]);
  // .on("brush", brushed)
  // .on("end", brushended);

  // custom handles
  // https://observablehq.com/@d3/brush-handles
  const brushHandle = (g, selection) =>
    g
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1.5)
            .attr("cursor", "ew-resize")
        // .attr("d", brushHandleStyle)
      )
      .attr("display", selection === null ? "none" : null)
      .attr(
        "transform",
        selection === null
          ? null
          : (d, i) => `translate(${selection[i]},${miniMapHeight - 60})`
      );

  // style brush resize handle
  // https://observablehq.com/@d3/brush-handles
  /*
  const brushHandleStyle = d3
    .arc()
    .innerRadius(0)
    .outerRadius(15)
    .startAngle(0)
    .endAngle((d, i) => (i ? Math.PI : -Math.PI));
    */

  function brushed({ selection }) {
    if (selection) {
      // console.log(selection)
      brushRange = selection;
      // update logic goes here - to get args for chartUpdate
      const [minX, maxX] = selection.map(x.invert, x).map(d3.utcMonth.round);
      const minY = d3.min(dataArr, (d) =>
        minX <= d.period && d.period <= maxX ? d.population : NaN
      );
      const maxY = d3.max(dataArr, (d) =>
        minX <= d.period && d.period <= maxX ? d.population : NaN
      );

      const focusX = x.copy().domain([minX, maxX]);
      let focusY;
      // consider testing for yAxisZero here
      if (yAxisZero) {
        focusY = y.copy().domain([0, maxY]);
      } else {
        focusY = y.copy().domain([minY, maxY]); // option to set minY to 0 here
      }
      // call chart update
      updateChart(focusX, focusY);
    }
    d3.select(this).call(brushHandle, selection);
  }

  // function moveBrush(brushExtent) {

  //       /* this is a copy of the brushed function
  //   Can be used externally to move brush by passing an array of the extent [a, b]
  //       */
  //   const minX = d3.utcMonth.round(x.invert(brushExtent[0]))
  //   const maxX = d3.utcMonth.round(x.invert(brushExtent[1]))
  //       const minY = d3.min(dataArr, (d) =>
  //         minX <= d.period && d.period <= maxX ? d.population : NaN
  //       );
  //       const maxY = d3.max(dataArr, (d) =>
  //         minX <= d.period && d.period <= maxX ? d.population : NaN
  //       );

  //       const focusX = x.copy().domain([minX, maxX]);
  //       let focusY;
  //       // consider testing for yAxisZero here
  //       if (yAxisZero) {
  //         focusY = y.copy().domain([0, maxY]);
  //       } else {
  //         focusY = y.copy().domain([minY, maxY]); // option to set minY to 0 here
  //       }
  //       // call chart update
  //       updateChart(focusX, focusY);

  //     // d3.select(this).call(brushHandle, selection);
  //   }

  // If click anywhere on miniMap chart, will jump back to the default selection
  // function brushended({ selection }) {
  //   if (!selection) {
  //     gb.call(brush.move, fullRangeSelection); // defaultSelection
  //   }
  // }

  function brushended(event) {
    const selection = event.selection;
    // If no selection (ie. user just clicks in brush area) then pick a default range
    if (!selection) {
      gb.call(brush.move, fullRangeSelection); // defaultSelection
    }
    if (!event.sourceEvent || !selection) return;
    // The below is used to snap the brush (ie. fix it the a given interval)
    const interval = d3.timeMonth.every(1);
    const [x0, x1] = selection.map((d) => interval.round(x.invert(d)));
    d3.select(this)
      .transition()
      .call(brush.move, x1 > x0 ? [x0, x1].map(x) : null);
  }

  function updateChart(focusX, focusY) {
    mainGx.call(xAxis, focusX, height);
    // gridY.call(yGridlines, focusY);
    mainGy.call(yAxis, focusY, "Population");
    trendPath.attr("d", plotLine(focusX, focusY));
    trendMarkers
      .selectAll(".trend-circle")
      .attr("cx", function (d) {
        return focusX(d.period);
      })
      .attr("cy", function (d) {
        if (d.population === undefined) {
          return focusY(0);
        } else {
          return focusY(d.population);
        }
      });
  }

  function updateMiniMarker() {
    // Used to display a marker showing the selected date
    selectedPeriodMini
      .selectAll("circle")
      .data(dataArr, function (d) {
        return d.period;
      })
      .classed("selected-period-marker", function (d) {
        return d.period === userSelections.selectedDate;
      })
      .style("opacity", function (d) {
        if (d.period === userSelections.selectedDate) {
          return 1;
        } else {
          return 0;
        }
      });
  }

  function chartTrendDraw() {
    let newData; // This is a map, use keys and values to retrieve values
    if (
      !userSelections.selectedPractice ||
      userSelections.selectedPractice === "All Practices"
    ) {
      // no practice selected, default
      newData = d;
    } else {
      newData = dataLevel_02.get(userSelections.selectedPractice);
    }

    dataArr = Array.from(newData, ([key, value]) => ({
      period: key,
      population: value,
    }));

    x.domain(d3.extent(newData.keys()));
    svgMini.append("g").call(xAxis, x, miniMapHeight);

    // d3 transition
    // const t = d3.transition("trend").duration(750).ease(d3.easeQuadInOut);

    if (yAxisZero) {
      // .domain(d3.extent(data, (d) => d.population)) // d3.max(data, (d) => d.population)
      y.domain([0, d3.max(newData.values())]).nice(); // this updates the actual data
    } else {
      y.domain(d3.extent(newData.values())).nice();
    }

    yMini.domain(d3.extent(newData.values())); // keep this to extent rather than 0. No need to .nice()

    // Add x and Y axes to main chart
    mainGx.call(xAxis, x, height);
    mainGy.call(yAxis, y);
    // Use this to set the inital brush position. ie. latest 2 years
    defaultSelection = [
      x(d3.utcYear.offset(d3.max(newData.keys()), -2)), // latest period - 2 years
      x(d3.max(newData.keys())), // latest date converted to width (range)
    ];
    // Alternative option to select the full period range
    fullRangeSelection = [
      x(d3.min(newData.keys())), // earliest date converted to width (range)
      x(d3.max(newData.keys())), // latest date converted to width (range)
    ];

    if (initialiseBool) {
      // only append the brush on the first call
      gb = svgMini.append("g").call(brush); // .call(brush.move, defaultSelection);

      brush.on("brush", brushed).on("end", brushended);
      // initialiseBool = false; // set this in last step
    }

    // svgTrend.select("#axis--y").transition(t).call(yAxis).selectAll("text");

    svgTrend
      .selectAll(".trend-line")
      .datum(dataArr)
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
      // .transition(t)
      .attr("d", plotLine(x, y.copy().range([height - margin.bottom, 4])));

    // https://observablehq.com/@d3/selection-join
    // Circle Markers
    trendMarkers
      .selectAll(".trend-circle") // trend circles
      .data(dataArr, function (d) {
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

            .call(
              (enter) => enter
              // .transition(t)
              // .delay(function ([x, y, i]) {
              //   // a different delay for each circle
              //   return i * 50;
              // })
              // .attr("cy", function (d) {
              //   return y(d.population);
              // })
            ),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        // update.call((update) =>
        //   update.transition(t).attr("cy", function (d) {
        //     return y(data.get(y));
        //   })
        // ),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .on("click", function (event, d) {
        userSelections.selectedDate = d.period;
        console.log("selectedDate:", formatPeriod(d.period)); // selectedDate
        // line below needs to be selectAll (2 instances, current and new?)
        // this removes any previously applied formatting
        d3.selectAll(".trend-circle.highlight").attr("class", "trend-circle");
        const sel = d3.select(this);
        sel.raise();
        sel.classed("highlight", true);
        updateMiniMarker();
        demographicChart.updateChtDemog(
          userSelections.selectedPractice,
          userSelections.selectedPracticeCompare
        );
        recolourLSOA();
        bubbleTest.updateD3BubbleLsoa();
      })
      .on("mouseover", function (event, d) {
        const sel = d3.select(this);

        sel.raise(); // brings the marker to the top
        sel.classed("highlight toTop", true);

        const pos = this.getBoundingClientRect();

        const str = `<strong>${formatPeriod(new Date(d.period))}</strong><br>
    <span style="color:red">
      ${formatNumber(d.population)}
      </span>`;
        newTooltip.counter++;
        newTooltip.mouseover(tooltipTrend, str, event, pos);
      })
      .on("mouseout", function (event, d) {
        const sel = d3.select(this);
        sel.lower();
        sel.attr("class", "trend-circle faa-vertical");
        sel.classed("highlight animated", function (d) {
          return d.period === userSelections.selectedDate;
        });
        newTooltip.mouseout(tooltipTrend);
      })
      // .on("mouseleave", function () {
      //   const item = d3.select(this);

      // })
      // .on("mousemove", function (event, d) {

      // })
      .attr("class", "trend-circle faa-vertical")
      .classed("highlight animated", function (d) {
        return d.period === userSelections.selectedDate;
      })
      // .transition(t)
      .attr("r", 5)
      .attr("cx", function (d) {
        return x(d.period);
      })
      .attr("cy", function (d) {
        return y(d.population);
      });
    // .style("fill", "rgba(70, 180, 130, 0.5");

    // svgTrend
    // .select("#axis--x")
    // .transition(t)
    // .call(xAxis)
    // .selectAll("text");

    // svgMini
    // .select("#axis--x--mini")
    // .transition(t)
    // .call(xAxis)
    // .selectAll("text");

    // svgMini
    //   .select("#axis--y--mini")
    //   .transition(t)
    //   .call(yAxisMini)
    // .selectAll("text");

    svgMini
      .selectAll(".trend-line")
      .datum(dataArr)
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
      // .transition(t)
      .attr(
        "d",
        plotLineMini(x, yMini.range([miniMapHeight - margin.bottom, 4]))
      );

    selectedPeriodMini
      .selectAll("circle") // trend circles
      .data(dataArr, function (d) {
        return d.period;
      })
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
      .attr("r", 3)
      .attr("cx", function (d) {
        return x(d.period);
      })
      .attr("cy", function (d) {
        yMini.range([miniMapHeight - margin.bottom, 4]);
        return yMini(d.population);
      });

    updateMiniMarker();

    // moveBrush(defaultSelection)
    if (initialiseBool) {
      gb.call(brush.move, defaultSelection); // fullRangeSelection
      initialiseBool = false;
    } else {
      gb.call(brush.move, brushRange);
    }
  }

  return {
    chartTrendDraw: chartTrendDraw,
  };
}
