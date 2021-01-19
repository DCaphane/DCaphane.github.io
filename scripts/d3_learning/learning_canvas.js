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

// https://observablehq.com/@d3/color-legend
const example01 = legend({
  color: d3.scaleSequential([0, 100], d3.interpolateViridis),
  title: "Temperature (°F)",
});

const example02 = legend({
  color: d3.scaleSequentialSqrt([0, 1], d3.interpolateTurbo),
  title: "Speed (kts)",
});

const example03 = legend({
  color: d3.scaleDiverging([-0.1, 0, 0.1], d3.interpolatePiYG),
  title: "Daily change",
  tickFormat: "+%",
});

const example04 = legend({
  color: d3.scaleDivergingSqrt([-0.1, 0, 0.1], d3.interpolateRdBu),
  title: "Daily change",
  tickFormat: "+%",
});

const example05 = legend({
  color: d3.scaleSequentialLog([1, 100], d3.interpolateBlues),
  title: "Energy (joules)",
  ticks: 10,
  tickFormat: ".0s",
});

const example06 = legend({
  color: d3.scaleSequentialQuantile(
    Array.from({ length: 100 }, () => Math.random() ** 2),
    d3.interpolateBlues
  ),
  title: "Quantile",
  tickFormat: ".2f",
});

const example07 = legend({
  color: d3.scaleSqrt([-100, 0, 100], ["blue", "white", "red"]),
  title: "Temperature (°C)",
});

const example08 = legend({
  color: d3.scaleQuantize([1, 10], d3.schemePurples[9]),
  title: "Unemployment rate (%)",
});

const example09 = legend({
  color: d3.scaleQuantile(
    d3.range(1000).map(d3.randomNormal(100, 20)),
    d3.schemeSpectral[9]
  ),
  title: "Height (cm)",
  tickFormat: ".0f",
});

const example10 = legend({
  color: d3.scaleThreshold(
    [2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5],
    d3.schemeRdBu[9]
  ),
  title: "Unemployment rate (%)",
  tickSize: 0,
});

const example11 = legend({
  color: d3.scaleOrdinal(
    [
      "<10",
      "10-19",
      "20-29",
      "30-39",
      "40-49",
      "50-59",
      "60-69",
      "70-79",
      "≥80",
    ],
    d3.schemeSpectral[10]
  ),
  title: "Age (years)",
  tickSize: 0,
});

svg.append(example01);

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
