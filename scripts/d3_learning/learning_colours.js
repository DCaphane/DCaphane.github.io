import { Tooltip } from "../modules/tooltip.mjs";
/*
Useful resources re: changes to eg. mouse events
Specifically, how to capture the index, i
  https://observablehq.com/@d3/d3v6-migration-guide
  https://observablehq.com/@d3/zoom-with-tooltip
  https://stackoverflow.com/questions/63693132/unable-to-get-node-datum-on-mouseover-in-d3-v6

  Tooltip:
  https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
*/

/*
https://github.com/d3/d3-scale-chromatic#api-reference
Color schemes are available as:
  - continuous interpolators (often used with d3.scaleSequential)
  - discrete schemes (often used with d3.scaleOrdinal).

Each scheme, such as d3.schemeBrBG, is represented as an array of arrays of hexadecimal color strings.
The kth element of this array contains the color scheme of size k;
For example, d3.schemeBrBG[9] contains an array of nine strings representing the nine colors of the brown-blue-green diverging color scheme.

Categorical
Diverging color schemes support a size k ranging from 3 to 11.
Sequential, single-hue color schemes support a size k ranging from 3 to 9
Sequential, multi-hue color schemes support a size k ranging from 3 to 9

*/

async function learningColourCharts() {
  const data = await d3.csv(
    "Data/d3_learning/ColourData.csv",
    // this function is applied to each row of the imported data
    function processRow(d, index, columnKeys) {
      return {
        Letter: d.Letter,
        rnd_var: +d.Rnd_Var,
      };
    }
  );

  // console.log(data);
  colourCharts01(data);
  colourCharts01a(data); // duplicate of above, used for testing toolbar
  colourCharts02(data);
}



// default variables
const margin = {
    top: 5,
    right: 0,
    bottom: 5,
    left: 5,
  },
  width = 900 - margin.left - margin.right,
  height = 80 - margin.top - margin.bottom,
  radius = 6;

function colourCharts01(data) {
  const defaultRadius = 15,
    formatNumber = d3.format(",.2f");
  const colour_01 = d3.scaleOrdinal(d3.schemeSpectral[11]);
  const length = data.length;

  const svg = appendSVG("#img_Colour_01");
  const tooltip = Tooltip();
  const tip = tooltip.createTooltip("#img_Colour_01");

  /* Define the data for the circles */
  var elem = svg.selectAll("g").data(data);

  /*Create and place the 'blocks' containing the circle and the text */
  var elemEnter = elem
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return `translate(${(width / length) * i}, ${height / 2})`;
    });

  // Example 01
  /*Create the circle for each block */
  var circle = elemEnter
    .append("circle")
    .attr("class", "circle")
    // .datum((d, i) => [d.Letter, d.rnd_var, i])
    .datum(function (d, i) {
      let x, y;
      [x, y, i] = [d.Letter, d.rnd_var, i];
      // console.log([x, y, i])
      return [x, y, i];
    })
    .attr("cx", defaultRadius) // ([, , i]) => (width / length) * i
    // .attr("cy", height / 2)
    .attr("r", defaultRadius)
    .style("fill", (d, i) => colour_01(i))
    .on("mouseover", function () {
      const item = d3.select(this);
      tooltip.mouseover(item, tip);
    })
    .on("mousemove", function (event, [d, n, i]) {
      const str = `<strong>${i}: ${d}</strong><br>
      <span style="color:red">
        ${d3.rgb(colour_01(i))}
        </span>`;
      tooltip.text(tip, str, event);
    })
    .on("mouseleave", function () {
      const item = d3.select(this);
      tooltip.mouseleave(item, tip);
    })
    .on("click", tooltip.click)
    .append("title")
    .text((d, i) => d, i);

  /* Create the text for each block */
  elemEnter
    .append("text")
    .attr("dx", defaultRadius)
    .attr("dy", -17)
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.Letter;
    });
}

function colourCharts01a(data) {
  const defaultRadius = 15,
    formatNumber = d3.format(",.2f");
  const colour_01 = d3.scaleOrdinal(d3.schemeOrRd[9]);
  const length = data.length;

  const svg = appendSVG("#img_Colour_01a");
  const tooltip = Tooltip();
  const tip = tooltip.createTooltip("#img_Colour_01a");

  const g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "circles");

  // Example 01
  let circle = g
    .selectAll("circle")
    .data(data)
    .join("circle")
    // .datum((d, i) => [d.Letter, d.rnd_var, i])
    .datum(function (d, i) {
      let x, y;
      [x, y, i] = [d.Letter, d.rnd_var, i];
      // console.log([x, y, i])
      return [x, y, i];
    })
    .attr("cx", ([, , i]) => (width / length) * i + 10)
    .attr("cy", height / 2)
    .attr("r", defaultRadius)
    .attr("fill", ([, , i]) => colour_01(i))
    .on("mouseover", function () {
      const item = d3.select(this);
      tooltip.mouseover(item, tip);
    })
    .on("mousemove", function (event, [d, n, i]) {
      const str = `<strong>${i}: ${d}</strong><br>
      <span style="color:red">
        ${d3.rgb(colour_01(i))}
        </span>`;
      tooltip.text(tip, str, event);
    })
    .on("mouseleave", function () {
      const item = d3.select(this);
      tooltip.mouseleave(item, tip);
    })
    .on("click", tooltip.click);
  // // .append("title")
  // // .text((d, i) => d, i)

  /* Create the text for each block
    Can't work out how to append text element after circle
    */
}

