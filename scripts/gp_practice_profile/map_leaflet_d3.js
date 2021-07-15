let imdDomainDescD3 = "Population",
  imdDomainShortD3 = "Population";

function imdDomainD3(id = "selD3Leaf") {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const div = document.getElementById(id);
  // Create the drop down to sort the chart
  const span = document.createElement("div");

  span.setAttribute("class", "search");
  span.textContent = "Domain: ";
  div.appendChild(span);

  // Add a drop down
  const frag = document.createDocumentFragment(),
    select = document.createElement("select");

  select.setAttribute("class", "dropdown-input");
  select.setAttribute("id", "selImdDomainD3");

  // Option constructor: args text, value, defaultSelected, selected
  select.options.add(new Option("Population", 0, true, true));
  let counter = 1; // start at 1 and append population as 0 option
  for (let key of mapIMDDomain.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    imdDomainDescD3 = d3.select("#selImdDomainD3 option:checked").text();
    if (imdDomainDescD3 !== "Population") {
      imdDomainShortD3 = mapIMDDomain.get(imdDomainDescD3).datasetDesc;
    } else {
      imdDomainShortD3 = "Population";
    }
    console.log(imdDomainDescD3);
    updateBubbleColour(imdDomainShortD3);
  });

  // Define the div for the tooltip
  const tooltipD3Lsoa = newTooltip.tooltip(div);
  tooltipD3Lsoa.style("height", "65px").style("width", "160px");

  // add SVG to Leaflet map via Leaflet
  const svgLayer = L.svg();
  svgLayer.addTo(mapD3Bubble.map);

  const svg = d3.select("#mapIMDD3").select("svg"),
    g = svg.select("g");

  // svg for bubble legend
  const bubbleLegend = d3
    .select("#footerMapD3Leaf")
    .append("svg")
    .attr("width", "100")
    .attr("height", "50")
    .attr("viewBox", [0, 0, 100, 50])
    // .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("class", "bubble-legend");

  // Project any point to map's current state
  function projectPoint(x, y) {
    const point = mapD3Bubble.map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  // is this used?
  const transform = d3.geoTransform({ point: projectPoint }),
    path = d3.geoPath().projection(transform);

  let d3BubbleEnter;

  function updateBubbleColour(defaultIMD = "Population") {
    if (defaultIMD !== "Population") {
      const rawValues = dataIMD.map(function (d) {
        return d[defaultIMD];
      });
      // console.log(rawValues)

      const colour = mapIMDDomain.get(imdDomainDescD3).scale(rawValues);

      lsoaCentroidLegend.legend({
        color: colour, //mapIMDDomain.get(imdDomainDesc).legendColour(rawValues),
        title: mapIMDDomain.get(imdDomainDesc).legendTitle,
        leftSubTitle: mapIMDDomain.get(imdDomainDesc).leftSubTitle,
        rightSubTitle: mapIMDDomain.get(imdDomainDesc).rightSubTitle,
        tickFormat: mapIMDDomain.get(imdDomainDesc).tickFormat,
        width: 600,
        marginLeft: 50,
      });

      d3BubbleEnter.style("fill", function (d) {
        let obj = dataIMD.find((x) => x.lsoa === d.lsoa);
        if (obj !== undefined) {
          // console.log(obj[defaultIMD], maxValue);
          const value = obj[defaultIMD];
          return colour(value);
        } else {
          return null;
        }
      });
    } else {
      // Style and legend for population
      const maxValue =
        userSelections.selectedPractice !== undefined &&
        userSelections.selectedPractice !== "All Practices"
          ? d3.max(
              dataPopulationGPLsoa
                .get(userSelections.nearestDate())
                .get(userSelections.selectedPractice)
                .values()
            )
          : d3.max(
              dataPopulationGPLsoa
                .get(userSelections.nearestDate())
                .get("All")
                .values()
            );

      lsoaCentroidLegend.legend({
        color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
        title: "Population",
        width: 600,
        marginLeft: 50,
      });

      d3BubbleEnter.style("fill", function (d) {
        return d3.interpolateYlGnBu(d.lsoaPopulation / maxValue);
      });
    }
  }

  const lsoaCentroidDetails = [];

  // v is the full dataset
  // console.log(v);

  /* From the LSOA polygon, populate an array of objects showing:
     lsoa name, polygon center, default to 0 population as will subsequently be derived
    Can derive the geometric centre using geoDataLsoaBoundaries and .getCenter()
    Population centroid figures are published
     */
  L.geoJson(geoDateLsoaPopnCentroid, {
    onEachFeature: function (feature, layer) {
      let obj = {};
      obj.lsoa = layer.feature.properties.lsoa11cd; // lsoa code
      // obj.lsoaCentre = layer.getBounds().getCenter(); // geometric centre of the layer polygon (lsoa)
      const coordsLngLat = layer.feature.geometry.coordinates;
      obj.lsoaCentre = [coordsLngLat[1], coordsLngLat[0]]; // reverse order of LngLat to LatLng
      obj.lsoaPopulation = 0;
      lsoaCentroidDetails.push(obj);
    },
  });

  // Initialise D3 Circle Map
  updateD3BubbleLsoa();

  userSelections.selectedDate;

  function updateD3BubbleLsoa() {
    // Update the population details
    lsoaCentroidDetails.forEach((lsoa) => {
      let value =
        userSelections.selectedPractice !== undefined &&
        userSelections.selectedPractice !== "All Practices"
          ? dataPopulationGPLsoa
              .get(userSelections.nearestDate())
              .get(userSelections.selectedPractice)
              .get(lsoa.lsoa)
          : dataPopulationGPLsoa
              .get(userSelections.nearestDate())
              .get("All")
              .get(lsoa.lsoa);

      if (value === undefined) {
        value = 0;
      }
      lsoa.lsoaPopulation = value;
    });

    const maxValue = d3.max(lsoaCentroidDetails, function (d) {
        return d.lsoaPopulation;
      }),
      maxValueNice = Math.ceil(maxValue / 100) * 100; //  round to the nearest 100

    const radius = d3
      .scaleSqrt()
      .domain([0, maxValue]) // 1e4 or 10,000
      .range([0, 20]);

    const d3BubbleSelection = g.selectAll("circle").data(
      lsoaCentroidDetails.sort(
        // sort the bubbles so smaller populations appear above larger population
        function (a, b) {
          return b.lsoaPopulation - a.lsoaPopulation;
        },
        function (d) {
          return d.lsoa;
        }
      )
    );

    d3BubbleEnter = d3BubbleSelection
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
      .on("click", function (event, d) {
        console.log(d.lsoa);
        const pos = this.getBoundingClientRect();
        const str = `LSOA: <strong>${
          d.lsoa
        }</strong><br>Pop'n: <span style="color:red">${formatNumber(
          d.lsoaPopulation
        )}</span>`;

        let subString;
        if (imdDomainDescD3 !== "Population") {
          let obj = dataIMD.find((x) => x.lsoa === d.lsoa);

          if (obj !== undefined) {
            const value = obj[imdDomainShortD3];

            subString = `<br><strong>${imdDomainDescD3}:
          </strong><span style="color:red">${formatNumber(value)}</span>`;
          } else {
            return "";
          }
        }

        newTooltip.counter++;
        newTooltip.mouseover(tooltipD3Lsoa, str + subString, event, pos);
      })
      .on("mouseover", function (event, d) {
        const sel = d3.select(this);
        sel.classed("hover", true);
        sel.raise();
        sel.style("fill-opacity", 1);
        const pos = this.getBoundingClientRect();
        const str = `LSOA: <strong>${
          d.lsoa
        }</strong><br>Pop'n: <span style="color:red">${formatNumber(
          d.lsoaPopulation
        )}</span>`;

        let subString;

        if (imdDomainDescD3 !== "Population") {
          let obj = dataIMD.find((x) => x.lsoa === d.lsoa);

          if (obj !== undefined) {
            const value = obj[imdDomainShortD3];

            subString = `<br><strong>${imdDomainDescD3}:
          </strong><span style="color:red">${formatNumber(value)}</span>`;
          } else {
            return "";
          }
        } else {
          subString = "";
        }
        //  // Option to return IMD Rank as a default option instead of "" above
        // else {
        //   let obj = dataIMD.find((x) => x.lsoa === d.lsoa);

        //   if (obj !== undefined) {
        //     const value = obj.imdRank;

        //     subString = `<br><strong>IMD Rank:
        //   </strong><span style="color:red">${formatNumber(value)}</span>`;
        //   } else {
        //     return "";
        //   }
        // }

        newTooltip.counter++;
        newTooltip.mouseover(tooltipD3Lsoa, str + subString, event, pos);
      })
      .on("mouseout", function (event, d) {
        const sel = d3.select(this);
        sel.classed("hover", false);
        sel.lower();
        sel.style("fill-opacity", 0.7);
        newTooltip.mouseout(tooltipD3Lsoa);
      })
      .attr("class", "bubble")
      .attr("r", function (d) {
        return radius(d.lsoaPopulation);
      })
      // .style("fill", function (d) {
      //   return d3.interpolateYlGnBu(d.lsoaPopulation / maxValue);
      // })
      .style("fill-opacity", function (d) {
        const lsoaCode = d.lsoa;

        let value =
          userSelections.selectedPractice !== undefined &&
          userSelections.selectedPractice !== "All Practices"
            ? dataPopulationGPLsoa
                .get(userSelections.nearestDate())
                .get(userSelections.selectedPractice)
                .get(lsoaCode)
            : dataPopulationGPLsoa
                .get(userSelections.nearestDate())
                .get("All")
                .get(lsoaCode);

        if (value > minPopulationLSOA) {
          return 0.7;
        } else {
          return 0.1;
        }
      })
      .style("pointer-events", "all");

    refreshBubbles();
    updateBubbleColour(imdDomainShortD3); // ensures colour matches dropdown

    const legendData = [maxValue / 10, maxValue / 2, maxValue];
    const d3BubbleLegend = bubbleLegend
      .selectAll(".bubble-legend")
      .data(legendData)
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
      .attr("class", "bubble-legend")
      .attr("transform", "translate(50,50)") // this is bubbleLegend svg width / 2, and move to bottom
      .attr("cy", function (d) {
        return -radius(d);
      })
      .attr("r", radius);

    const d3BubbleLegendText = bubbleLegend
      .selectAll(".bubble-legend-text")
      .data(legendData)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) =>
          enter
            .append("text")
            .attr("class", "bubble-legend-text")
            .call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("transform", "translate(50,50)") // this is bubbleLegend svg width / 2, and move to bottom
      .attr("y", function (d) {
        return -2 * radius(d);
      })
      .attr("dx", "5em")
      .attr("dy", "1em")
      .text(function (d) {
        if (d > 99) {
          return d3.format(",")(Math.round(d / 100) * 100);
        } else {
          return d3.format(",")(Math.round(d / 10) * 10);
        }
      });
  }

  function refreshBubbles() {
    d3BubbleEnter.attr("transform", function (d) {
      const layerPoint = mapD3Bubble.map.latLngToLayerPoint(d.lsoaCentre);
      return "translate(" + layerPoint.x + "," + layerPoint.y + ")";
    });

    return {
      updateD3BubbleLsoa: updateD3BubbleLsoa,
      // updateBubbleColour: updateBubbleColour,
    };
  }

  // Every time the map changes, update the SVG paths
  mapD3Bubble.map.on("viewreset move moveend", refreshBubbles);
  // mapD3Bubble.map.on("move", refreshBubbles);
  // mapD3Bubble.map.on("moveend", refreshBubbles);

  return {
    updateD3BubbleLsoa: updateD3BubbleLsoa,
    // updateBubbleColour: updateBubbleColour,
  };
}
