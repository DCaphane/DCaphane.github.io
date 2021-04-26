/*

Drawing points of interest using this demo:
  https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/



*/

const mapD3 = {
  map: mapInitialise.mapInit("mapIMDD3"),
  scaleBar: mapInitialise.scaleBar("bottomleft"),
  sidebar(sidebarName) {
    return mapInitialise.sidebarLeft(this.map, sidebarName);
  },
};

mapD3.scaleBar.addTo(mapD3.map);

const sidebarD3 = mapD3.sidebar("sidebar5");

homeButton.call(mapD3);

// Panes to control zIndex of geoJson layers
mapD3.map.createPane("lsoaBoundaryPane");
mapD3.map.getPane("lsoaBoundaryPane").style.zIndex = 375;

mapD3.map.createPane("ccgBoundaryPane");
mapD3.map.getPane("ccgBoundaryPane").style.zIndex = 374;

let imdDomainDescD3 = "IMD Rank",
  imdDomainShortD3 = "imdRank";

// use for temp demp only to center in London
mapD3.map.setView([51.505548, -0.075316], 16);

(function imdDomainD3(id = "selD3Leaf") {
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
    imdDomainDesc = d3.select("#selImdDomainD3 option:checked").text();
    imdDomainShort = mapIMDDomain.get(imdDomainDesc)[0];
    console.log(imdDomainShortD3);
    // recolourIMDLayer(imdDomainShort);
  });

  // add SVG to Leaflet map via Leaflet
  const svgLayer = L.svg();
  svgLayer.addTo(mapD3.map);

  // by default, Leaflet adds an initial g element inside this svg
  // both the SVG and g can be accessed via D3
  const svg = d3.select("#mapIMDD3").select("svg");
  const g = svg.select("g");

  const pointsOfInterest = [
    { coordinate: [51.506532, -0.074624] },
    { coordinate: [51.504452, -0.076028] },
    { coordinate: [51.505548, -0.075316] },
    { coordinate: [51.508109, -0.076061] },
    { coordinate: [51.506019, -0.073639] },
  ];

  pointsOfInterest.forEach(function (d) {
    d.latLong = new L.LatLng(d.coordinate[0], d.coordinate[1]);
  });
  // console.log(pointsOfInterest)

  var feature = g
    .selectAll("circle")
    .data(pointsOfInterest)
    .enter()
    .append("circle")
    .style("stroke", "black")
    .style("opacity", 0.4)
    .style("fill", "blue")
    .attr("r", 10);

  function drawAndUpdateCircles() {
    feature.attr("transform", function (d) {
      var layerPoint = mapD3.map.latLngToLayerPoint(d.latLong);
      return "translate(" + layerPoint.x + "," + layerPoint.y + ")";
    });
  }

  drawAndUpdateCircles();
  mapD3.map.on("moveend", drawAndUpdateCircles);

  geoDataLsoaBoundaries.then(function (v) {
    const projection = d3.geoMercator();
    const geoGenerator = d3.geoPath().projection(projection);

    // v is the full dataset
    // console.log(v)

    // v.features.forEach(function (d) {
    //   console.log(d)
    // const a = geoGenerator(d)
    // console.log(a)
    // })

    // const u = g
    //   .selectAll('path')
    // .data(v.features)

    // u.enter()
    //   .append('path')
    //   .attr('d', geoGenerator)
    // .attr('class', "d3-map")

    // const transform = d3.geoTransform({ point: projectPoint }),
    // path = d3.geoPath().projection(transform)

    // const d3_features = g.selectAll('path')
    //   .data(v.features)
    //   .enter()
    // .append('path')

    // function projectPoint(x, y) {
    //   let point = map.latLngToLayerPoint(new L.LatLng(y, x));
    //   this.stream.point(point.x, point.y);
    // }
  });
})();

const baseTreeD3Leaf = (function () {
  const defaultBasemap = L.tileLayer
    .provider("Stadia.AlidadeSmooth")
    .addTo(mapD3.map);

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
