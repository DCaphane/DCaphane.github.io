mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

lsoaBoundary.call(mapPopn, true);

gpSites();
// (function addSitesToMap() {
//   const maps = [mapSites]; // maps to add sites to: mapPopn

//   for (const map of maps) {
//     gpSites.call(map);
//   }

//   // Add to overlay control
//   // const ol = overlayPCNs(layersMapGPSites);
//   // overlaysTreeSites.children[2] = ol;
//   // overlaysTreePopn.children[4] = ol;

//   // mapControlSites
//   // .setOverlayTree(overlaysTreeSites)
//   // .collapseTree() // collapse the baselayers tree
//   // // .expandSelected() // expand selected option in the baselayer
//   // .collapseTree(true);
// })();

Promise.all([
  dataPopulationGP,
  dataPopulationGPLsoa,
  geoDataLsoaBoundaries,
]).then((v) => {
  recolourLSOA();
  recolourIMDLayer(imdDomainShort);
  L.layerGroup(Array.from(layersMapIMD.values())).addTo(mapIMD.map);
  ccgBoundary(true);
});

// addPracticeToMap(mapPopn, layerControl2);
// geoDataGPMain.then(function(v){
//   addPracticeToMap(v, mapPopn, layerControl2)
// })

/*
GP by LSOA population data published quarterly
Use the below to match the selected dates to the quarterly dates
Function to determine nearest value in array
*/
const nearestValue = (arr, val) =>
  arr.reduce(
    (p, n) => (Math.abs(p) > Math.abs(n - val) ? n - val : p),
    Infinity
  ) + val;

let popnLegend = legendWrapper("footerMapPopn", "popnLegend");
let imdLegend = legendWrapper("footerMapIMD", "imdLegend");

function recolourLSOA() {
  const nearestDate = nearestValue(arrayGPLsoaDates, selectedDate);
  const maxValue =
    selectedPractice !== undefined && selectedPractice !== "All Practices"
      ? d3.max(data_popnGPLsoa.get(nearestDate).get(selectedPractice).values())
      : d3.max(data_popnGPLsoa.get(nearestDate).get("All").values());
  /*
  const rawPopn =
    selectedPractice !== undefined && selectedPractice !== "All Practices"
      ? [...data_popnGPLsoa.get(nearestDate).get(selectedPractice).values()]
      : [...data_popnGPLsoa.get(nearestDate).get("All").values()];

  const maxValue = d3.max(rawPopn);
  const colour = d3.scaleSequentialQuantile()
    .domain(rawPopn)
  .interpolator(d3.interpolateBlues)
*/
  filterFunctionLsoa.call(mapPopn, true);
  // refreshMapPopnLegend(maxValue);
  popnLegend.legend({
    color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
    title: "Population",
    width: 600,
    marginLeft: 50,
  });

  geoDataLsoaBoundaries.then(function () {
    layersMapLSOA.get("voyCCGPopn").eachLayer(function (layer) {
      const lsoaCode = layer.feature.properties.lsoa;

      let value =
        selectedPractice !== undefined && selectedPractice !== "All Practices"
          ? data_popnGPLsoa.get(nearestDate).get(selectedPractice).get(lsoaCode)
          : data_popnGPLsoa.get(nearestDate).get("All").get(lsoaCode);

      if (value === undefined) {
        value = 0;
      }

      if (value > minPopulationLSOA) {
        layer.setStyle({
          // https://github.com/d3/d3-scale-chromatic
          fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
          fillOpacity: 0.9,
          weight: 1, // border
          color: "white", // border
          opacity: 1,
          // dashArray: "3",
        });
      } else {
        layer.setStyle({
          // no (transparent) background
          fillColor: "#ff0000", // background
          fillOpacity: 0, // transparent
          weight: 0, // border
          color: "red", // border
          opacity: 0,
        });
      }

      layer.bindPopup(
        `<h3>${layer.feature.properties.lsoa}</h3>
          <p>${selectedPractice}</p>
          <p>${formatPeriod(nearestDate)}</p>
      Pop'n: ${formatNumber(value)}
      `
      );
    });
  });
}

