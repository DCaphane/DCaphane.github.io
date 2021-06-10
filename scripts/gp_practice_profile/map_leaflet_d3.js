/*

https://bost.ocks.org/mike/bubble-map/

https://labs.os.uk/public/os-data-hub-tutorials/web-development/d3-overlay

Drawing points of interest using this demo:
  https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/


To Do:
Filter D3 Circles - what function do this:
  map_components.js
    function filterFunctionLsoa
    refreshChartsPostPracticeChange


*/

const mapD3Bubble = {
  map: mapInitialise.mapInit("mapIMDD3"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapD3Bubble.scaleBar.addTo(mapD3Bubble.map);

const sidebarD3 = mapD3Bubble.sidebar("sidebar5");

homeButton.call(mapD3Bubble);

// Panes to control zIndex of geoJson layers
mapD3Bubble.map.createPane("lsoaBoundaryPane");
mapD3Bubble.map.getPane("lsoaBoundaryPane").style.zIndex = zIndexWard;

mapD3Bubble.map.createPane("ccgBoundaryPane");
mapD3Bubble.map.getPane("ccgBoundaryPane").style.zIndex = zIndexCCG;

const lsoaCentroidLegend = legendWrapper("footerMapD3Leaf", genID.uid("lsoa"));

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
              data_popnGPLsoa
                .get(userSelections.nearestDate())
                .get(userSelections.selectedPractice)
                .values()
            )
          : d3.max(
              data_popnGPLsoa
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
          ? data_popnGPLsoa
              .get(userSelections.nearestDate())
              .get(userSelections.selectedPractice)
              .get(lsoa.lsoa)
          : data_popnGPLsoa
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
            ? data_popnGPLsoa
                .get(userSelections.nearestDate())
                .get(userSelections.selectedPractice)
                .get(lsoaCode)
            : data_popnGPLsoa
                .get(userSelections.nearestDate())
                .get("All")
                .get(lsoaCode);

        if (value > minPopulationLSOA) {
          return 0.8;
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
      .attr("dx", "3em")
      .attr("dy", "1em")
      .text(d3.format(".1s"));
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

// Make global to enable subsequent change to overlay
const overlaysTreeBubble = {
  label: "Overlays",
  selectAllCheckbox: true,
  children: [],
};

const baseTreeD3Bubble = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stadia.AlidadeSmooth")
    .addTo(mapD3Bubble.map);

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyBackground = (function emptyTile() {
    return L.tileLayer("", {
      zoom: 0,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  })();

  // http://leaflet-extras.github.io/leaflet-providers/preview/
  return {
    label: "Base Layers <i class='fas fa-globe'></i>",
    children: [
      {
        label: "Colour <i class='fas fa-layer-group'></i>;",
        children: [
          { label: "OSM", layer: L.tileLayer.provider("OpenStreetMap.Mapnik") },
          {
            label: "OSM HOT",
            layer: L.tileLayer.provider("OpenStreetMap.HOT"),
          },
          // { label: "CartoDB", layer: L.tileLayer.provider("CartoDB.Voyager") },
          {
            label: "Water Colour",
            layer: L.tileLayer.provider("Stamen.Watercolor"),
          },
          { label: "Bright", layer: L.tileLayer.provider("Stadia.OSMBright") },
          { label: "Topo", layer: L.tileLayer.provider("OpenTopoMap") },
        ],
      },
      {
        label: "Black & White <i class='fas fa-layer-group'></i>",
        children: [
          // { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron") },
          {
            label: "High Contrast",
            layer: L.tileLayer.provider("Stamen.Toner"),
          },
          { label: "Grey", layer: defaultBasemap },
          {
            label: "ST Hybrid",
            layer: L.tileLayer.provider("Stamen.TonerHybrid"),
          },
          {
            label: "Dark",
            layer: L.tileLayer.provider("Stadia.AlidadeSmoothDark"),
          },
          {
            label: "Jawg Matrix",
            layer: L.tileLayer.provider("Jawg.Matrix", {
              // // Requires Access Token
              accessToken:
                "phg9A3fiyZq61yt7fQS9dQzzvgxFM5yJz46sJQgHJkUdbdUb8rOoXviuaSnyoYQJ", //  biDemo
            }),
          },
        ],
      },
      { label: "None", layer: emptyBackground },
    ],
  };
})();

overlaysTreeBubble.children[3] = overlayTrusts();

const mapControlBubble = L.control.layers.tree(
  baseTreeD3Bubble,
  overlaysTreeBubble,
  {
    // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
    collapsed: true, // Whether or not control options are displayed
    sortLayers: true,
    // namedToggle: true,
    collapseAll: "Collapse all",
    expandAll: "Expand all",
    // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
    closedSymbol:
      "<i class='far fa-plus-square'></i> <i class='far fa-folder'></i>", // Symbol displayed on a closed node
    openedSymbol:
      "<i class='far fa-minus-square'></i> <i class='far fa-folder-open'></i>", // Symbol displayed on an opened node
  }
);

mapControlBubble.addTo(mapD3Bubble.map);
