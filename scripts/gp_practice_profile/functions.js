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

function legendWrapper(placementID, legendID) {
  // https://observablehq.com/@mbostock/color-ramp
  // https://observablehq.com/@d3/color-legend

  function ramp(color, n = 512) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.style.margin = "14px 14px 0 14px";
    canvas.style.width = "calc(100% - 28px)";

    const w = canvas.width;
    // console.log(w);
    canvas.style.height = "100px";
    canvas.style.imageRendering = "-moz-crisp-edges";
    canvas.style.imageRendering = "pixelated";

    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect((i / n) * w, 0, 1, 100); // x, y, width, height
    }

    return canvas;
  }

  function legend({
    color,
    title,
    leftSubTitle,
    rightSubTitle,
    tickSize = 10,
    width = 500,
    height = 80 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 20,
    ticks = width / 64,
    tickFormat,
    tickValues,
  } = {}) {
    d3.select(`#${legendID.id}`).remove(); // remove the element (legend) if it already exists
    const canvasLocation = document.getElementById(placementID);

    const svg = d3
      .select(canvasLocation)
      .append("svg")
      .attr("id", legendID.id)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

    let tickAdjust = (g) =>
      g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;

    // Continuous
    if (color.interpolate) {
      const n = Math.min(color.domain().length, color.range().length);

      x = color
        .copy()
        .rangeRound(
          d3.quantize(d3.interpolate(marginLeft, width - marginRight), n)
        );

      svg
        .append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr(
          "href",
          ramp(
            color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))
          ).toDataURL()
        );
    }

    // Sequential
    else if (color.interpolator) {
      x = Object.assign(
        color
          .copy()
          .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {
          range() {
            return [marginLeft, width - marginRight];
          },
        }
      );

      svg
        .append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight) // having to add magic number to align width, not sure why?
        .attr("height", height - marginTop - marginBottom + 25)
        .attr("preserveAspectRatio", "none")
        .attr("href", ramp(color.interpolator()).toDataURL());

      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = d3
            .range(n)
            .map((i) => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }

    // Threshold
    else if (color.invertExtent) {
      const thresholds = color.thresholds
        ? color.thresholds() // scaleQuantize
        : color.quantiles
        ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

      const thresholdFormat =
        tickFormat === undefined
          ? (d) => d
          : typeof tickFormat === "string"
          ? d3.format(tickFormat)
          : tickFormat;

      x = d3
        .scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

      svg
        .append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", (d) => d);

      tickValues = d3.range(thresholds.length);
      tickFormat = (i) => thresholdFormat(thresholds[i], i);
    }

    // Ordinal
    else {
      x = d3
        .scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

      svg
        .append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

      tickAdjust = () => {};
    }

    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues)
      )
      .call(tickAdjust)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", width / 2)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text(title)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", marginLeft)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "red")
          .attr("text-anchor", "start")
          // .attr("font-weight", "bold")
          .text(leftSubTitle)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "red")
          .attr("text-anchor", "end")
          // .attr("font-weight", "bold")
          .text(rightSubTitle)
      );

    return svg.node();
  }

  return {
    legend: legend,
  };
}

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.replace(word[0], word[0].toUpperCase());
    })
    .join(" ");
}

// Function to create Title Case
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
