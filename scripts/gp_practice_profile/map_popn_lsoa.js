mapPopn.scaleBar.addTo(mapPopn.map);

const sidebarPopn = mapPopn.sidebar("sidebar3");

homeButton.call(mapPopn);

// Panes to control zIndex of geoJson layers
mapPopn.map.createPane("lsoaBoundaryPane");
mapPopn.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapPopn.map.createPane("ccgBoundaryPane");
mapPopn.map.getPane("ccgBoundaryPane").style.zIndex = 374;

lsoaBoundary.call(mapPopn, true);

// GP Practice Sites - coded by PCN
geoDataPCNSites.then(function (v) {
  pcnSites.call(mapPopn);
});

Promise.all([
  dataPopulationGP,
  dataPopulationGPLsoa,
  geoDataLsoaBoundaries,
]).then((v) => {
  recolourLSOA();
  recolourIMDLayer();
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
          fillColor: d3.interpolateYlGnBu(value / maxValue),
          fillOpacity: 0.9,
          weight: 1, // border
          color: "red", // border
          opacity: 1,
          dashArray: "3",
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

function heatmapLegend(placementID, id, legendText, colourScheme = d3.interpolateYlGnBu) {
  const legendID = id,
    gradientID = `gradient_${id}`
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

  const countScale = d3.scaleLinear().domain([0, 1]).range([0, chtWidthWide]);

  //Calculate the variables for the temp gradient
  const numStops = 10;
  let countRange = countScale.domain();
  countRange[2] = countRange[1] - countRange[0];
  const countPoint = [];
  for (let i = 0; i < numStops; i++) {
    countPoint.push((i * countRange[2]) / (numStops - 1) + countRange[0]);
  }

  // fnDeriveRGB can be used to derive rgb colour schemes for the steps 0, 0.5 and 1
  // const fnDeriveRGB = d3.scaleSequential(colourScheme).domain([0, 1]); // eg. d3.interpolateYlGnBu
  const colourRange = [colourScheme(0), colourScheme(0.5), colourScheme(1)];
  var colourScale = d3.scaleLinear().domain([0, 0.5, 1]).range(colourRange);

  //Create the gradient
  svgLegend
    .append("defs")
    .append("linearGradient")
    .attr("id", gradientID)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data(d3.range(numStops))
    .enter()
    .append("stop")
    .attr("offset", function (d, i) {
      return countScale(countPoint[i]) / chtWidthWide;
    })
    .attr("stop-color", function (d, i) {
      return colourScale(countPoint[i]);
    });

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

  function updateMapPopnLegend(maxValue = 1) {
    xScaleLegendMapPopn.domain([0, maxValue]);
    svgLegend
      .select(`#${legendID}`)
      // .transition(t)
      .call(xAxisLegendMapPopn);

    svgLegend
      .selectAll(".bar")
      .data([0,1])
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
      .attr("class", "bar")
      .style("fill", `url(#${gradientID}`)
      .attr("y", "0px")
      .attr("width", function (d) {
        return xScaleLegendMapPopn(maxValue);
      })
      .attr("height", "30px");
  }

  return updateMapPopnLegend;
}

let refreshMapPopnLegend = heatmapLegend("footerMapPopn", "mapPopnLegend", "Population");
let refreshMapIMDLegend = heatmapLegend("footerMapIMD", "mapIMDLegend", "Rank", d3.interpolateRdGy);
