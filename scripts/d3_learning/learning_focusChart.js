/*
Focus and Context Charts
https://observablehq.com/@d3/focus-context
https://stackoverflow.com/questions/65896903/convert-observable-d3-js-brush-and-focus-example-to-jsfiddle

https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush
*/

let genID = generateUniqueID();
// const clipId = genID.uid("clip");

(async function learningFocusCharts() {
  const dateParse = d3.timeParse("%Y-%m-%d");
  const data = await d3.csv(
    "Data/d3_learning/aapl.csv",
    // this function is applied to each row of the imported data
    function processRow(d, index, columnKeys) {
      return {
        date: dateParse(d.date), // dd/mm/yyyy
        value: +d.value,
      };
    }
  );
  // Object.assign(data, {y: "↑ Close $"});

  const margin = { top: 20, right: 20, bottom: 30, left: 40 },
    height = 440,
    width = 600,
    miniMapHeight = 100;

  function xAxis(g, x, height) {
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(x)
        .ticks(width / 80)
        .tickSizeOuter(0)
    );
  }

  function yAxis(g, y, title) {
    g.attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".title")
          .data([title])
          .join("text")
          .attr("class", "title")
          .attr("x", -margin.left)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(title)
      );
  }

  const x = d3
    .scaleUtc()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([height - margin.bottom, margin.top]);

  function area(x, y) {
    return d3
      .area()
      .defined((d) => !isNaN(d.value))
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.value));
  }

  // Main Chart
  const svgMain = d3
    .select("#chtPopn")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block");

  const clipId = genID.uid("clip"); // { id: "clip" };
  // clipId = {id: "O-clip-1", href: "http://127.0.0.1:5501/d3_learning_focus.html#O-clip-1"}

  svgMain // const clip =
    // .append("defs")
    .append("clipPath")
    .attr("id", clipId.id)
    .append("rect")
    .attr("x", margin.left)
    .attr("y", 0)
    .attr("height", height)
    .attr("width", width - margin.left - margin.right);

  const mainGx = svgMain.append("g"),
    mainGy = svgMain.append("g");

  const mainPath = svgMain
    .append("path")
    .datum(data)
    .attr("clip-path", clipId)
    .attr("fill", "pink"); //steelblue

  const svgMini = d3
    .select("#chtPopnMiniMap")
    .append("svg")
    .attr("viewBox", [0, 0, width, miniMapHeight])
    .style("display", "block");

  const brush = d3
    .brushX()
    .extent([
      [margin.left, 0.5],
      [width - margin.right, miniMapHeight - margin.bottom + 0.5],
      0,
    ])
    .on("brush", brushed)
    .on("end", brushended);

    // let focusedArea = d3.extent(data, (d) => d.date); // d3.extent(x);
  const defaultSelection = [
    x(d3.utcYear.offset(x.domain()[1], -1)),
    x.range()[1],
  ];

  svgMini.append("g").call(xAxis, x, miniMapHeight);

  svgMini
    .append("path")
    .datum(data)
    .attr("fill", "steelblue")
    .attr("d", area(x, y.copy().range([miniMapHeight - margin.bottom, 4])));

    // custom handles
  // https://observablehq.com/@d3/brush-handles
    const brushHandle = (g, selection) => g
    .selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .join(
      enter => enter.append("path")
          .attr("class", "handle--custom")
          .attr("fill", "#666")
          .attr("fill-opacity", 0.8)
          .attr("stroke", "#aaa")
          .attr("stroke-width", 1.5)
          .attr("cursor", "ew-resize")
          .attr("d", brushHandleStyle)
    )
      .attr("display", selection === null ? "none" : null)
      .attr("transform", selection === null ? null : (d, i) => `translate(${selection[i]},${(miniMapHeight - 60)})`)


  // style brush resize handle
  // https://observablehq.com/@d3/brush-handles
  const brushHandleStyle = d3.arc()
  .innerRadius(0)
  .outerRadius(15)
  .startAngle(0)
  .endAngle((d, i) => i ? Math.PI : -Math.PI)

  const gb = svgMini.append("g").call(brush).call(brush.move, defaultSelection);



  // update brushed to sync chart with focus
  function brushed({ selection }) {
    if (selection) {
      // update logic goes here - to get args for chartUpdate
      const [minX, maxX] = selection.map(x.invert, x).map(d3.utcDay.round);
      const maxY = d3.max(data, (d) =>
        minX <= d.date && d.date <= maxX ? d.value : NaN
      );
      const focusX = x.copy().domain([minX, maxX]);
      const focusY = y.copy().domain([0, maxY]);

      // call chart update
      updateChart(focusX, focusY);
    }
    d3.select(this).call(brushHandle, selection);
  }

  function brushended({ selection }) {
    if (!selection) {
      gb.call(brush.move, defaultSelection);
    }
  }

  function updateChart(focusX, focusY) {
    mainGx.call(xAxis, focusX, height);
    mainGy.call(yAxis, focusY, data.y);
    mainPath.attr("d", area(focusX, focusY));
  }


})();

function generateUniqueID() {
  /*
  To generate a unique ID
  https://talk.observablehq.com/t/what-does-dom-uid-xxx-do/4015
  https://github.com/observablehq/stdlib/blob/master/src/dom/uid.js

  If you call fn.uid() once you get an object containing as property id the string "O-1". Call it again to get “O-2”.
  If you pass in a string it will be part of the unique identifier. e.g. call fn.uid('foo') the third time and you get the string "O-foo-3".
  */
  let count = 0;

  function uid(name) {
    function Id(id) {
      this.id = id;
      this.href = new URL(`#${id}`, location) + "";
    }

    Id.prototype.toString = function () {
      return "url(" + this.href + ")";
    };

    return new Id("O-" + (name == null ? "" : name + "-") + ++count);
  }

  return {
    uid: uid,
  };
}



// style brush resize handle
var brushHandlePath = d => {
  var e = +(d.type === "e"),
    x = e ? 1 : -1,
    y = contextChartHeight + 10;
  return (
    "M" +
    0.5 * x +
    "," +
    y +
    "A6,6 0 0 " +
    e +
    " " +
    6.5 * x +
    "," +
    (y + 6) +
    "V" +
    (2 * y - 6) +
    "A6,6 0 0 " +
    e +
    " " +
    0.5 * x +
    "," +
    2 * y +
    "Z" +
    "M" +
    2.5 * x +
    "," +
    (y + 8) +
    "V" +
    (2 * y - 8) +
    "M" +
    4.5 * x +
    "," +
    (y + 8) +
    "V" +
    (2 * y - 8)
  );
};
