import { ramp, legend } from "../modules/colourRamps.mjs";

const div = document.getElementById("explore_01");
const ramp1 = ramp(d3.interpolateRainbow, 300); // d3.interpolateViridis, 12
div.append(ramp1); // check difference append vs appendChild

// const div = document.getElementById("#legendTesting");
const addSVG = appendSVG("#legendTesting").attr("id", "bob");
const svg = document.getElementById("legendTesting");
// const test = d3.select("#bob")
//   .append("canvas")
//   .attr("id", "canvasLegend")
//   .attr("class", "colourRamp")
//   .attr("width", 500)
//   .attr("height", 100);

const test2 = legend({
  color: d3.scaleSequentialLog([1, 100], d3.interpolateBlues),
  title: "Energy (joules)",
  ticks: 10,
  tickFormat: ".0s",
});

svg.append(test2);

var chart = d3.select("#myCanvas");
var context = chart.node().getContext("2d");
var data = [1, 2, 13, 20, 23];

var scale = d3.scaleLinear().range([10, 390]).domain([1, 23]);

data.forEach(function (d, i) {
  context.beginPath();
  context.rect(scale(d), 150, 10, 10);
  context.fillStyle = "red";
  context.fill();
  context.closePath();
});

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

function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  return false;
}