function heatmapLegend(
  placementID,
  id,
  legendText
  // colourScheme = d3.interpolateYlGnBu
) {
  const legendID = id,
    // gradientID = `gradient_${id}`;
    footerMapPopn = document.getElementById(placementID);

  const svgLegend = d3
    .select(footerMapPopn)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
      ${chtWidthWide + margin.left + margin.right}
      ${chtHeightShort / 4}`
    )
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left - 20})`);

  const xScaleLegendMapPopn = d3
    .scaleLinear()
    // .domain([0, maxValue])
    .range([0, chtWidthWide])
    .nice();

  const xAxisLegendMapPopn = d3
    .axisBottom(xScaleLegendMapPopn)
    .tickFormat(formatNumber);

  svgLegend
    .append("g")
    // .attr("class", "x axis")
    .attr("id", legendID)
    .attr("transform", `translate(0, ${chtHeightShort / 4 - 33})`) // positions the axis
    .call(xAxisLegendMapPopn)
    .append("text")
    .attr("x", chtWidthWide / 2)
    .attr("dy", "30px") // positions the axis label text
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "#000000") // font colour
    .text(legendText);

  // axis sub headings
  d3.select(`#${legendID}`)
    .append("text")
    .attr("x", 0)
    .attr("dy", "30px") // positions the axis label text
    .style("text-anchor", "start")
    // .style("font-weight", "bold")
    .style("fill", "#ff0000") // font colour
    .text("High Deprivation");

  d3.select(`#${legendID}`)
    .append("text")
    .attr("x", chtWidthWide)
    .attr("dy", "30px") // positions the axis label text
    .style("text-anchor", "end")
    // .style("font-weight", "bold")
    .style("fill", "#ff0000") // font colour
    .text("Low Deprivation");

  function updateMapPopnLegend(
    maxValue = 1,
    colourScheme = d3.interpolateYlGnBu
  ) {
    // legend is made up from lots of small rect
    let noRect = 100; // how many rect make up the legend
    if (maxValue < 20) {
      noRect = maxValue;
      xScaleLegendMapPopn.domain([1, maxValue]);
    } else {
      xScaleLegendMapPopn.domain([0, maxValue]);
    }
    let defaultWidth = Math.floor(chtWidthWide / noRect); // approx size of each individual rect

    const data = d3.range(noRect), // array [0, 1, 2, ..., 99]
      xScale = d3
        .scaleLinear()
        .domain(d3.extent(data))
        .range([0, chtWidthWide - defaultWidth]);

    const colourScale = d3
      .scaleSequential()
      .interpolator(colourScheme)
      .domain(d3.extent(data));

    svgLegend
      .selectAll(".legendRect")
      .data(data)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "legendRect")
      .attr("x", function (d) {
        return Math.floor(xScale(d));
      })
      .attr("width", (d) => {
        if (d == 99) {
          return 6;
        }
        return Math.floor(xScale(d + 1)) - Math.floor(xScale(d)) + 1;
      })
      .attr("y", "0px")
      .attr("height", "30")
      .attr("fill", (d) => colourScale(d));
    // .attr("stroke", "red");

    svgLegend
      .select(`#${legendID}`)
      // .transition(t)
      .call(xAxisLegendMapPopn);
  }

  return updateMapPopnLegend;
}

// let refreshMapPopnLegend = heatmapLegend(
//   "footerMapPopn",
//   "mapPopnLegend",
//   "Population"
// );
// let refreshMapIMDLegend = heatmapLegend("footerMapIMD", "mapIMDLegend", "Rank");

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
    d3.select(`#${legendID}`).remove(); // remove the element (legend) if it already exists
    const canvasLocation = document.getElementById(placementID);

    const svg = d3
      .select(canvasLocation)
      .append("svg")
      .attr("id", legendID)
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
          "xlink:href",
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
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

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
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(leftSubTitle)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .attr("font-weight", "bold")
          .text(rightSubTitle)
      );

    return svg.node();
  }

  return {
    legend: legend,
  };
}
