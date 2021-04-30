/*

https://bost.ocks.org/mike/bubble-map/

https://labs.os.uk/public/os-data-hub-tutorials/web-development/d3-overlay

Drawing points of interest using this demo:
  https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/



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
mapD3Bubble.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapD3Bubble.map.createPane("ccgBoundaryPane");
mapD3Bubble.map.getPane("ccgBoundaryPane").style.zIndex = 374;

let imdDomainDescD3 = "IMD Rank",
  imdDomainShortD3 = "imdRank";

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
  let counter = 0;
  for (let key of mapIMDDomain.keys()) {
    if (counter !== 0) {
      select.options.add(new Option(key, counter));
    } else {
      select.options.add(new Option(key, 0, true, true));
    }
    counter++;
  }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    imdDomainDescD3 = d3.select("#selImdDomainD3 option:checked").text();
    imdDomainShortD3 = mapIMDDomain.get(imdDomainDescD3).datasetDesc;
    console.log(imdDomainDescD3);
    // recolourIMDLayer(imdDomainShort);
  });

  // Define the div for the tooltip
  const tooltipD3Lsoa = newTooltip.tooltip(div);
  tooltipD3Lsoa.style("height", "40px");

  // add SVG to Leaflet map via Leaflet
  const svgLayer = L.svg();
  svgLayer.addTo(mapD3Bubble.map);

  const svg = d3.select("#mapIMDD3").select("svg"),
    g = svg.select("g");

  // Project any point to map's current state
  function projectPoint(x, y) {
    const point = mapD3Bubble.map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  const transform = d3.geoTransform({ point: projectPoint }),
    path = d3.geoPath().projection(transform);

  geoDataLsoaBoundaries.then(function (v) {
    // v is the full dataset
    // console.log(v);
    const nearestDate = nearestValue(arrayGPLsoaDates, selectedDate);

    let lsoaGeoFlip = turf.flip(v); // this reverses the long/ lat of GeoJSON to lat/ Long required for Leaflet

    const lsoaData = [];
    lsoaGeoFlip.features.forEach(function (d) {
      let obj = {};

      obj.lsoa = d.properties.lsoa; // lsoa code
      const poly = L.polygon(d.geometry.coordinates); // Leaflet polygon which can subsequently be used
      obj.lsoaCentre = poly.getBounds().getCenter(); // Centre of each polygon
      // obj.lsoaCentre = turf.centerOfMass(d);
      obj.lsoaPopulation = data_popnGPLsoa
        .get(nearestDate)
        .get("All")
        .get(d.properties.lsoa);
      lsoaData.push(obj);
    });
    // console.log(lsoaData)

    // const maxValue = d3.max(data_popnGPLsoa.get(nearestDate).get("All").values())
    const radius = d3
      .scaleSqrt()
      .domain([0, 10000]) // 1e4
      .range([0, 20]);

    const d3Bubble = g
      .attr("class", "bubble")
      .selectAll("circle")
      .data(
        lsoaData.sort(function (a, b) {
          return b.lsoaPopulation - a.lsoaPopulation;
        }, lsoaData.lsoa)
      ) // sort the bubbles so smaller populations appear above larger population
      .enter()
      .append("circle")
      .attr("r", function (d) {
        return radius(d.lsoaPopulation);
      })
      // .attr("fill", "blue") // initially set in css
      .style("pointer-events", "all");

    refreshBubbles();

    function refreshBubbles() {
      d3Bubble.attr("transform", function (d) {
        const layerPoint = mapD3Bubble.map.latLngToLayerPoint(d.lsoaCentre);
        return "translate(" + layerPoint.x + "," + layerPoint.y + ")";
      });

      d3Bubble.on("click", click);
      function click(event, d) {
        // console.log(d.lsoa);
        const str = `<strong>${d.lsoa}</strong><br>
      <span style="color:red">
        ${formatNumber(d.lsoaPopulation)}
        </span>`;
        newTooltip.counter++;
        newTooltip.mouseover(tooltipD3Lsoa, str, event);
      }

      d3Bubble.on("mouseover", mouse_over);
      function mouse_over(event, d) {
        // console.log(d.properties.lsoa)
        const str = `<strong>${d.lsoa}</strong><br>
      <span style="color:red">
        ${formatNumber(d.lsoaPopulation)}
        </span>`;
        newTooltip.counter++;
        newTooltip.mouseover(tooltipD3Lsoa, str, event);
      }

      d3Bubble.on("mouseout", mouse_out);
      function mouse_out(event, d) {
        // console.log(d.properties.lsoa)
        newTooltip.mouseout(tooltipD3Lsoa);
      }
    }

    // Every time the map changes, update the SVG paths
    mapD3Bubble.map.on("viewreset", refreshBubbles);
    mapD3Bubble.map.on("move", refreshBubbles);
    mapD3Bubble.map.on("moveend", refreshBubbles);
  });
};

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


overlaysTreeBubble.children[0] = overlayTrusts();

const mapControlBubble = L.control.layers.tree(baseTreeD3Bubble, overlaysTreeBubble, {
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
});

mapControlBubble
  .addTo(mapD3Bubble.map)
  // .setOverlayTree(overlaysTreeBubble)
  .collapseTree() // collapse the baselayers tree
  // .expandSelected() // expand selected option in the baselayer
  .collapseTree(true); // true to collapse the overlays tree
// .expandSelected(true); // expand selected option in the overlays tree
