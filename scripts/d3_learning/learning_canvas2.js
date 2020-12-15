/*
http://www.datamake.io/blog/d3-canvas-full#manual
http://bl.ocks.org/larsvers/6049de0bcfa50f95d3dcbf1e3e44ad48
http://bl.ocks.org/larsvers/63927f8910028b2c090b9fc82b9f077d

*/

// const log = console.log.bind(console);
// const dir = console.dir.bind(console);

// const replace = function (string) {
//   return string.replace(/[^a-z0-9]/gi, "");
// };

function canvasLegend(placementID, id, colourScheme, value = 5000) {
  // === Set up canvas === //
  const width = 700,
    height = 400;

  let data = [];

  const canvasLocation = document.getElementById(placementID),
    idMain = id,
    idHidden = id + "Hidden",
    idTooltip = id + "Tooltip";

  // add a tooltip via div
  const div = document.createElement("div");
  div.setAttribute("id", idTooltip);
  div.setAttribute("class", "canvasTooltip");
  canvasLocation.appendChild(div);

  const mainCanvas = d3
    .select(canvasLocation)
    .append("canvas")
    .attr("id", idMain)
    .classed("mainCanvas", true)
    .attr("width", width - 60)
    .attr("height", height)
    .style("margin-left", "20px")
    .style("margin-top", "20px");

  const hiddenCanvas = d3
    .select(canvasLocation)
    .append("canvas")
    .attr("id", idHidden)
    .classed("hiddenCanvas", true)
    .attr("width", width)
    .attr("height", height);

  const colourToNode = new Map(); // map to track the colour of nodes

  // function to create new colours for the picking
  let nextCol = 1;

  function genColor() {
    const ret = [];
    // http://stackoverflow.com/a/15804183
    // https://oscarliang.com/what-s-the-use-of-and-0xff-in-programming-c-plus-p/
    // >> bit wise right shift operator, used to extract appropriate bits in colour codes
    if (nextCol < 16777215) {
      ret.push(nextCol & 0xff); // R
      ret.push((nextCol & 0xff00) >> 8); // G, bitwise right operator
      ret.push((nextCol & 0xff0000) >> 16); // B

      nextCol += 1;
    }
    const col = "rgb(" + ret.join(",") + ")";
    return col;
    /* output - paste gen function into console
    for (i=0; i<10000; i++){
      console.log(genColor(i))
  }
  */
  }

  // === Load and prepare the data === //

  d3.range(value).forEach(function (el) {
    data.push({ value: el }); // adds the object {value: el} to the data array []
  });

  // === Bind data to custom elements === //
  const customBase = document.createElement("custom");
  const custom = d3.select(customBase); // this is our svg replacement

  // settings for a grid with 40 cells in a row and 2x5 cells in a group
  const groupSpacing = 4;
  const cellSpacing = 2;
  const cellSize = Math.floor((width - 11 * groupSpacing) / 100) - cellSpacing;

  // === First call === //

  databind(data, colourScheme); // ...then update the databind function

  const t = d3.timer(function (elapsed) {
    draw(mainCanvas, false); // <--- new insert arguments
    if (elapsed > 300) t.stop();
  }); // start a timer that runs the draw function for 300 ms (this needs to be higher than the transition in the databind function)

  // === Bind and draw functions === //

  function databind(data, colourScheme = d3.interpolateSpectral) {
    const colorScale = d3.scaleSequential(colourScheme).domain(
      d3.extent(data, function (d) {
        return d.value;
      })
    );

    custom
      .selectAll("custom.rect")
      .data(data)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("custom").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) =>
          exit.call((exit) =>
            exit.transition().attr("width", 0).attr("height", 0).remove()
          )
      )
      .attr("class", "rect")
      .attr("x", function (d, i) {
        const x0 = Math.floor(i / 100) % 10,
          x1 = Math.floor(i % 10);
        return groupSpacing * x0 + (cellSpacing + cellSize) * (x1 + x0 * 10);
      })
      .attr("y", function (d, i) {
        const y0 = Math.floor(i / 1000),
          y1 = Math.floor((i % 100) / 10);
        return groupSpacing * y0 + (cellSpacing + cellSize) * (y1 + y0 * 10);
      })
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fillStyle", function (d) {
        return colorScale(d.value);
      })
      .attr("fillStyleHidden", function (d) {
        if (!d.hiddenCol) {
          d.hiddenCol = genColor();
          colourToNode.set(d.hiddenCol, d);
        } // here we (1) add a unique colour as property to each element and (2) map the colour to the node in the colourToNode-dictionary

        return d.hiddenCol;
      });
  }

  // === Draw canvas === //

  function draw(canvas, hidden) {
    // build context
    const context = canvas.node().getContext("2d");

    // clear canvas
    context.clearRect(0, 0, width, height);

    // draw each individual custom element with their properties
    const elements = custom.selectAll("custom.rect"); // this is the same as the join variable, but used here to draw

    elements.each(function (d, i) {
      // for each virtual/custom element...
      const node = d3.select(this);

      context.fillStyle = hidden
        ? node.attr("fillStyleHidden")
        : node.attr("fillStyle"); // <--- new: node colour depends on the canvas we draw
      context.fillRect(
        node.attr("x"),
        node.attr("y"),
        node.attr("width"),
        node.attr("height")
      );
    });
  } // draw()

  // === Listeners/handlers === //
  function reDrawSquares(n = 5000, colourScheme = d3.interpolateSpectral) {
    data = [];

    d3.range(n).forEach(function (el) {
      data.push({ value: el });
    });

    databind(data, colourScheme);

    const t = d3.timer(function (elapsed) {
      draw(mainCanvas, false);
      if (elapsed > 300) t.stop();
    }); // start a timer that runs the draw function for 300 ms (this needs to be higher than the transition in the databind function)
  }

  d3.select(`#${idMain}`).on("mousemove", function (event, d) {
    // draw the hiddenCanvas
    draw(hiddenCanvas, true);

    // get mousePositions from the main canvas
    const mouseX = event.layerX || event.offsetX;
    const mouseY = event.layerY || event.offsetY;

    // get the toolbox for the hidden canvas
    const hiddenCtx = hiddenCanvas.node().getContext("2d");

    // Now to pick the colours from where our mouse is then stringify it in a way our map-object can read it
    const col = hiddenCtx.getImageData(mouseX, mouseY, 1, 1).data;
    const colKey = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";

    // get the data from our map !
    const nodeData = colourToNode.get(colKey); // colourToNode[colKey];

    //   log(nodeData);

    if (nodeData) {
      // Show the tooltip only when there is nodeData found by the mouse

      d3.select(`#${idTooltip}`)
        .style("opacity", 0.8)
        .style("top", event.pageY + 5 + "px")
        .style("left", event.pageX + 5 + "px")
        .html(nodeData.value);
    } else {
      // Hide the tooltip when there our mouse doesn't find nodeData
      d3.select(`#${idTooltip}`).style("opacity", 0);
    }
  }); // canvas listener/handler

  return {
    reDrawSquares: reDrawSquares,
  };
}

var colours = [
  "interpolateBrBG",
  "interpolatePRGn",
  "interpolatePiYG",
  "interpolatePuOr",
  "interpolateRdBu",
  "interpolateRdGy",
  "interpolateRdYlBu",
  "interpolateRdYlGn",
  "interpolateSpectral",
  "interpolateBlues",
  "interpolateGreens",
  "interpolateGreys",
  "interpolateOranges",
  "interpolatePurples",
  "interpolateReds",
  "interpolateBuGn",
  "interpolateBuPu",
  "interpolateGnBu",
  "interpolateOrRd",
  "interpolatePuBuGn",
  "interpolatePuBu",
  "interpolatePuRd",
  "interpolateRdPu",
  "interpolateYlGnBu",
  "interpolateYlGn",
  "interpolateYlOrBr",
  "interpolateYlOrRd",
];

const canvasLegend_01 = canvasLegend(
  "container",
  "dummyLegendID",
  d3.interpolateSpectral
);
/* to update
canvasLegend_01.reDrawSquares(100)
canvasLegend_01.reDrawSquares(100, d3.interpolateSpectral)
*/
const canvasLegend_02 = canvasLegend(
  "container_01",
  "dummyLegendID_01",
  d3.interpolateGreys
);