function colourCharts02(data) {
  const defaultRadius = 15,
    formatNumber = d3.format(",.2f");

  var colour_02 = d3
    .scaleOrdinal()
    .domain([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ])
    //.domain([data.map(function(d) {return d.Letter; })])
    .range([
      "#030139",
      "#1eff06",
      "#fe8504",
      "#1ff7fe",
      "#f701ff",
      "#2e4a02",
      "#ffaad5",
      "#f1ff8d",
      "#116aff",
      "#700111",
      "#1586c3",
      "#ff067d",
      "#0e02fb",
      "#1bffa1",
      "#921e8f",
      "#c49565",
      "#fd0128",
      "#4ea105",
      "#158279",
      "#c8fe0a",
      "#fdcc0b",
      "#834969",
      "#ff7673",
      "#05018b",
      "#c591fe",
      "#a6d8ab",
    ]);

  const length = data.length;

  const svg = appendSVG("#img_Colour_02");
  const tooltip = Tooltip();
  const tip = tooltip.createTooltip("#img_Colour_02");

  /* Define the data for the circles */
  var elem = svg.selectAll("g").data(data);

  /*Create and place the 'blocks' containing the circle and the text */
  var elemEnter = elem
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return `translate(${(width / length) * i}, ${height / 2})`;
    });

  // Example 02
  /*Create the circle for each block */
  var circle = elemEnter
    .append("circle")
    .attr("class", "circle")
    // .datum((d, i) => [d.Letter, d.rnd_var, i])
    .datum(function (d, i) {
      let x, y;
      [x, y, i] = [d.Letter, d.rnd_var, i];
      // console.log([x, y, i])
      return [x, y, i];
    })
    .attr("cx", defaultRadius) // ([, , i]) => (width / length) * i
    // .attr("cy", height / 2)
    .attr("r", defaultRadius)
    .style("fill", (d, i) => colour_02(i)) //  ([, , i]) => colour_02(i))
    .on("mouseover", function () {
      const item = d3.select(this);
      tooltip.mouseover(item, tip);
    })
    .on("mousemove", function (event, [d, n, i]) {
      const str = `<strong>${i}: ${d}</strong><br>
      <span style="color:red">
        ${d3.rgb(colour_02(i))}
        </span>`;
      tooltip.text(tip, str, event);
    })
    .on("mouseleave", function () {
      const item = d3.select(this);
      tooltip.mouseleave(item, tip);
    })
    .on("click", tooltip.click)
    .append("title")
    .text((d, i) => d, i);

  /* Create the text for each block */
  elemEnter
    .append("text")
    .attr("dx", defaultRadius)
    .attr("dy", -17)
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.Letter;
    });
}

// Execute
learningColourCharts();
d3ChartDemo();

function d3ChartDemo() {
  const theta = Math.PI * (3 - Math.sqrt(5)),
    radius = 6,
    step = radius * 2;

  const data = Array.from({ length: 2000 }, (_, i) => {
    const radius = step * Math.sqrt((i += 0.5)),
      a = theta * i;
    return [
      width / 2 + radius * Math.cos(a),
      height / 2 + radius * Math.sin(a),
    ];
  });

  const svg = d3
    .select("#img_Colour_03")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  const tooltip = Tooltip();

  const g = svg.append("g").attr("class", "circles");

  g.append("style").text(`
    .circles {
      stroke: transparent;
      stroke-width: 1.5px;
    }
    .circles circle:hover {
      stroke: black;
    }
`);

  g.selectAll("circle")
    .data(data)
    .join("circle")
    // .datum(([x, y], i) => [x, y, i])
    .datum(function (d, i) {
      let x, y;
      [x, y, i] = [d[0], d[1], i];
      //   console.log([x, y, i])
      return [x, y, i];
    })
    .attr("cx", ([x]) => x)
    .attr("cy", ([, y]) => y)
    .attr("r", radius)
    .attr("fill", ([, , i]) => d3.interpolateRainbow(i / 360))
    .on("mousedown", tooltip.mousedowned)
    .on("click", tooltip.click)
    .append("title")
    .text((d, i) => d[0]); //`circle ${i}`);

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([1, 8])
      .on("zoom", zoomed)
  );

  function zoomed({ transform }) {
    g.attr("transform", transform);
  }
}

function appendSVG(id, margin = { top: 5, right: 0, bottom: 5, left: 20 }) {
  const width = 900 - margin.left - margin.right,
    height = 80 - margin.top - margin.bottom;

  let s = d3
    .select(id)
    .append("svg")
    .attr(
      "viewBox",
      "0 0 " +
        (width + margin.left + margin.right) +
        " " +
        (height + margin.top + margin.bottom)
    );

  return s;
}
