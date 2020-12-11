mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

lsoaBoundary.call(mapPopn, true);


gpSites()
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
  refreshMapPopnLegend(maxValue);

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

  // testing only
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
    let noRect = 200; // how many rect make up the legend
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

let refreshMapPopnLegend = heatmapLegend(
  "footerMapPopn",
  "mapPopnLegend",
  "Population"
);
let refreshMapIMDLegend = heatmapLegend("footerMapIMD", "mapIMDLegend", "Rank");
