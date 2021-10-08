"use strict";

// ############################### chart_formatting.js #######################################

const chtWidthStd = 400,
  chtHeightStd = 400,
  chtWidthWide = 500,
  chtHeightTall = 700,
  chtHeightShort = 250;

const margin = {
  top: 50,
  right: 10,
  bottom: 150,
  left: 85,
};

// https://github.com/d3/d3-time-format
const parseDate = d3.timeParse("%b-%y"), // import format: mmm-yy
  parseDate2 = d3.timeParse("%d/%m/%Y"), // import format: dd/mm/yyyy
  formatPeriod = d3.timeFormat("%b-%y"), // presentational format eg. Apr-16
  formatNumber = d3.format(",d");

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent

// ###########################################################################################

// ############################### map_formatting.js #######################################

// Formatting Styles
function styleCCG(ccg) {
  let colour;
  switch (ccg) {
    case "VoY":
      colour = "#00ff78";
      break;
    case "NY":
      colour = "#ff0078";
      break;
    case "ER":
      colour = "#7800ff";
      break;
    case "Hull":
      colour = "#dfff00";
      break;
    default:
      colour = "#333";
  }

  return {
    color: colour,
    weight: 2,
    opacity: 0.6,
  };
}

function styleLsoa() {
  return {
    fillColor: "#ff0000", // background
    fillOpacity: 0, // transparent
    weight: 0.9, // border
    color: "red", // border
    opacity: 1,
    dashArray: "3",
  };
}

function styleWard(feature) {
  return {
    fillColor: getColourWard(feature.properties.pcn_ward_group),
    weight: 2,
    opacity: 1,
    color: "red",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

// for colouring ward groupings (choropleth)
function getColourWard(d) {
  return d > 7
    ? "#800026"
    : d > 6
    ? "#BD0026"
    : d > 5
    ? "#E31A1C"
    : d > 4
    ? "#FC4E2A"
    : d > 3
    ? "#FD8D3C"
    : d > 2
    ? "#FEB24C"
    : d > 1
    ? "#FED976"
    : "#FFEDA0";
}

// Used to style polygons
const wardsStyle = {
  fillColor: "transparent", // fill colour
  // fillOpacity: 0.5,
  color: "#0078ff", // border colour
  opacity: 1,
  weight: 2,
};

// Used to style labels
const wardsStyleLabels = {
  fillColor: "transparent", // fill colour
  // fillOpacity: 0.5,
  color: "#transparent", // border colour
  opacity: 0,
  weight: 0,
};

function pcnFormatting(feature, latlng, { addBounce = false } = {}) {
  let markerPCN;

  // Use different marker styles depending on eg. practice groupings
  switch (feature.properties.pcn_name) {
    case "Selby Town":
      markerPCN = arrMarkerIcons[0]; // standard red map marker
      markerPCN.options.text = "ST";
      markerPCN.options.innerIconStyle = "padding-left:7px;padding-bottom:5px;"; // centre text in icon
      // markerPCN.options.icon = "fa-solid fa-bahai" // to use font awesome icon
      break;

    case "Tadcaster & Selby Rural Area":
      markerPCN = arrMarkerIcons[1]; // standard blue map marker
      markerPCN.options.text = "TSRA";
      markerPCN.options.innerIconStyle = "font-size:9px;";
      break;
    case "South Hambleton And Ryedale":
      markerPCN = arrMarkerIcons[2]; // standard green map marker
      markerPCN.options.text = "SHaR";
      markerPCN.options.innerIconStyle = "font-size:9px;";
      break;
    case "York City Centre":
      markerPCN = arrMarkerIcons[3]; // standard purple map marker
      markerPCN.options.text = "YCC";
      markerPCN.options.innerIconStyle =
        "font-size:11px;margin-top:3px;margin-left:-2px;";
      break;
    case "York Medical Group":
      markerPCN = arrMarkerIcons[4]; // standard orange map marker
      markerPCN.options.text = "YMG";
      markerPCN.options.innerIconStyle =
        "font-size:11px;margin-top:3px;margin-left:-2px;";
      break;
    case "Priory Medical Group":
      markerPCN = arrCircleIcons[0]; // red circle
      markerPCN.options.text = "PMG";
      markerPCN.options.innerIconStyle = "margin-top:3px;";
      break;
    case "York East":
      markerPCN = arrCircleIcons[1]; // blue circle
      markerPCN.options.text = "YE";
      markerPCN.options.innerIconStyle = "margin-top:3px; margin-left:0px;";
      break;
    case "West, Outer and North East York":
      markerPCN = arrCircleIcons[3]; // purple
      markerPCN.options.text = "WONEY";
      markerPCN.options.innerIconStyle =
        "margin-top:6px; margin-left:0px;font-size:8px;padding-top:1px;";
      break;
    // case "NIMBUSCARE LTD":
    //   switch (feature.properties.sub_group) {
    //     case "1":
    //       markerPCN = arrCircleIcons[7];
    //       break;
    //     case "2":
    //       markerPCN = arrCircleDotIcons[7];
    //       break;
    //     case "3":
    //       markerPCN = arrRectangleIcons[7];
    //       break;
    //     default:
    //       markerPCN = arrDoughnutIcons[7];
    //       break;
    //   }

    default:
      console.log(`Missing PCN Marker: ${feature.properties.pcn_name}`);
      markerPCN = arrDoughnutIcons[0];
  }

  const finalMarker = L.marker(latlng, {
    icon: markerPCN,
    riseOnHover: true,
  });

  if (addBounce) {
    finalMarker.on("click", function () {
      this.toggleBouncing();
    });
  }
  return finalMarker;
}

// ###########################################################################################

// ############################### functions.js #######################################

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

// ###########################################################################################

// ############################### sidebar_content.js #######################################

let sidebarContent = (function sidebarDefaults() {
  const defaultText = `<br>
                    <h1>Primary Care Demographics...
                    <p/>
                    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                     dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                     Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
                     consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                     sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
                     no sea takimata sanctus est Lorem ipsum dolor sit amet.
                     </p>
                     <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                     dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                     Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
                     consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                     sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
                     no sea takimata sanctus est Lorem ipsum dolor sit amet.
                     </p>
`;

  /* add an overview panel */
  const panelOverview = {
    id: "pcnOverview", // UID, used to access the panel
    tab: '<span class="fa-solid fa-bars"></span>', // content can be passed as HTML string,
    pane: defaultText,
    title: "Overview", // an optional pane header
    position: "top", // optional vertical alignment, defaults to 'top'
    disabled: false,
  };

  const panelSpecific = {
    id: "pcnSpecific", // UID, used to access the panel
    tab: '<span class="fa-solid fa-info"></span>', // content can be passed as HTML string,
    pane: "<br><p>Select a PCN for further details</p>",
    title: "PCN Specific", // an optional pane header
    position: "top", // optional vertical alignment, defaults to 'top'
    disabled: false,
  };

  /* add a dummy messages panel */
  const panelMail = {
    id: "mail",
    tab: '<span class="fa-solid fa-envelope"></span>',
    pane: "<br><h1>Send a message..., add a button here?<p/>",
    title: "Messages",
    position: "top",
    disabled: false,
  };

  /* add a dummy messages panel */
  const panelDummy = {
    id: "dummy",
    tab: '<span class="fa-solid fa-user"></span>',
    pane: "<br><p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>",
    title: "Testing",
    position: "top",
    disabled: true,
  };

  /* add a Settings messages panel */
  // sidebarContent.resetSidebarText is set at run time
  const panelSettings = {
    id: "settings",
    tab: '<span class="fa-solid fa-gear"></span>',
    pane: `<br><p><button onclick="sidebarMapMain.enablePanel(\'dummy\')">enable dummy panel</button>
    <button onclick="sidebarMapMain.disablePanel(\'dummy\')">disable dummy panel</button></p>
    <br><h1><button onclick="sidebarContent.resetSidebarText()">Reset Text</button>`,
    title: "Settings",
    position: "bottom",
    disabled: false,
  };

  const panelIMDSpecific = {
    id: "pcnSpecific", // UID, used to access the panel
    tab: '<span class="fa-solid fa-info"></span>', // content can be passed as HTML string,
    pane: "<br><p>For further details around IMD, see <a href='https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019' target='_blank' rel='noopener noreferrer'>link</a></a></p>",
    title: "IMD Details", // an optional pane header
    position: "top", // optional vertical alignment, defaults to 'top'
    disabled: false,
  };

  function resetSidebarText() {
    document.getElementById("pcnSpecific").innerHTML =
      mapDescriptions.get(defaultPCN);
  }

  const updateSidebarText = function (sidebarID, gpPracticeCode) {
    const elem = document.getElementById(sidebarID); // eg. 'pcnOverview'

    if (mapDescriptions.has(gpPracticeCode)) {
      elem.innerHTML = mapDescriptions.get(gpPracticeCode);
    } else {
      console.log(`missing description ${gpPracticeCode}`);
      elem.innerHTML = mapDescriptions.get("defaultPCN");
    }
  };

  const mapDescriptions = new Map();

  mapDescriptions.set(
    "B81036",
    `<h1 class="leaflet-sidebar-header">Pocklington</h1>
  <br>
  <p>Visit their website <a href="https://www.pocklingtongps.nhs.uk/"  target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Services/gp/Overview/DefaultView.aspx?id=42889 target="_blank" rel="noopener noreferrer">here</a></p>
  <p>consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
  consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
  no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>`
  );

  mapDescriptions.set(
    "B82002",
    `<h1 class="leaflet-sidebar-header">Millfield Surgery</h1>
<br>
<p>Visit their website <a href="https://www.millfieldsurgery.co.uk/" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Services/gp/Overview/DefaultView.aspx?id=39948 target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82005",
    `<h1 class="leaflet-sidebar-header">Priory Medical Group</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82018",
    `<h1 class="leaflet-sidebar-header">Escrick Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82021",
    `<h1 class="leaflet-sidebar-header">Dalton Terrace Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82026",
    `<h1 class="leaflet-sidebar-header">Haxby Group Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82031",
    `<h1 class="leaflet-sidebar-header">Sherburn Group Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82033",
    `<h1 class="leaflet-sidebar-header">Pickering Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82041",
    `<h1 class="leaflet-sidebar-header">Beech Tree Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82047",
    `<h1 class="leaflet-sidebar-header">Unity</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82064",
    `<h1 class="leaflet-sidebar-header">Tollerton Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82068",
    `<h1 class="leaflet-sidebar-header">Helmsley Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82071",
    `<h1 class="leaflet-sidebar-header">The Old School Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82073",
    `<h1 class="leaflet-sidebar-header">South Milford Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82074",
    `<h1 class="leaflet-sidebar-header">Posterngate Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82077",
    `<h1 class="leaflet-sidebar-header">Kirkbymoorside Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82079",
    `<h1 class="leaflet-sidebar-header">Stillington Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82080",
    `<h1 class="leaflet-sidebar-header">MyHealth</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82081",
    `<h1 class="leaflet-sidebar-header">Elvington Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82083",
    `<h1 class="leaflet-sidebar-header">York Medical Group</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82097",
    `<h1 class="leaflet-sidebar-header">Scott Road Medical Centre</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82098",
    `<h1 class="leaflet-sidebar-header">Jorvik Gillygate Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82100",
    `<h1 class="leaflet-sidebar-header">Front Street Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82103",
    `<h1 class="leaflet-sidebar-header">East Parade Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82105",
    `<h1 class="leaflet-sidebar-header">Tadcaster Medical Centre</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "B82619",
    `<h1 class="leaflet-sidebar-header">Terrington Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`
  );

  mapDescriptions.set(
    "South Hambleton And Ryedale",
    `<h1 class="leaflet-sidebar-header">South Hambleton And Ryedale</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`
  );

  mapDescriptions.set(
    "York City Centre PCN",
    `<h1 class="leaflet-sidebar-header">York City Centre PCN</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`
  );

  mapDescriptions.set(
    "York Medical Group",
    `<h1 class="leaflet-sidebar-header">York Medical Group</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`
  );

  mapDescriptions.set(
    "NIMBUSCARE LTD",
    `<h1 class="leaflet-sidebar-header">NIMBUSCARE LTD</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`
  );

  mapDescriptions.set(
    "defaultPCN",
    `<h1 class="leaflet-sidebar-header">Practice Specific</h1>
	<br>
	<p>Select a specific Practice for further details</p>`
  );

  return {
    panelOverview: panelOverview,
    panelSpecific: panelSpecific,
    panelMail: panelMail,
    panelDummy: panelDummy,
    panelSettings: panelSettings,
    panelIMDSpecific: panelIMDSpecific,
    resetSidebarText: resetSidebarText,
    updateSidebarText: updateSidebarText,
  };
})();

// ###########################################################################################

// ############################### index.js #######################################
// Load the initial data and then variations on this for subsequent filtering
let trendChart,
  barChart,
  demographicChart,
  circlePopnIMDChart,
  highlightedPractice;

const newTooltip = createTooltip();
const genID = generateUniqueID(); // genID.uid

// Store user selections
const userSelections = {
  selectedPractice: "All Practices",
  selectedPracticeName() {
    return practiceLookup.has(this.selectedPractice)
      ? titleCase(practiceLookup.get(this.selectedPractice))
      : "";
  },
  selectedPracticeCompare: "None",
  selectedPracticeCompareName() {
    return practiceLookup.has(this.selectedPracticeCompare)
      ? titleCase(practiceLookup.get(this.selectedPracticeCompare))
      : "";
  },
  selectedDate: null,
  nearestDate() {
    // Align the selected period to the nearest quarterly period
    // arrayGPLsoaDates is result of promise promDataGPPopnLsoa
    return (
      arrayGPLsoaDates.reduce(
        (p, n) =>
          Math.abs(p) > Math.abs(n - this.selectedDate)
            ? n - this.selectedDate
            : p,
        Infinity
      ) + this.selectedDate
    );
  },
};

/* Data Import */
let dataPopulationGP,
  dataPopulationGPSummary,
  dataPopulationGPLsoa,
  arrayGPLsoaDates,
  uniquePractices; // sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object

const promDataGPPopn = d3 // consider dropping locality
  .csv("Data/GP_Practice_Populations_slim.csv", processDataGPPopulation)
  .then((data) => {
    dataPopulationGP = data;

    dataPopulationGPSummary = d3.rollup(
      dataPopulationGP,
      (v) => d3.sum(v, (d) => d.Total_Pop),
      (d) => +d.Period,
      (d) => d.Practice
    );

    // default the selected date to the latest available
    userSelections.selectedDate = d3.max(data, function (d) {
      return d.Period;
    });

    // List of GP Practice codes (sorted A-Z) for use in drop down ------------------------
    uniquePractices = [...new Set(data.map((item) => item.Practice))].sort();
  });

const promDataGPPopnLsoa = d3
  .csv("Data/population_gp_lsoa.csv", processDataPopulationGPLsoa)
  .then((data) => {
    dataPopulationGPLsoa = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.population),
      (d) => d.period,
      (d) => d.practice,
      (d) => d.lsoa
    );

    // GP LSOA Population is Quarterly so not a 1:1 match with trend data
    // Will use closest value
    arrayGPLsoaDates = [...dataPopulationGPLsoa.keys()]; // use Array.from or spread syntax

    userSelections.latestPeriod = userSelections.selectedDate;
    userSelections.nearestQuarter = userSelections.nearestDate();
  });

// Export geojson data layers as: EPSG: 4326 - WGS 84
let geoLsoaBoundaries,
  geoWardBoundaries,
  geoDataLsoaPopnCentroid,
  geoDataNationalCCGBoundaries,
  dataIMD; // not geo data but only used in map chart

// Promises to import the geo data

const promGeoDataGP = d3.json("Data/geo/gpPracticeDetailsGeo.geojson"),
  promGeoDataCYCWards = d3.json("Data/geo/cyc_wards.topojson"),
  promGeoNationalCCGBoundaries = d3.json(
    "Data/geo/ccg_boundary_national_202104.topojson"
  ),
  promGeoDataLsoaBoundaries = d3.json(
    "Data/geo/lsoa_gp_selected_simple20cp6.topojson"
  ),
  promGeoDataLsoaPopnCentroid = d3.json(
    "Data/geo/lsoa_population_centroid_03q.geojson"
  ),
  promHospitalDetails = d3.dsv(
    /*
  details of national hospital sites
  https://www.nhs.uk/about-us/nhs-website-datasets/
  https://media.nhswebsite.nhs.uk/data/foi/Hospital.pdf
  */
    "�", // \u00AC
    "Data/geo/Hospital.csv",
    processDataHospitalSite
  ),
  promDataIMD = d3.csv("Data/imd_lsoa_ccg.csv", processDataIMD),
  promDataRates = d3
    .csv("Data/ratesIndicators_v1.csv", processRatesData)
    .then((data) => {
      // https://observablehq.com/@d3/d3-group
      // Rates data grouped by csv and lsoa
      dataRates = d3.group(
        data,
        (d) => d.key,
        (d) => d.practice,
        (d) => d.lsoa
      );
      // the max of the counts, used for sizing the d3 circle
      dataRatesMax = d3.rollup(
        data,
        (v) => d3.max(v, (d) => d.activityU),
        (d) => d.key,
        (d) => d.practice
      );

      /*
  dataRates.keys()

    */
    });

promGeoNationalCCGBoundaries.then((data) => {
  geoDataNationalCCGBoundaries = topojson.feature(
    data,
    data.objects.ccg_boundary_national_202104
  );
});

promGeoDataLsoaBoundaries.then((data) => {
  geoLsoaBoundaries = topojson.feature(
    data,
    data.objects.lsoa_gp_selected_original
  );
});

promGeoDataCYCWards.then((data) => {
  geoWardBoundaries = topojson.feature(data, data.objects.cyc_wards);
});

// Upload Data
const importGeoData = (async function displayContent() {
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promGeoDataLsoaPopnCentroid,
    promDataIMD,
    promDataRates,
  ]).then((values) => {
    // if (values[0].status === "fulfilled") {
    // geoDataLsoaBoundaries = topojson.feature(values[0].value, values[0].value.objects.lsoa_gp_selected_simple20cp6)
    // }
    geoDataLsoaPopnCentroid = values[1].value;
    dataIMD = values[2].value;
  });
})();

function initD3Charts() {
  trendChart = initTrendChart(dataPopulationGP, "cht_PopTrend");
  trendChart.chartTrendDraw();

  barChart = initPopnBarChart(dataPopulationGP, "cht_PopBar");
  barChart.fnRedrawBarChart();

  demographicChart = initChartDemog(dataPopulationGP, "cht_PopDemo");
  demographicChart.updateChtDemog();
}

function refreshChartsPostPracticeChange(practice) {
  console.log({ selectedPractice: practice });
  // change the selection box dropdown to reflect clicked practice
  document.getElementById("selPractice").value = `${
    userSelections.selectedPractice
  }: ${userSelections.selectedPracticeName()}`;

  filterGPPracticeSites();
  filterFunctionLsoa(true); // zoom to filtered lsoa
  // .then(() => {
  //   recolourPopnLSOA();
  //   recolourIMDLayer(imdDomainShort);
  // });

  trendChart.chartTrendDraw();

  demographicChart.updateChtDemog(
    practice,
    userSelections.selectedPracticeCompare
  );

  circlePopnIMDChart.updateD3BubbleLsoa();

  barChart.fnRedrawBarChart();

  // updateTextPractice();
  // updateTextPCN();
  updateBouncingMarkers();

  highlightFeature(practice, mapMain, false);

  sidebarContent.updateSidebarText("pcnSpecific", practice);
}

function refreshChartsPostDateChange() {
  for (const value of mapsWithGPMain.values()) {
    updatePopUpText(value[0]);
  }
  demographicChart.updateChtDemog(
    userSelections.selectedPractice,
    userSelections.selectedPracticeCompare
  );
  filterFunctionLsoa(true); // zoom to filtered lsoa

  circlePopnIMDChart.updateD3BubbleLsoa();
  barChart.fnRedrawBarChart();
}

/* Functions to process the data on load */

function processDataGPPopulation(d, index, columnKeys) {
  // Loop through the raw data to format columns as appropriate
  return {
    Practice: d.Practice_Mapped.substring(0, 6),
    // Locality: d.Locality,
    Age_Band: d.Age_Band,
    Period: +parseDate(d.Period),
    Male_Pop: +d.Male,
    Female_Pop: +d.Female,
    Total_Pop: +d.Total,
  };
}

function processDataPopulationGPLsoa(d) {
  return {
    period: +parseDate2(d.period),
    practice: d.practice_code,
    lsoa: d.lsoa,
    population: +d.population,
  };
}

function processDataHospitalSite(d) {
  if (!isNaN(+d.Latitude)) {
    return {
      // latitude: +d.Latitude,
      // longitude: +d.Longitude,
      markerPosition: [+d.Latitude, +d.Longitude],
      sector: d.Sector, // nhs or independent
      organisationCode: d.OrganisationCode,
      organisationName: d.OrganisationName,
      parentODSCode: d.ParentODSCode,
      parentName: d.ParentName,
    };
  } else {
    console.log({ orgCode: d.OrganisationCode, invalidLatitude: d.Latitude });
  }
}

const mapLSOAbyIMD = new Map(); // LSOAs by the main IMD decile

function processDataIMD(d) {
  mapLSOAbyIMD.set(
    d.LSOA_code_2011,
    +d.Index_of_Multiple_Deprivation_IMD_Decile
  );

  return {
    lsoa: d.LSOA_code_2011,
    imdRank: +d.Index_of_Multiple_Deprivation_IMD_Rank,
    imdDecile: +d.Index_of_Multiple_Deprivation_IMD_Decile,
    incomeRank: +d.Income_Rank,
    employmentRank: +d.Employment_Rank,
    educationRank: +d.Education_Skills_and_Training_Rank,
    healthRank: +d.Health_Deprivation_and_Disability_Rank,
    crimeRank: +d.Crime_Rank,
    housingRank: +d.Barriers_to_Housing_and_Services_Rank,
    livingEnvironRank: +d.Living_Environment_Rank,
    incomeChildRank: +d.Income_Deprivation_Affecting_Children_Index_Rank,
    incomeOlderRank: +d.Income_Deprivation_Affecting_Older_People_Rank,
    childRank: +d.Children_and_Young_People_Subdomain_Rank,
    adultSkillsRank: +d.Adult_Skills_Subdomain_Rank,
    geogRank: +d.Geographical_Barriers_Subdomain_Rank,
    barriersRank: +d.Wider_Barriers_Subdomain_Rank,
    indoorsRank: +d.Indoors_Subdomain_Rank,
    outdoorsRank: +d.Outdoors_Subdomain_Rank,
    totalPopn: +d.Total_population_mid_2015,
    dependentChildren: +d.Dependent_Children_aged_0_15_mid_2015,
    popnMiddle: +d.Population_aged_16_59_mid_2015,
    popnOlder: +d.Older_population_aged_60_and_over_mid_2015,
    popnWorking: +d.Working_age_population_18_59_64,
  };
}

// Rates Testing
let dataRates, dataRatesMax;

function processRatesData(d) {
  return {
    key: d.Key,
    practice: d.practiceCode,
    lsoa: d.LSOA,
    activityU: +d.activityUnique,
    activityT: +d.activityTotal,
    rate: +d.DSR,
    signf: +d.Signf,
  };
}

// // These would be hard coded to provide a lookup from the data key to the description
const dataRatesKeys = new Map();
dataRatesKeys.set("AE_01", "A&E Demo");
dataRatesKeys.set("selbyUTC", "Selby UTC");
dataRatesKeys.set("testNew", "Long Description testNew");

// ###########################################################################################

// ############################### gp_practice_dropdown.js #######################################

/*
For the practice selection dropdowns
Currently using unique practices as loaded in the data
This has to run after the data has been loaded - hence promise1, to get the unique practices
Consider separate approach to define unique practices eg. hardcode csv/ json

For restyling dropdowns, improved functionality:
  https://leaverou.github.io/awesomplete/
  https://github.com/LeaVerou/awesomplete

    To Consider:
      Currently, the sorting is done on the map.
      Consider something along the lines of the following:
        https://stackoverflow.com/questions/38448968/sorting-an-array-alphabetically-but-with-exceptions

      Change direction of dropdown at bottom of screen
        https://github.com/selectize/selectize.js/issues/29

  https://www.hongkiat.com/blog/search-select-using-datalist/
  https://codepen.io/rpsthecoder/embed/yJvRPE/?height=421&theme-id=12825&default-tab=result&embed-version=2
*/

const practiceLookup = new Map();

let urls = [
  "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03Q&RelStatus=active&Limit=1000",
  // "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03M&RelStatus=active&Limit=1000"
];

const gpDetails = d3.json(urls[0]).then((data) => {
  const organisations = data.Organisations;

  organisations.forEach((d) => {
    const orgID = d.OrgId;
    const orgName = d.Name;

    practiceLookup.set(orgID, orgName);
  });
});

Promise.all([gpDetails, promDataGPPopn]).then(() => {
  // requires unique list of practices (uniquePractices)
  const dropDowns = document.getElementsByClassName("dropdown practice"); // select all elements with these classes

  for (let i = 0; i < dropDowns.length; i++) {
    // https://stackoverflow.com/questions/14910196/how-to-add-multiple-divs-with-appendchild/36937070
    let docFrag = document.createDocumentFragment();
    docFrag.appendChild(createElem("option", "All Practices"));

    for (const pCode of uniquePractices) {
      // value, key, map https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach

      if (practiceLookup.has(pCode)) {
        docFrag.appendChild(
          createElem(
            "option",
            `${pCode}: ${titleCase(practiceLookup.get(pCode))}`
          )
        ); // Note that this does NOT go to the DOM
      } else {
        createElem("option", pCode);
      }
    }

    dropDowns[i].append(docFrag);
  }

  // https://www.sitepoint.com/javascript-autocomplete-widget-awesomplete/

  const input1 = document.getElementById("selPractice");
  const comboplete1 = new Awesomplete(input1, {
    minChars: 0,
    maxItems: 30,
    sort: false,
  });
  Awesomplete.$("#btn-selPractice").addEventListener("click", function () {
    if (comboplete1.ul.childNodes.length === 0) {
      comboplete1.minChars = 0;
      comboplete1.evaluate();
    } else if (comboplete1.ul.hasAttribute("hidden")) {
      comboplete1.open();
    } else {
      comboplete1.close();
    }
  });

  // https://github.com/LeaVerou/awesomplete/issues/17034
  input1.addEventListener("awesomplete-select", function (event) {
    if (event.text.value !== "All Practices") {
      userSelections.selectedPractice = event.text.value.substring(0, 6);
    } else {
      userSelections.selectedPractice = event.text.value;
    }
    refreshChartsPostPracticeChange(userSelections.selectedPractice);
  });

  const input2 = document.getElementById("selPracticeCompare");
  const comboplete2 = new Awesomplete(input2, {
    minChars: 0,
    maxItems: 30,
    sort: false,
  });
  Awesomplete.$("#btn-selPracticeCompare").addEventListener(
    "click",
    function () {
      if (comboplete2.ul.childNodes.length === 0) {
        comboplete2.minChars = 0;
        comboplete2.evaluate();
      } else if (comboplete2.ul.hasAttribute("hidden")) {
        comboplete2.open();
      } else {
        comboplete2.close();
      }
    }
  );

  input2.addEventListener("awesomplete-select", function (event) {
    if (event.text.value !== "All Practices") {
      userSelections.selectedPracticeCompare = event.text.value.substring(0, 6);
    } else {
      userSelections.selectedPracticeCompare = event.text.value;
    }

    console.log("Compare: " + userSelections.selectedPracticeCompare);
    demographicChart.updateChtDemog(
      userSelections.selectedPractice,
      userSelections.selectedPracticeCompare
    );
  });
});

// Function to create a given element eg. option and in this case, the map key, k (practice code)
function createElem(elemType, text) {
  let elem = document.createElement(elemType);
  elem.appendChild(document.createTextNode(text));
  return elem;
}

// ###########################################################################################

// ############################### gp_popn_trend.js #######################################

/*
Brush Resources

https://observablehq.com/@d3/focus-context
https://stackoverflow.com/q/65896903
https://stackoverflow.com/q/14665482

https://observablehq.com/@d3/brush-snapping-transitions

*/

function initTrendChart(dataInit, id) {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const div = document.getElementById(id);
  // Explanation of clip path: http://www.d3noob.org/2015/07/clipped-paths-in-d3js-aka-clippath.html
  const clipIdTrend = genID.uid("clip");
  // clipIdTrend = {id: "O-clip-1", href: "http://127.0.0.1:5501/d3_learning_focus.html#O-clip-1"}

  const margin = { top: 20, right: 20, bottom: 30, left: 60 },
    height = 300,
    width = 500,
    miniMapHeight = 100;

  /*
Line and marker transitions
	https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
*/

  let yAxisZero = false;
  let gb; // groupBrush
  let defaultSelection, fullRangeSelection;
  let dataArr; // stores the updated data (eg. after practice selected)
  let initialiseBool = true; // so the brush is only added to the chart once
  let brushRange; // store the position of the brush after it moves

  // Total by Period for initial Trend Chart
  const d = d3.rollup(
    dataInit,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => d.Period
  );

  // Practices by Period - Trend Chart Filtered
  const dataLevel_02 = d3.rollup(
    dataInit,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => d.Practice,
    (d) => +d.Period
  );

  function xAxis(g, x, height) {
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      //height used as parameter but not passed as defined in outer scope in original
      d3
        .axisBottom(x)
        .ticks(chtWidthWide / 80)
        .tickSizeOuter(0)
    );
  }

  const x = d3
    .scaleTime()
    // .domain(d3.extent(data, (d) => d.period))
    .nice()
    .range([margin.left + 4, width - margin.right - 8]); // marker size, r = 6 + line size

  function yAxis(g, y, title) {
    const axis = g
      .attr("transform", `translate(${margin.left},0)`)
      // tick sizes here the width of the chart (used as minor gridlines)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)));

    // this removes the outside (square) border
    // https://github.com/d3/d3-axis/issues/48
    axis.call((g) => g.select(".domain").remove());

    // Inline formatting moved to css, .grid line
    // yAxis
    //   .selectAll("line")
    //   .style("stroke", "lightgrey")
    //   .style("opacity", "0.7")
    //   .style("shape-rendering", "crispEdges");

    axis.call((g) =>
      g
        .selectAll(".title")
        .data([title])
        .join("text")
        .attr("class", "title")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", 0 - chtHeightShort / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .attr("fill", "currentColor")
        .text(title)
    );
  }

  // function yGridlines(g, y) {
  //   const yGrid = g.attr("transform", `translate(${margin.left},0)`)
  //     .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(""))

  //   yGrid.select("path")
  //     .style("stroke","none")

  //     yGrid.selectAll("line")
  //     .style("stroke", "#eee")
  //   .style("shape-rendering", "crispEdges")
  //   .style("opacity", "0.8")
  // }

  const y = d3
    .scaleLinear()
    // .domain([0, d3.max(data, (d) => d.population)])
    // .domain(d3.extent(data, (d) => d.population))
    .range([height - margin.bottom - 3, margin.top + 2]);

  const yMini = d3.scaleLinear().rangeRound([miniMapHeight, 0]);

  function plotLine(x, y) {
    return (
      d3
        .line()
        // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
        .curve(d3.curveMonotoneX)
        .x(function (d) {
          return x(d.period);
        })
        .y(function (d) {
          return y(d.population);
        })
    );
  }

  function plotLineMini(x, y) {
    return (
      d3
        .line()
        // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
        .curve(d3.curveMonotoneX)
        .x(function (d) {
          return x(d.period);
        })
        .y(function (d) {
          return y(d.population);
        })
    );
  }

  // Trend by Period
  const svgTrend = d3
    .select(div)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block");
  // Review the following lines
  // .attr("preserveAspectRatio", "xMidYMid meet")
  // .append("g")
  // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svgTrend
    .append("clipPath")
    .attr("id", clipIdTrend.id)
    .append("rect")
    .attr("x", margin.left)
    .attr("y", 0)
    .attr("height", height - margin.bottom)
    .attr("width", width - margin.left - margin.right);

  const gridY = svgTrend.append("g"),
    mainGx = svgTrend.append("g"),
    mainGy = svgTrend.append("g").attr("class", "grid");

  /*
The order trendPath and trendMarkers determines which appears on top
To have the markers on top, draw the path (line) first and then 'paint' the circles on top
*/

  const trendPath = svgTrend
    .append("path")
    // .datum(dataArr)
    .attr("clip-path", clipIdTrend)
    .attr("class", "trend-line");

  const trendMarkers = svgTrend.append("g");
  trendMarkers.attr("clip-path", clipIdTrend);

  // Toggle the y-axis on the trend chart to show 0 or nice
  const trendYAxisZero = document.getElementById("trend-yAxis");
  trendYAxisZero.addEventListener("click", function () {
    yAxisZero = trendYAxisZero.checked;
    chartTrendDraw();
  });

  // Define the div for the tooltip
  const tooltipTrend = newTooltip.tooltip(div);
  tooltipTrend.style("height", "40px");

  // Minimap
  const svgMini = d3
    .select(div)
    .append("svg")
    .attr("viewBox", [0, 0, width, miniMapHeight])
    .style("display", "block");
  // .attr("preserveAspectRatio", "xMidYMid meet")
  // .append("g")
  // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // svgMini
  //   .append("g")
  //   .attr("class", "x axis")
  //   .attr("id", "axis--x--mini")
  //   .attr("transform", `translate(0, ${miniMapHeight})`)
  //   .attr("x", chtWidthWide / 2)
  //   .attr("y", 30)
  //   .call(xAxis);

  svgMini.append("path").attr("fill", "steelblue").attr("class", "trend-line");
  const selectedPeriodMini = svgMini.append("g");
  // const selectedPeriodMarker = d3.symbol().type(d3.symbolCircle).size(64);

  // svgMini
  //   .append("g")
  //   .attr("class", "y axis")
  //   .attr("id", "axis--y--mini")
  //   .call(yAxisMini);

  // Controls the brush range
  // Need to match the x-scale Range
  const brush = d3
    .brushX()
    .extent([
      [x.range()[0], 0.5],
      [x.range()[1], miniMapHeight - margin.bottom + 0.5],
      0,
    ]);
  // .on("brush", brushed)
  // .on("end", brushended);

  // custom handles
  // https://observablehq.com/@d3/brush-handles
  const brushHandle = (g, selection) =>
    g
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1.5)
            .attr("cursor", "ew-resize")
        // .attr("d", brushHandleStyle)
      )
      .attr("display", selection === null ? "none" : null)
      .attr(
        "transform",
        selection === null
          ? null
          : (d, i) => `translate(${selection[i]},${miniMapHeight - 60})`
      );

  // style brush resize handle
  // https://observablehq.com/@d3/brush-handles
  /*
  const brushHandleStyle = d3
    .arc()
    .innerRadius(0)
    .outerRadius(15)
    .startAngle(0)
    .endAngle((d, i) => (i ? Math.PI : -Math.PI));
    */

  function brushed({ selection }) {
    if (selection) {
      // console.log(selection)
      brushRange = selection;
      // update logic goes here - to get args for chartUpdate
      const [minX, maxX] = selection.map(x.invert, x).map(d3.utcMonth.round);
      const minY = d3.min(dataArr, (d) =>
        minX <= d.period && d.period <= maxX ? d.population : NaN
      );
      const maxY = d3.max(dataArr, (d) =>
        minX <= d.period && d.period <= maxX ? d.population : NaN
      );

      const focusX = x.copy().domain([minX, maxX]);
      let focusY;
      // consider testing for yAxisZero here
      if (yAxisZero) {
        focusY = y.copy().domain([0, maxY]);
      } else {
        focusY = y.copy().domain([minY, maxY]); // option to set minY to 0 here
      }
      // call chart update
      updateChart(focusX, focusY);
    }
    d3.select(this).call(brushHandle, selection);
  }

  // function moveBrush(brushExtent) {

  //       /* this is a copy of the brushed function
  //   Can be used externally to move brush by passing an array of the extent [a, b]
  //       */
  //   const minX = d3.utcMonth.round(x.invert(brushExtent[0]))
  //   const maxX = d3.utcMonth.round(x.invert(brushExtent[1]))
  //       const minY = d3.min(dataArr, (d) =>
  //         minX <= d.period && d.period <= maxX ? d.population : NaN
  //       );
  //       const maxY = d3.max(dataArr, (d) =>
  //         minX <= d.period && d.period <= maxX ? d.population : NaN
  //       );

  //       const focusX = x.copy().domain([minX, maxX]);
  //       let focusY;
  //       // consider testing for yAxisZero here
  //       if (yAxisZero) {
  //         focusY = y.copy().domain([0, maxY]);
  //       } else {
  //         focusY = y.copy().domain([minY, maxY]); // option to set minY to 0 here
  //       }
  //       // call chart update
  //       updateChart(focusX, focusY);

  //     // d3.select(this).call(brushHandle, selection);
  //   }

  // If click anywhere on miniMap chart, will jump back to the default selection
  // function brushended({ selection }) {
  //   if (!selection) {
  //     gb.call(brush.move, fullRangeSelection); // defaultSelection
  //   }
  // }

  function brushended(event) {
    const selection = event.selection;
    // If no selection (ie. user just clicks in brush area) then pick a default range
    if (!selection) {
      gb.call(brush.move, fullRangeSelection); // defaultSelection
    }
    if (!event.sourceEvent || !selection) return;
    // The below is used to snap the brush (ie. fix it the a given interval)
    const interval = d3.timeMonth.every(1);
    const [x0, x1] = selection.map((d) => interval.round(x.invert(d)));
    d3.select(this)
      .transition()
      .call(brush.move, x1 > x0 ? [x0, x1].map(x) : null);
  }

  function updateChart(focusX, focusY) {
    mainGx.call(xAxis, focusX, height);
    // gridY.call(yGridlines, focusY);
    mainGy.call(yAxis, focusY, "Population");
    trendPath.attr("d", plotLine(focusX, focusY));
    trendMarkers
      .selectAll(".trend-circle")
      .attr("cx", function (d) {
        return focusX(d.period);
      })
      .attr("cy", function (d) {
        if (d.population === undefined) {
          return focusY(0);
        } else {
          return focusY(d.population);
        }
      });
  }

  function updateMiniMarker() {
    // Used to display a marker showing the selected date
    selectedPeriodMini
      .selectAll("circle")
      .data(dataArr, function (d) {
        return d.period;
      })
      .classed("selected-period-marker", function (d) {
        return d.period === userSelections.selectedDate;
      })
      .style("opacity", function (d) {
        if (d.period === userSelections.selectedDate) {
          return 1;
        } else {
          return 0;
        }
      });
  }

  function chartTrendDraw() {
    let newData; // This is a map, use keys and values to retrieve values
    if (
      !userSelections.selectedPractice ||
      userSelections.selectedPractice === "All Practices"
    ) {
      // no practice selected, default
      newData = d;
    } else {
      newData = dataLevel_02.get(userSelections.selectedPractice);
    }
    dataArr = Array.from(newData, ([key, value]) => ({
      period: key,
      population: value,
    }));
    x.domain(d3.extent(newData.keys()));
    svgMini.append("g").call(xAxis, x, miniMapHeight);

    // d3 transition
    // const t = d3.transition("trend").duration(750).ease(d3.easeQuadInOut);

    if (yAxisZero) {
      // .domain(d3.extent(data, (d) => d.population)) // d3.max(data, (d) => d.population)
      y.domain([0, d3.max(newData.values())]).nice(); // this updates the actual data
    } else {
      y.domain(d3.extent(newData.values())).nice();
    }

    yMini.domain(d3.extent(newData.values())); // keep this to extent rather than 0. No need to .nice()

    // Add x and Y axes to main chart
    mainGx.call(xAxis, x, height);
    mainGy.call(yAxis, y);
    // Use this to set the inital brush position. ie. latest 2 years
    defaultSelection = [
      x(d3.utcYear.offset(d3.max(newData.keys()), -2)), // latest period - 2 years
      x(d3.max(newData.keys())), // latest date converted to width (range)
    ];
    // Alternative option to select the full period range
    fullRangeSelection = [
      x(d3.min(newData.keys())), // earliest date converted to width (range)
      x(d3.max(newData.keys())), // latest date converted to width (range)
    ];

    if (initialiseBool) {
      // only append the brush on the first call
      gb = svgMini.append("g").call(brush); // .call(brush.move, defaultSelection);

      brush.on("brush", brushed).on("end", brushended);
      // initialiseBool = false; // set this in last step
    }

    // svgTrend.select("#axis--y").transition(t).call(yAxis).selectAll("text");

    svgTrend
      .selectAll(".trend-line")
      .datum(dataArr)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.call((enter) => enter.append("path")),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "trend-line")
      // .transition(t)
      .attr("d", plotLine(x, y.copy().range([height - margin.bottom, 4])));

    // https://observablehq.com/@d3/selection-join
    // Circle Markers
    trendMarkers
      .selectAll(".trend-circle") // trend circles
      .data(dataArr, function (d) {
        return d.period;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) =>
          enter
            .append("circle")
            // .datum(function (d, i) {
            //   let x, y;
            //   [x, y, i] = [d, data.get(d), i];
            //   // console.log([x, y, i])
            //   return [x, y, i];
            // })
            // mouse events need to go before any transitions

            .call(
              (enter) => enter
              // .transition(t)
              // .delay(function ([x, y, i]) {
              //   // a different delay for each circle
              //   return i * 50;
              // })
              // .attr("cy", function (d) {
              //   return y(d.population);
              // })
            ),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        // update.call((update) =>
        //   update.transition(t).attr("cy", function (d) {
        //     return y(data.get(y));
        //   })
        // ),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .on("click", function (event, d) {
        userSelections.selectedDate = d.period;
        console.log("selectedDate:", formatPeriod(d.period)); // selectedDate
        // line below needs to be selectAll (2 instances, current and new?)
        // this removes any previously applied formatting
        d3.selectAll(".trend-circle.highlight").attr("class", "trend-circle");
        const sel = d3.select(this);
        sel.raise();
        sel.classed("highlight", true);

        updateMiniMarker();
        refreshChartsPostDateChange();
      })
      .on("mouseover", function (event, d) {
        const sel = d3.select(this);

        sel.raise(); // brings the marker to the top
        sel.classed("highlight toTop", true);

        const pos = this.getBoundingClientRect();

        const str = `<strong>${formatPeriod(new Date(d.period))}</strong><br>
    <span style="color:red">
      ${formatNumber(d.population)}
      </span>`;
        newTooltip.counter++;
        newTooltip.mouseover(tooltipTrend, str, event, pos);
      })
      .on("mouseout", function (event, d) {
        const sel = d3.select(this);
        sel.lower();
        sel.attr("class", "trend-circle faa-vertical");
        sel.classed("highlight animated", function (d) {
          return d.period === userSelections.selectedDate;
        });
        newTooltip.mouseout(tooltipTrend);
      })
      // .on("mouseleave", function () {
      //   const item = d3.select(this);

      // })
      // .on("mousemove", function (event, d) {

      // })
      .attr("class", "trend-circle faa-vertical")
      .classed("highlight animated", function (d) {
        return d.period === userSelections.selectedDate;
      })
      // .transition(t)
      .attr("r", 5)
      .attr("cx", function (d) {
        return x(d.period);
      })
      .attr("cy", function (d) {
        return y(d.population);
      });
    // .style("fill", "rgba(70, 180, 130, 0.5");

    // svgTrend
    // .select("#axis--x")
    // .transition(t)
    // .call(xAxis)
    // .selectAll("text");

    // svgMini
    // .select("#axis--x--mini")
    // .transition(t)
    // .call(xAxis)
    // .selectAll("text");

    // svgMini
    //   .select("#axis--y--mini")
    //   .transition(t)
    //   .call(yAxisMini)
    // .selectAll("text");

    svgMini
      .selectAll(".trend-line")
      .datum(dataArr)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.call((enter) => enter.append("path")),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "trend-line")
      // .transition(t)
      .attr(
        "d",
        plotLineMini(x, yMini.range([miniMapHeight - margin.bottom, 4]))
      );

    selectedPeriodMini
      .selectAll("circle") // trend circles
      .data(dataArr, function (d) {
        return d.period;
      })
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
      .attr("r", 3)
      .attr("cx", function (d) {
        return x(d.period);
      })
      .attr("cy", function (d) {
        yMini.range([miniMapHeight - margin.bottom, 4]);
        return yMini(d.population);
      });
    updateMiniMarker();

    // moveBrush(defaultSelection)
    if (initialiseBool) {
      gb.call(brush.move, defaultSelection); // fullRangeSelection
      initialiseBool = false;
    } else {
      gb.call(brush.move, brushRange);
    }
  }

  return {
    chartTrendDraw: chartTrendDraw,
  };
}

// ###########################################################################################

// ############################### gp_popn_bar.js #######################################

function initPopnBarChart(dataInit, id) {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const div = document.getElementById(id);
  // Create the drop down to sort the chart
  const span = document.createElement("span");

  span.setAttribute("class", "search");
  span.textContent = "Sort By: ";
  div.appendChild(span);

  // Add a drop down
  const frag = document.createDocumentFragment(),
    select = document.createElement("select");

  select.setAttribute("class", "dropdown-input");

  // Option constructor: args text, value, defaultSelected, selected
  select.options.add(new Option("Alphabetical (Code)", 0, true, true));
  select.options.add(new Option("Popn Asc", 1));
  select.options.add(new Option("Popn Desc", 2));
  select.options.add(new Option("Alphabetical (Name)", 3));

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    fnRedrawBarChart();
  });

  // this is same as dataPopulationGPSummary
  const d = d3.rollup(
    dataInit,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => +d.Period,
    (d) => d.Practice
  );

  const svg = d3
    .select(div)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
      ${chtWidthWide + margin.left + margin.right}
${chtHeightStd + 60}`
    );

  let sortType = 0;

  let tooltipPopnBar = newTooltip
    .tooltip(div)
    .style("height", "65px")
    .style("width", "150px");

  let x = d3
    .scaleBand()
    .range([margin.left, chtWidthWide - margin.right])
    .padding(0.1);

  let y = d3.scaleLinear().nice().range([chtHeightStd, margin.top]);

  const yAxisBar = d3
    .axisLeft()
    .scale(y)
    .tickSize(-(chtWidthWide - margin.left - margin.right));

  svg
    .append("g")
    .attr("class", "y axis grid")
    .attr("id", "axis--yBar")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxisBar)
    // text label for the y axis
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 10 - margin.left)
    .attr("x", 0 - chtHeightStd / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Population");

  function fnRedrawBarChart() {
    const newData = d.get(userSelections.selectedDate);

    /* Convert map to array of objects
  https://github.com/d3/d3-array#transformations

  This is currently required for enter/ update to work
  In the near future, selection.data will accept iterables directly,
  meaning that you can use a Map (or Set or other iterable) to perform a data join
  without first needing to convert to an array.
  */

    const arr = Array.from(newData, ([key, value]) => ({
      practice: key,
      population: value,
    }));

    // d3 transition
    const t = d3.transition("sortOrder").duration(750).ease(d3.easeQuadInOut);
    // Updates the x domain based on the sort order drop down
    barChartOrder(newData);

    // x.domain( //  this is now handled in the sort function
    //   newData.keys()
    //   // data.map(function (d) {
    //   //   return d[0];
    //   // })
    // )

    // max y value used for domain and colour scheme so calculate once here
    const yMax = d3.max(newData.values());

    y.domain([
      0,
      yMax,
      //   data, function (d) {
      //   return d.value;
      // }
      // ),
    ]);
    svg.select("#axis--yBar").transition(t).call(yAxisBar).selectAll("text");

    svg
      .selectAll("rect")
      .data(arr, function (d) {
        return d.practice;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) =>
          enter
            .append("rect")

            .call((enter) =>
              enter
                .attr("x", function (d) {
                  return x(d.practice);
                })
                .attr("y", function (d, i) {
                  return chtHeightStd;
                })
                .attr("height", function (d, i) {
                  return 0;
                })
            ),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .on("click", function (event, d) {
        console.log("selPractice:", d.practice);
      })
      .on("mousemove", function (event, d) {
        const sel = d3.select(this);
        sel.attr("fill", "red");
        const pos = this.getBoundingClientRect();
        const str = `<strong>Code: ${d.practice}</strong><br>
<span style="color:red">
  ${practiceLookup.get(d.practice)}
  </span><br>
Popn: ${formatNumber(d.population)}
  `;
        newTooltip.mousemoveV(tooltipPopnBar, str, event, pos, { y: -30 });
      })
      .on("mouseout", function () {
        const sel = d3.select(this);
        newTooltip.mouseout(tooltipPopnBar);
        sel
          .transition("tempFill")
          .duration(250)
          .attr("fill", function (d) {
            return d3.interpolateGreys(
              d3.max([1.0 - d.population / yMax, 0.4])
            );
          });
      })
      .attr("class", "bar")
      .classed("barPopn highlight", function (d) {
        return d.practice === userSelections.selectedPractice;
      })
      .transition(t)
      .attr("fill", function (d) {
        return d3.interpolateGreys(d3.max([1.0 - d.population / yMax, 0.4]));
      })
      .attr("width", x.bandwidth())
      .attr("y", function (d, i) {
        return y(d.population);
      })
      .attr("height", function (d, i) {
        return chtHeightStd - y(d.population);
      })
      .attr("x", function (d) {
        return x(d.practice);
      });

    svg
      .selectAll(".bar-label")
      .data(newData.keys(), function (d) {
        return d;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("text").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "axis bottom")
      .classed("bar-label", true)
      .attr("font-family", "sans-serif")
      .attr("font-size", "0.65rem")
      .transition(t)
      .delay(function ([x, y, i]) {
        return i * 50;
      })
      .attr("transform", function (d, i) {
        return `translate(
      ${x(d) + x.bandwidth() / 2 - 20},
      ${chtHeightStd + 60})
      rotate(-60)`;
      })
      .attr("text-anchor", "start")
      .text(function (d) {
        return d;
      });

    // remove outside border
    svg.select("g").select(".domain").remove();
  }

  function barChartOrder(data) {
    let mapOrdered, sortStringValues;
    // let t = d3.transition().duration(750).ease(d3.easeBounce);

    sortType = +eval(d3.select(select).property("value"));
    // sortDesc = d3.select("#popnBarDropDown option:checked").text();

    switch (sortType) {
      case 0: // alphabetical by Code, A-Z
        mapOrdered = [...data.keys()].sort(); // map keys to array and then sort
        x.domain(mapOrdered);
        break;
      case 1: // volume ascending
        // https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object
        sortStringValues = (a, b) =>
          (a[1] > b[1] && 1) || (a[1] === b[1] ? 0 : -1);
        mapOrdered = new Map([...data].sort(sortStringValues));
        x.domain(mapOrdered.keys()); // volume
        break;
      case 2: // volume descending
        sortStringValues = (b, a) =>
          (a[1] > b[1] && 1) || (a[1] === b[1] ? 0 : -1);
        mapOrdered = new Map([...data].sort(sortStringValues));
        x.domain(mapOrdered.keys()); // volume
        break;
      case 3: // alphabetical by Name, A-Z
        // create an array of unordered codes
        // replace codes with practice name
        const mapUnordered = [...data.keys()];
        mapUnordered.forEach(function (item, index) {
          mapUnordered[index] = practiceLookup.get(item);
        });
        mapOrdered = mapUnordered.sort(); // order array A-Z by name

        // loop through array and then practice Lookup Map
        // Use a 'reverse' lookup from the map, the value to the key.
        mapOrdered.forEach(function (item, index) {
          for (let [key, value] of practiceLookup.entries()) {
            if (item === value) {
              mapOrdered[index] = key;
            }
          }
        });

        x.domain(mapOrdered); // volume
        break;
    }
  }

  return {
    fnRedrawBarChart: fnRedrawBarChart,
  };
}

// ###########################################################################################

// ############################### gp_popn_demographics.js #######################################

/*
Based on this example:
    https://stackoverflow.com/questions/25044997/creating-population-pyramid-with-d3-js/25050764#25050764
    https://codepen.io/netkuy/pen/KzPaBe

    Transitions: https://gist.github.com/martinjc/7fa5deb1782da2fc6da15c3fad02c88b
    */

function initChartDemog(dataInit, id) {
  const div = document.getElementById(id);
  // Total by Period and Age Band - Trend Chart Filtered
  // Initial data used as starting point (totals for all practices)
  const data_DemoInit = d3.rollup(
    dataInit,
    function (v) {
      return {
        total: d3.sum(v, function (d) {
          return d.Total_Pop;
        }),
        male: d3.sum(v, function (d) {
          return d.Male_Pop;
        }),
        female: d3.sum(v, function (d) {
          return d.Female_Pop;
        }),
      };
    },
    (d) => +d.Period,
    (d) => d.Age_Band
  );

  // const dataLevel_03 = d.get(+userSelections.selectedDate); // data_DemoInit

  // by age/ sex, by practice by period
  const dataLevel_04 = d3.rollup(
    dataInit,
    function (v) {
      return {
        total: d3.sum(v, function (d) {
          return d.Total_Pop;
        }),
        male: d3.sum(v, function (d) {
          return d.Male_Pop;
        }),
        female: d3.sum(v, function (d) {
          return d.Female_Pop;
        }),
      };
    },
    (d) => d.Practice,
    (d) => +d.Period,
    (d) => d.Age_Band
  );

  let maxValue = 0;

  // for the demographic chart layout
  const marginDemog = {
    top: 5,
    right: 15,
    bottom: 40,
    left: 15,
    middle: 20,
  };

  // Demographic breakdown (age, sex)
  const svgDemog = d3
    .select(div)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
            ${chtWidthWide + marginDemog.left + marginDemog.right}
            ${chtHeightShort + marginDemog.top + marginDemog.bottom}
            `
    ) // to ensure x-axis appears
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    // .attr("class", "inner-region")
    .attr("transform", `translate(${marginDemog.left}, ${marginDemog.top})`);

  // the width of each side of the chart
  const regionWidth = chtWidthWide / 2 - marginDemog.middle;

  // these are the x-coordinates of the y-axes
  const pointA = regionWidth, // the x-coordinate of the zero line for male population
    pointB = chtWidthWide - regionWidth; // the corresponding point for the female population

  // Make groups for each side of chart
  // scale(-1, 1) is used to reverse the left side so the bars grow left instead of right
  // let leftBarGroup, rightBarGroup;

  // the xScale goes from 0 to the width of a region
  // it will be reversed for the left x-axis
  // const xScale = d3
  //   .scaleLinear()
  //   .range([0, regionWidth]) // can add an adjustment here but bars need adjusting...
  //   .nice();

  const xScaleLeft = d3.scaleLinear().range([regionWidth, 0]).nice(); //  this reverses the direction of the scale (n to 0)
  const xScaleRight = d3.scaleLinear().range([0, regionWidth]).nice(); // (0 to n)
  const xAxisAdj = 0.0005; // used to prevent cut off of the xAxis labels

  let xAxisLeft = d3
    .axisBottom(xScaleLeft) // xScale.copy().range([pointA, 0])
    .tickSize(-(chtWidthWide - margin.left - margin.right))
    // Reverse the x-axis scale on the left side by reversing the range
    .tickFormat(function (d) {
      if (maxValue < 0.1) {
        return formatPercent1dp(d);
      } else {
        return formatPercent(d);
      }
    });

  let xAxisRight = d3
    .axisBottom(xScaleRight)
    .tickSize(-(chtWidthWide - margin.left - margin.right))
    .tickFormat(function (d) {
      if (maxValue < 0.1) {
        return formatPercent1dp(d);
      } else {
        return formatPercent(d);
      }
    });

  const yScale = d3
    .scaleBand()
    .rangeRound([chtHeightShort, 0])
    .paddingInner(0.2) // space between bars
    .paddingOuter(0); // space at top/ bottom of bars

  const tickAdj = 2; // used to ensure y-axis text centres horizontally

  // set up axes
  const yAxisLeft = d3
    .axisRight(yScale)
    .tickSize(tickAdj, 0) // sets the length (in svg units) of the tick marks coming out from the axis.
    .tickPadding(marginDemog.middle - tickAdj); // how far away from the end of the tick mark the text-anchor of the label text is placed

  const yAxisRight = d3
    .axisLeft(yScale)
    .tickSize(tickAdj, 0) // sets the length (in svg units) of the tick marks coming out from the axis (inner, outer)
    .tickFormat(""); // set to the empty string to remove tick labels from one of the axes, so that no overlapping occurs.

  // Hard code age bands using 'Age Band Org' (original) figures to keep in order
  // this version can be used if in the 'row' function use Age_Band: d.Age_Band_Org,
  // However, in earlier versions, age was capped at 85+ years
  // var ageBands = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95+']

  // For consistency historically, use the following
  // Age_Band: d.Age_Band,
  const ageBands = [
    "0-4",
    "5-9",
    "10-14",
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59",
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80-84",
    "85+",
  ];

  yScale.domain(ageBands);
  const emptyDemog = emptyDemographic();

  const tooltipDemog = newTooltip
    .tooltip(div)
    .style("height", "65px")
    .style("width", "120px");

  svgDemog
    .append("g")
    .attr("class", "axis y left")
    .attr("transform", translation(pointA, 0))
    .call(yAxisLeft)
    .selectAll("text")
    .style("text-anchor", "middle");

  svgDemog
    .append("g")
    .attr("class", "axis y right")
    .attr("transform", translation(pointB, 0))
    .call(yAxisRight);

  svgDemog
    .append("g")
    .attr("class", "axis x left grid")
    .attr("transform", translation(0, chtHeightShort));

  svgDemog
    .append("g")
    .attr("class", "axis x right grid")
    .attr("transform", translation(pointB, chtHeightShort));

  // Add row chart to highlight eg. over 65s
  // const footer = document.getElementById("over65s");
  const footer = document.getElementById("cht_PopDemo").nextElementSibling;
  const tooltipOverAge = newTooltip
    .tooltip(footer)
    .style("height", "60px")
    .style("width", "220px");

  // Population over age ...
  const chtHeightMini = chtHeightShort / 2;
  const svgOverAge = d3
    .select(footer)
    .append("svg")
    .attr(
      "viewBox",
      `0 0
          ${chtWidthWide + margin.left + margin.right}
    ${chtHeightMini + 20}`
    )
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left - 20})`);

  const xScaleOverAge = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, chtWidthWide])
    .nice();
  const yScaleOverAge = d3
    .scaleBand()
    .rangeRound([chtHeightMini, 0])
    .paddingInner(0.2) // space between bars
    .paddingOuter(0.5); // space at top/ bottom of bars

  const xAxisOverAge = d3.axisBottom(xScaleOverAge).tickFormat(formatPercent),
    yAxisOverAge = d3.axisLeft(yScaleOverAge).tickSizeOuter(0);

  svgOverAge
    .append("g")
    // .attr("class", "x axis")
    .attr("id", "axis--x--overage")
    .attr("transform", `translate(0, ${chtHeightMini - 20})`)
    .call(xAxisOverAge)
    .append("text")
    .attr("x", chtWidthWide / 2)
    .attr("dy", "35px")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("fill", "#000000") // font colour
    .text("Population Aged Over 65");

  svgOverAge
    .append("g")
    // .attr("class", "y axis")
    .attr("id", "axis--yBar--overage")
    // .attr("transform", `translate(0,0)`)
    .call(yAxisOverAge);
  // text label for the y axis
  // .append("text")
  // .attr("transform", "rotate(-90)")
  // .attr("y", -35)
  // .attr("x", 0 - chtHeightMini / 2)
  // .attr("dy", "1em")
  // .style("text-anchor", "middle")
  // .style("font-weight", "bold")
  // .text("Practice");

  function updateChtDemog(practiceMain, practiceComp) {
    let chtDataP1, chtDataP2;

    // Main Practice Data
    if (userSelections.selectedPractice === "Default") {
      practiceMain = undefined;
    }

    if (!practiceMain || practiceMain === "All Practices") {
      practiceMain = undefined;
      // no practice selected, undefined - use the original data source (All Practices)
      chtDataP1 = data_DemoInit.get(userSelections.selectedDate);
    } else {
      chtDataP1 = dataLevel_04
        .get(practiceMain)
        .get(userSelections.selectedDate);
    }

    // Comparison Practice Data
    if (!practiceComp || practiceComp === "None") {
      practiceComp = undefined;
      // no practice comparison selected
      chtDataP2 = emptyDemog;
    } else if (practiceComp === "All Practices") {
      chtDataP2 = data_DemoInit.get(userSelections.selectedDate);
    } else {
      chtDataP2 = dataLevel_04
        .get(practiceComp)
        .get(userSelections.selectedDate);
    }

    chartDemogDraw(chtDataP1, chtDataP2);
  }

  function chartDemogDraw(dataP1, dataP2 = emptyDemog, ageOver = 65) {
    // d3 transition
    let t = d3.transition().duration(750).ease(d3.easeQuadInOut); // https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe

    const totalPop1 = fnTotalPopulation(dataP1, "total"),
      totalPop2 = fnTotalPopulation(dataP2, "total"),
      totalPop1Male = fnTotalPopulation(dataP1, "male"),
      totalPop1Female = fnTotalPopulation(dataP1, "female");
    // console.log({
    //   pop1: totalPop1,
    //   pop2: totalPop2,
    //   pop1Male: totalPop1Male,
    //   pop1Female: totalPop1Female,
    // });

    // find the maximum data value on either side
    // Use this to provide a symmetrical x-axes

    let popn1MaxMale = 0,
      popn1MaxFemale = 0,
      popn2MaxMale = 0,
      popn2MaxFemale = 0;

    for (let value of dataP1.values()) {
      // totalPop += value.total;
      popn1MaxMale = Math.max(popn1MaxMale, value.male / totalPop1);
      popn1MaxFemale = Math.max(popn1MaxFemale, value.female / totalPop1);
    }

    if (totalPop2 > 0) {
      for (let value of dataP2.values()) {
        // totalPop += value.total;
        popn2MaxMale = Math.max(popn2MaxMale, value.male / totalPop2);
        popn2MaxFemale = Math.max(popn2MaxFemale, value.female / totalPop2);
      }
    }

    maxValue = Math.max(
      popn1MaxMale,
      popn1MaxFemale,
      popn2MaxMale,
      popn2MaxFemale
    );
    // console.log(maxValue);

    //xScale.domain([0, maxValue + xAxisAdj]);
    xScaleLeft.domain([0, maxValue + xAxisAdj]);
    xScaleRight.domain([0, maxValue + xAxisAdj]);
    // yScale.domain(chtDataDemog.map(function(d) {return d.key; }))
    // yScale.domain(ageBands);

    // x-axis drawn once xScale domain calculated
    svgDemog
      .select(".axis.x.left")
      .transition(t)
      .call(xAxisLeft)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -7) // shifts text up (+) or down (-)
      .attr("dy", ".35em") // shifts text left (+) or right
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");
    svgDemog
      .select(".axis.x.right")
      .transition(t)
      .call(xAxisRight)
      // to rotate the axis text
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -7) // shifts text up (+) or down (-)
      .attr("dy", ".35em") // shifts text left (+) or right
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

    // remove outside border
    svgDemog.selectAll("g.axis.x").select(".domain").remove();

    const arrP1 = Array.from(dataP1, ([key, value]) => ({
      ageBand: key,
      population: value,
    }));
    const arrP2 = Array.from(dataP2, ([key, value]) => ({
      ageBand: key,
      population: value,
    }));

    // https://observablehq.com/@d3/selection-join
    svgDemog
      .selectAll(".bar.left")
      .data(arrP1, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      // mouse events need to go before any transitions
      .on("click", function (event, d) {
        console.log("selAge:", d.ageBand);
      })
      .on("mousemove", function (event, d) {
        const sel = d3.select(this);
        sel.attr("class", "bar hover");

        const pos = this.getBoundingClientRect();

        const str = `<strong>Male: ${d.ageBand} yrs</strong><br>
                <span style="color:red">
                  Pop'n: ${formatNumber(d.population.male)}
                  </span><br>
                % Total: ${formatPercent1dp(d.population.male / totalPop1)}
                <br>
                % Male: ${formatPercent1dp(d.population.male / totalPop1Male)}
                  `;
        newTooltip.mousemoveH(tooltipDemog, str, event, pos);
      })
      .on("mouseout", function () {
        const sel = d3.select(this);
        sel.attr("class", "bar left");
        newTooltip.mouseout(tooltipDemog);
      })
      .attr("class", "bar left")
      .transition(t)
      .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
      .attr("y", function (d) {
        return yScale(d.ageBand);
      })
      .attr("width", function (d) {
        // console.log(d.population.male)
        return xScaleRight(d.population.male / totalPop1); // not sure why but xScaleLeft reverses this!
      })
      .attr("height", yScale.bandwidth());

    svgDemog
      .selectAll(".bar.right")
      .data(arrP1, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      .on("click", function (event, d) {
        console.log("selAge:", d.ageBand);
      })
      .on("mousemove", function (event, d) {
        const sel = d3.select(this);
        sel.attr("class", "bar hover");
        const pos = this.getBoundingClientRect();
        const str = `<strong>Female: ${d.ageBand} yrs</strong><br>
        <span style="color:red">
          Pop'n: ${formatNumber(d.population.female)}
          </span><br>
        % Total: ${formatPercent1dp(d.population.female / totalPop1)}
        <br>
        % Female: ${formatPercent1dp(d.population.female / totalPop1Female)}
          `;
        newTooltip.mousemoveH(tooltipDemog, str, event, pos);
      })
      .on("mouseout", function () {
        const sel = d3.select(this);
        sel.attr("class", "bar right");
        newTooltip.mouseout(tooltipDemog);
      })
      .attr("class", "bar right")
      .transition(t)
      .attr("transform", translation(pointB, 0))
      .attr("y", function (d) {
        return yScale(d.ageBand);
      })
      .attr("width", function (d) {
        // console.log(x.population.female)
        return xScaleRight(d.population.female / totalPop1); // not sure why but xScaleLeft reverses this!
      })
      .attr("height", yScale.bandwidth());

    // Comparison Bars
    svgDemog
      .selectAll(".bar-comp.left")
      .data(arrP2, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      .attr("class", "bar-comp left")
      .transition(t)
      .attr("transform", translation(pointA, 0) + "scale(-1, 1)")
      .attr("y", function (d) {
        return yScale(d.ageBand) + 1;
      })
      .attr("width", function (d) {
        if (totalPop2 > 0) {
          return xScaleRight(d.population.male / totalPop2); // not sure why but xScaleLeft reverses this!
        } else {
          return 0;
        }
      })
      .attr("height", yScale.bandwidth() - 2);

    svgDemog
      .selectAll(".bar-comp.right")
      .data(arrP2, function (d) {
        return d.ageBand;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("rect").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.transition(t).remove())
      )
      .attr("class", "bar-comp right")
      .transition(t)
      .attr("transform", translation(pointB, 0))
      .attr("y", function (d) {
        return yScale(d.ageBand) + 1;
      })
      .attr("width", function (d) {
        if (totalPop2 > 0) {
          return xScaleRight(d.population.female / totalPop2); // not sure why but xScaleLeft reverses this!
        } else {
          return 0;
        }
      })
      .attr("height", yScale.bandwidth() - 2);

    // Population greater than or equal to eg. 65 (default)
    const selectedPop1 = subPopulation(ageOver, dataP1);
    const selectedPop2 = subPopulation(ageOver, dataP2);

    const arrOverAge = [
      {
        practice: !userSelections.selectedPractice
          ? "All Practices"
          : userSelections.selectedPractice,
        popn: { selPopn: selectedPop1, pct: selectedPop1 / totalPop1 },
      },
    ];

    if (userSelections.selectedPracticeCompare === "None") {
      // do nothing
    } else {
      const objCompare = {
        practice: userSelections.selectedPracticeCompare,
        popn: { selPopn: selectedPop2, pct: selectedPop2 / totalPop2 },
      };
      arrOverAge.push(objCompare);
    }

    yScaleOverAge.domain(
      arrOverAge.map(function (d) {
        return d.practice;
      })
    );
    svgOverAge
      .select("#axis--yBar--overage")
      .transition(t)
      .call(yAxisOverAge)
      .selectAll("text");

    svgOverAge
      .selectAll(".backgroundBar")
      .data(arrOverAge)
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
      .attr("class", "backgroundBar")
      .attr("width", function (d) {
        return xScaleOverAge(1);
      })
      .attr("y", function (d, i) {
        return yScaleOverAge(d.practice);
      })
      .attr("height", yScaleOverAge.bandwidth());

    svgOverAge
      .selectAll(".bar")
      .data(arrOverAge)
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
      .on("mouseover", function (event, d) {
        const pos = this.getBoundingClientRect();
        const practiceName = practiceLookup.has(d.practice)
          ? `: ${titleCase(practiceLookup.get(d.practice))}`
          : "";
        const str = `<strong>${d.practice}${practiceName}</strong><br>
    <span style="color:red">
    Population over ${ageOver}: ${formatNumber(d.popn.selPopn)}
    </span><br>
    Percent over ${ageOver}: ${formatPercent1dp(d.popn.pct)}
    `;
        newTooltip.mouseover(tooltipOverAge, str, event, pos);
      })
      .on("mouseout", function () {
        newTooltip.mouseout(tooltipOverAge);
      })

      .attr("class", "bar")
      .transition(t)
      .attr("fill", function (d) {
        return d3.interpolateGreens(1 - d.popn.pct);
      })
      .attr("width", function (d) {
        return xScaleOverAge(d.popn.pct);
      })
      .attr("y", function (d, i) {
        return yScaleOverAge(d.practice);
      })
      .attr("height", yScaleOverAge.bandwidth());

    svgOverAge
      .selectAll(".pctValue")
      .data(arrOverAge)
      .join(
        (
          enter // ENTER new elements present in new data.
        ) => enter.append("text").call((enter) => enter),
        (
          update // UPDATE old elements present in new data.
        ) => update.call((update) => update),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove())
      )
      .attr("class", "pctValue")
      .transition(t)
      .attr("x", function (d) {
        return xScaleOverAge(d.popn.pct);
      })
      .attr("y", function (d, i) {
        return yScaleOverAge(d.practice);
      })
      .attr("dx", "5px")
      .attr("dy", yScaleOverAge.bandwidth() / 2 + 7)
      .text(function (d) {
        return formatPercent1dp(d.popn.pct);
      });
  }

  function translation(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  function fnTotalPopulation(data, gender = "total") {
    // Get the population size and create a function for returning the percentage
    // gender can be total, female or male
    let totalPop = 0;

    if (data.size > 0) {
      for (let value of data.values()) {
        totalPop += value[gender];
      }
    }

    return totalPop;
  }

  function subPopulation(age = 0, data) {
    let populationOverAge = 0;

    if (data.size > 0) {
      for (let [key, value] of data) {
        if (key.substring(0, key.indexOf("-")) >= age) {
          populationOverAge += value.total;
        }
      }
    }

    // console.log('Over65s: ' + populationOverAge)
    // console.log('% 65s: ' + formatPercent(populationOverAge / totalPop1))

    return populationOverAge;
  }

  function emptyDemographic() {
    const demog = new Map();
    let empty = { total: 0, male: 0, female: 0 };

    // create an empty
    ageBands.forEach((item) => {
      demog.set(item, empty);
    });

    return demog;
  }

  return {
    updateChtDemog: updateChtDemog,
  };
}

// ###########################################################################################

// ############################### map_components.js #######################################

/*
Reusable map components:
	https://stackoverflow.com/questions/53594814/leaflet-multiple-maps-on-same-page
*/

// Controls
// Background and Sites layers

/* Add a sidebar
https://github.com/nickpeihl/leaflet-sidebar-v2
*/

// Populations smaller than this to be ignored
const minPopulationLSOA = 20;

// Keep track of maps
// Stores the map reference and the home location
const mapOfMaps = new Map();
// Keep track of which maps contain
const mapsWithGPMain = new Map();
const mapsWithGPSites = new Map(); // set of maps that include site codes

const mapsWithLSOA = new Map(), // default LSOA boundaries
  mapsWithLSOAFiltered = new Map();

/*
Can use like the following:
updatePopUpText(mapsWithGPMain.get(mapMain.map)[0])
*/

function mapInitialise({
  mapDivID, // divID where map will be placed
  baselayer = "None",
  userOverlayGPMain = {},
  userOverlayGPSites = {},
  userOverlayCCGBoundary = {}, // = { inc: false, display: false, zoomExtent: true },
  userOverlayWardBoundary = {},
  userOverlayLsoaBoundary = {},
  userOverlayLsoaBoundaryByIMD = {},
  userOverlayFilteredLsoa = {},
  userOverlayNationalTrusts = false,
} = {}) {
  const promTesting = Promise.allSettled([
    promGeoDataGP,
    gpDetails,
    promGeoDataCYCWards,
    promGeoDataLsoaBoundaries,
    promDataIMD,
    promHospitalDetails,
  ]);

  // Default options

  // for showing the GP Practice Main Site only
  const overlayGPMain = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayGPMain
  );

  // for showing the GP Practice Branch and Main Sites
  const overlayGPSites = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayGPSites
  );

  // for showing the CCG(03Q) boundary
  const overlayCCGBoundary = Object.assign(
    { inc: true, display: false, zoomExtent: true },
    userOverlayCCGBoundary
  );

  // for showing the CYC ward boundary
  const overlayWardBoundary = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayWardBoundary
  );

  // for showing the full lsoa boundary (not filtered)
  const overlayLsoaBoundary = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayLsoaBoundary
  );

  // for showing the full lsoa boundary (not filtered) by IMD - think this slows things down
  const overlayLsoaBoundaryByIMD = Object.assign(
    { inc: false, display: false, zoomExtent: false },
    userOverlayLsoaBoundaryByIMD
  );

  // for maps which use the filtered lsoa boundary
  const overlayFilteredLsoa = Object.assign(
    { inc: false },
    userOverlayFilteredLsoa
  );

  // for initialising maps
  const thisMap = L.map(mapDivID, {
    preferCanvas: true,
    // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
    center: trustSitesLoc.yorkTrust, // centre on York Hospital
    zoom: 11,
    minZoom: 5, // how far out eg. 0 = whole world
    maxZoom: 20, // how far in, eg. to the detail (max varies by baselayer between 18 and 20)
    // https://leafletjs.com/reference-1.3.4.html#latlngbounds
    maxBounds: [
      [50.0, 1.6232], //south west
      [59.79, -10.239], //north east
    ],
    // layers: background, // default basemap that will appear first
    fullscreenControl: {
      // https://github.com/Leaflet/Leaflet.fullscreen
      pseudoFullscreen: true, // if true, fullscreen to page width and height
    },
  });

  const baseLayer = baselayers(baselayer);

  // Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
  function scaleBar({ position = "bottomleft" } = {}) {
    return L.control
      .scale({
        // https://leafletjs.com/reference-1.7.1.html#control-scale-option
        position: position,
        metric: true,
        imperial: true,
      })
      .addTo(thisMap);
  }

  function sideBar({ side = "left" } = {}) {
    const divMapID = document.getElementById(mapDivID); // used to store div where map will be created
    // create a div that will contain the sidebar
    const div = document.createElement("div");
    // give the div an id (used to identify container) and class
    const divSidebarID = genID.uid(`sidebar${side}`).id;
    div.setAttribute("id", divSidebarID);
    div.setAttribute("class", "leaflet-sidebar collapsed");
    divMapID.insertAdjacentElement("afterend", div);

    return new L.control.sidebar({
      autopan: false, // whether to maintain the centered map point when opening the sidebar
      closeButton: true, // whether to add a close button to the panes
      container: divSidebarID, // the DOM container or #ID of a predefined sidebar container that should be used
      position: side, // left or right
    }).addTo(thisMap);
  }

  /*
    The default figures here are the VoY CCG boundary
    layersMapBoundaries.get("voyCCGMain").getBounds().getCenter()
    latLngPoint can be an array [54.018213, -0.9849195] or object {lat: 54.018213, lng: -0.9849195}
    */
  let home = { lat: 54.018213, lng: -0.9849195 };
  mapOfMaps.set(thisMap, home);

  function zoomTo({ latLng = home, zoom = 9 } = {}) {
    thisMap.flyTo(latLng, zoom);
  }

  function homeButton() {
    return L.easyButton("fa-solid fa-house", zoomTo, "Zoom To Home").addTo(
      thisMap
    );
  }

  // Panes to control zIndex of geoJson layers
  thisMap.createPane("ccgBoundaryPane");
  thisMap.getPane("ccgBoundaryPane").style.zIndex = 374;

  thisMap.createPane("wardBoundaryPane");
  thisMap.getPane("wardBoundaryPane").style.zIndex = 375;

  thisMap.createPane("lsoaBoundaryPane");
  thisMap.getPane("lsoaBoundaryPane").style.zIndex = 376;

  thisMap.createPane("lsoaBoundaryPane2");
  thisMap.getPane("lsoaBoundaryPane2").style.zIndex = 377;

  function baselayers(baselayer) {
    /*
  Ordnance Survey demo
  Need to import mapbox-gl
  Through OS Vector Tile API you can connect to different layers for different use cases, including a detailed basemap and several data overlays.
  https://osdatahub.os.uk/docs/vts/technicalSpecification

  Can also use for data overlays
  https://api.os.uk/maps/vector/v1/vts/{layer-name} eg. boundaries, greenspace

  See also for stylesheets:
  https://github.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets
  https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/

  Leaflet:
    https://osdatahub.os.uk/projects/OSMapsWebDemo
    OS_VTS_3857_No_Labels.json
    OS_VTS_3857_Open_Outdoor.json
    OS_VTS_3857_Greyscale.json
    OS_VTS_3857_Dark.json
    OS_VTS_3857_Light.json
    */

    const serviceUrl = "https://api.os.uk/maps/raster/v1/zxy",
      apiKey = "npRUEEMn3OTN7lx7RPJednU5SOiRSt35";

    let copyrightStatement =
      "Contains OS data &copy; Crown copyright and database rights YYYY"; // '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
    copyrightStatement = copyrightStatement.replace(
      "YYYY",
      new Date().getFullYear()
    );
    // Load and display vector tile layer on the map.
    const osBaselayers = {
      light: L.tileLayer(
        serviceUrl + "/Light_3857/{z}/{x}/{y}.png?key=" + apiKey,
        { minZoom: 7, maxZoom: 20, attribution: copyrightStatement }
      ),
      road: L.tileLayer(
        serviceUrl + "/Road_3857/{z}/{x}/{y}.png?key=" + apiKey,
        {
          minZoom: 7,
          maxZoom: 20,
          attribution: copyrightStatement,
        }
      ),
      outdoor: L.tileLayer(
        serviceUrl + "/Outdoor_3857/{z}/{x}/{y}.png?key=" + apiKey,
        { minZoom: 7, maxZoom: 20, attribution: copyrightStatement }
      ),
      //   // Doesn't exist for 3857 projection
      // leisure: L.tileLayer(
      //   serviceUrl + '/Leisure_3857/{z}/{x}/{y}.png?key=' + apiKey, { minZoom: 7, maxZoom: 20, attribution: copyrightStatement }
      //   ),
    };

    /*
    // Explore Ordnance Survey Overlay without mapBoxGL and how to format
    https://labs.os.uk/public/os-data-hub-examples/os-vector-tile-api/vts-example-add-overlay

    // https://api.os.uk/maps/vector/v1/vts/boundaries/resources/styles?key=npRUEEMn3OTN7lx7RPJednU5SOiRSt35
    const osOverlayBoundary = L.mapboxGL({
      attribution:
        '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
      style: `${serviceUrl}/boundaries/resources/styles?key=${apiKey}`,
      transformRequest: (url) => {
        return {
          url: (url += "&srs=3857"),
        };
      },
    });

    const osOverlay = {
      label: "OS Test <i class='material-icons md-12'>category</i>",
      selectAllCheckbox: true,
      children: [
        {
          label: "Boundary",
          layer: osOverlayBoundary,
        },
      ],
    };

    overlaysTreeMain.children[5] = osOverlay;
  */

    // http://leaflet-extras.github.io/leaflet-providers/preview/
    const baselayersTree = {
      label: "Base Layers <i class='fa-solid fa-globe'></i>",
      children: [
        {
          label: "Colour <i class='fa-solid fa-layer-group'></i>",
          children: [
            {
              label: "OSM",
              layer: L.tileLayer.provider("OpenStreetMap.Mapnik", {
                maxZoom: 19,
              }),
            },
            {
              label: "OSM HOT",
              layer: L.tileLayer.provider("OpenStreetMap.HOT", { maxZoom: 19 }),
            },
            // { label: "CartoDB", layer: L.tileLayer.provider("CartoDB.Voyager", {maxZoom:19}) },
            {
              label: "Water Colour",
              layer: L.tileLayer.provider("Stamen.Watercolor", {
                minZoom: 1,
                maxZoom: 16,
              }),
            },
            {
              label: "Bright",
              layer: L.tileLayer.provider("Stadia.OSMBright", { maxZoom: 20 }),
            }, // .Mapnik
            {
              label: "Topo",
              layer: L.tileLayer.provider("OpenTopoMap", { maxZoom: 17 }),
            },
          ],
        },
        {
          label: "Black & White <i class='fa-solid fa-layer-group'></i>",
          children: [
            // { label: "Grey", layer: L.tileLayer.provider("CartoDB.Positron", {maxZomm: 19}) },
            {
              label: "High Contrast",
              layer: L.tileLayer.provider("Stamen.Toner", {
                minZoom: 0,
                maxZoom: 20,
              }),
            },
            {
              label: "Grey",
              layer: L.tileLayer.provider("Stadia.AlidadeSmooth", {
                maxZoom: 20,
              }),
            },
            {
              label: "ST Hybrid",
              layer: L.tileLayer.provider("Stamen.TonerHybrid", {
                minZoom: 0,
                maxZoom: 20,
              }),
            },
            {
              label: "Dark",
              layer: L.tileLayer.provider("Stadia.AlidadeSmoothDark", {
                maxZoom: 20,
              }),
            },
            {
              label: "Jawg Matrix",
              layer: L.tileLayer.provider("Jawg.Matrix", {
                // // Requires Access Token
                accessToken:
                  "phg9A3fiyZq61yt7fQS9dQzzvgxFM5yJz46sJQgHJkUdbdUb8rOoXviuaSnyoYQJ", //  biDemo
                minZoom: 0,
                maxZoom: 22,
              }),
            },
          ],
        },
        {
          label: "Ordnance Survey <i class='fa-solid fa-layer-group'></i>",
          children: [
            { label: "OS Light", layer: osBaselayers.light },
            { label: "OS Road", layer: osBaselayers.road },
            { label: "OS Outdoor", layer: osBaselayers.outdoor },
            // { label: "OS Leisure", layer: osBaseLayers.leisure },
          ],
        },
        {
          label: "None",
          // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
          layer: L.tileLayer("", {
            zoom: 0,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
        },
      ],
    };

    /*
  The following loops through the baselayersTree structure looking for label name = baselayer name (passed in function)
  If found, this will be the selected (default) baselayer for the given map
  */

    for (let key in baselayersTree.children) {
      let layer;
      let found = false;
      const obj = baselayersTree.children[key];
      if (obj.hasOwnProperty("children")) {
        const arr = baselayersTree.children[key].children;

        for (let i = 0; i < arr.length; i++) {
          // console.log({ label: arr[i].label, layer: arr[i].layer });
          if (arr[i].label === baselayer) {
            layer = arr[i].layer; //.addTo(thisMap);
            found = true;
            break;
          }
        }
      } else {
        // console.log({ label: obj.label, layer: obj.layer });
        if (obj.label === baselayer) {
          layer = obj.layer; // .addTo(thisMap);
          found = true;
        }
      }
      if (found) {
        layer
          .on("tileloadstart", function (event) {
            event.tile.setAttribute("loading", "lazy");
          })
          .addTo(thisMap);
        break;
      }
    }

    return baselayersTree;
  }

  // Global to enable subsequent change to overlay
  const overlays = {
    label: "Overlays",
    selectAllCheckbox: true,
    children: [],
  };
  // to keep log of overlay position to enable addition or refresh
  let overlayIndex = 0;
  const overlayMap = new Map(); // key is layerName and value is index (int)

  // Default positions for overlayer order
  overlayMap.set("gpMain", 0);
  overlayMap.set("gpSites", 1);
  overlayMap.set("ccgBoundary", 2);
  overlayMap.set("wards", 3);
  overlayMap.set("lsoaBoundaryFull", 4);
  overlayMap.set("nationalTrusts", 5);
  overlayMap.set("selectedTrusts", 6);
  overlayMap.set("separatorLine", 7);
  overlayMap.set("gpSitesFiltered", 8);

  function updateOverlay(olName, ol, remove = false) {
    if (!overlayMap.has(olName)) {
      // if the overlay (by name) does not already exist
      const arr = Array.from(overlayMap.values());
      const maxValue = Math.max(...arr);
      if (arr.length > 0) {
        overlayIndex = maxValue + 1;
      }

      overlayMap.set(olName, overlayIndex);
      overlays.children[overlayIndex] = ol;
    } else {
      if (remove) {
        const idx = overlayMap.get(olName);
        delete overlays.children[idx];
      } else {
        const idx = overlayMap.get(olName);
        overlays.children[idx] = ol;
      }
    }
  }

  const control = layerControl();

  function layerControl() {
    return L.control.layers
      .tree(baseLayer, overlays, {
        // https://leafletjs.com/reference-1.7.1.html#map-methods-for-layers-and-controls
        collapsed: true, // Whether or not control options are displayed
        sortLayers: true,
        // namedToggle: true,
        collapseAll: "Collapse all",
        expandAll: "Expand all",
        // selectorBack: true, // Flag to indicate if the selector (+ or −) is after the text.
        closedSymbol:
          "<i class='fa-solid fa-square-plus'></i> <i class='fa-solid fa-folder'></i>", // Symbol displayed on a closed node
        openedSymbol:
          "<i class='fa-solid fa-square-minus'></i> <i class='fa-solid fa-folder-open'></i>", // Symbol displayed on an opened node
      })
      .addTo(thisMap);
  }

  function refreshOverlayControl() {
    /*
    to refresh the map overlay buttons
    this needs to be done anytime something is changed that affects the overlay
    */
    control
      .setOverlayTree(overlays)
      .collapseTree() // collapse the baselayers tree
      // .expandSelected() // expand selected option in the baselayer
      .collapseTree(true);
  }

  // Option to include the main GP Practice Site
  if (overlayGPMain.inc || overlayGPMain.zoomExtent) {
    Promise.allSettled([promGeoDataGP]).then((data) => {
      const layersMapGpMain = new Map();
      const practiceMain = L.geoJSON(data[0].value, {
        pointToLayer: function (feature, latlng) {
          return pcnFormatting(feature, latlng, { addBounce: true });
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup("", { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css
          layer.on("mouseover", function (e) {
            this.openPopup();
          });
          layer.on("mouseout", function (e) {
            this.closePopup();
          });
          layer.on("click", function (e) {
            // console.log(e.sourceTarget.feature.properties.practice_code);
            const selectedPractice = feature.properties.orgCode;
            if (userSelections.selectedPractice !== selectedPractice) {
              // update the Practice in userSelections
              userSelections.selectedPractice = selectedPractice;
              // update other charts
              refreshChartsPostPracticeChange(selectedPractice);
            }
          });

          const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. phc_no, practice_group etc
          // Initialize the category array if not already set.
          if (!layersMapGpMain.has(category)) {
            layersMapGpMain.set(category, L.layerGroup());
          }
          layersMapGpMain.get(category).addLayer(layer);
        },
        filter: function (d) {
          if (d.properties.type === "main") return true;
        },
      });

      if (overlayGPMain.display) {
        L.layerGroup(Array.from(layersMapGpMain.values())).addTo(thisMap);
      }

      if (overlayGPMain.inc || overlayGPMain.display) {
        const ol = overlayPCNs(layersMapGpMain);
        updateOverlay("gpMain", ol);
      }

      // zoom option here
      if (overlayGPMain.zoomExtent) {
        thisMap.fitBounds(practiceMain.getBounds());
      }

      if (overlayGPMain.inc) {
        mapsWithGPMain.set(thisMap, [practiceMain, layersMapGpMain]);
      }
    });
  }

  // Option to include the GP Practice branch and main Sites
  if (overlayGPSites.inc || overlayGPSites.zoomExtent) {
    Promise.allSettled([promGeoDataGP, gpDetails]).then((data) => {
      const layersMapGpSites = new Map();
      const gpSites = L.geoJSON(data[0].value, {
        pointToLayer: function (feature, latlng) {
          return pcnFormatting(feature, latlng);
        },
        onEachFeature: function (feature, layer) {
          const category = feature.properties.pcn_name; // category variable, used to store the distinct feature eg. pcn
          let orgName = layer.feature.properties.orgName;
          if (orgName === null) {
            if (practiceLookup.has(layer.feature.properties.orgCode)) {
              orgName = titleCase(
                practiceLookup.get(layer.feature.properties.orgCode)
              );
            } else {
              orgName = "";
            }
          }

          const popupText = `<h3>${category}</h3>
        <p>${layer.feature.properties.orgCode}: ${orgName}
        <br>Parent Org:${layer.feature.properties.parent}</p>`;

          layer.bindPopup(popupText, { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css
          layer.on("mouseover", function (e) {
            this.openPopup();
          });
          layer.on("mouseout", function (e) {
            this.closePopup();
          });
          layer.on("click", function (e) {
            thisMap.setView(e.latlng, 11);
            console.log({ selectedSite: layer.feature.properties.orgCode });
          });

          // Initialize the category array if not already set.
          if (!layersMapGpSites.has(category)) {
            layersMapGpSites.set(category, L.layerGroup());
          }
          layersMapGpSites.get(category).addLayer(layer);
        },
      });

      const gpSitesLayer = L.layerGroup(Array.from(layersMapGpSites.values()));
      if (overlayGPSites.display) {
        gpSitesLayer.addTo(thisMap);
      }

      if (overlayGPSites.inc || overlayGPSites.display) {
        const ol = overlayPCNs(layersMapGpSites); // function to align sites by pcn to overlay tree
        updateOverlay("gpSites", ol);
      }

      // zoom option here
      if (overlayGPSites.zoomExtent) {
        thisMap.fitBounds(gpSites.getBounds());
      }

      if (overlayGPSites.inc) {
        mapsWithGPSites.set(thisMap, [gpSitesLayer]); // add as an array to subsequently inc a filtered layer
      }
    });
  }

  // Option to include the CCG Boundary layer (option to display is later)
  if (overlayCCGBoundary.inc || overlayCCGBoundary.zoomExtent) {
    Promise.allSettled([promGeoNationalCCGBoundaries]).then(() => {
      const ccgBoundaryVoY = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("VoY"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS Vale of York CCG" ? true : false;
        },
      });

      const ccgBoundaryNY = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("NY"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS North Yorkshire CCG" ? true : false;
        },
      });

      const ccgBoundaryER = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("ER"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS East Riding of Yorkshire CCG" ? true : false;
        },
      });

      const ccgBoundaryHull = L.geoJSON(geoDataNationalCCGBoundaries, {
        style: styleCCG("Hull"),
        pane: "ccgBoundaryPane",
        filter: function (d) {
          const ccg = d.properties.ccg21nm;

          return ccg === "NHS Hull CCG" ? true : false;
        },
      });

      if (overlayCCGBoundary.display) {
        ccgBoundaryVoY.addTo(thisMap);
      }

      if (overlayCCGBoundary.inc || overlayCCGBoundary.display) {
        const ccgBoundaryOverlay = {
          label: "CCG Boundaries",
          selectAllCheckbox: true,
          children: [
            {
              label: "Vale of York",
              layer: ccgBoundaryVoY,
            },
            {
              label: "North Yorkshire",
              layer: ccgBoundaryNY,
            },
            {
              label: "East Riding",
              layer: ccgBoundaryER,
            },
            {
              label: "Hull",
              layer: ccgBoundaryHull,
            },
          ],
        };

        updateOverlay("ccgBoundary", ccgBoundaryOverlay);
      }

      // zoom option here
      if (overlayCCGBoundary.zoomExtent) {
        thisMap.fitBounds(ccgBoundaryVoY.getBounds());
      }
    });
  }

  // Do you want to include the Ward Boundary layer (option to display is later)
  if (overlayWardBoundary.inc || overlayWardBoundary.zoomExtent) {
    Promise.allSettled([promGeoDataCYCWards]).then(() => {
      const layersMapWards = new Map();

      const geoDataCYCWards = L.geoJSON(geoWardBoundaries, {
        style: styleWard,
        pane: "wardBoundaryPane",
        onEachFeature: function (feature, layer) {
          const category = +feature.properties.pcn_ward_group; // category variable, used to store the distinct feature eg. phc_no, practice_group etc

          if (!layersMapWards.has(category)) {
            layersMapWards.set(category, L.layerGroup());
          }
          layersMapWards.get(category).addLayer(layer);
        },
      });

      if (overlayWardBoundary.display) {
        L.layerGroup(Array.from(layersMapWards.values())).addTo(thisMap);
      }

      if (overlayWardBoundary.inc || overlayWardBoundary.display) {
        const ol = overlayWards(layersMapWards);
        updateOverlay("wards", ol);
      }

      // zoom option here
      if (overlayWardBoundary.zoomExtent) {
        thisMap.fitBounds(geoDataCYCWards.getBounds());
      }
    });
  }

  // Do you want to include the LSOA Boundary layer (option to display is later)
  // This layer will not be filtered ie. full boundary
  if (overlayLsoaBoundary.inc || overlayLsoaBoundary.zoomExtent) {
    Promise.allSettled([promGeoDataLsoaBoundaries]).then(() => {
      // const layersMapByCCG = new Map();
      // Consider option to show by CCG here...

      const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
        style: styleLsoa,
        pane: "lsoaBoundaryPane",
        // onEachFeature: function (feature, layer) {
        //   const lsoa = feature.properties.lsoa;
        // },
        // filter: function (d) {
        //   // match site codes based on 6 char GP practice code
        //   const strPractice = d.properties.orgCode;

        //   return ccg === "03Q" ? true : false;
        // },
      });

      if (overlayLsoaBoundary.display) {
        // L.layerGroup(Array.from(layersMapByCCG.values())).addTo(thisMap);
        geoDataLsoaBoundaries.addTo(thisMap);
      }

      if (overlayLsoaBoundary.inc || overlayLsoaBoundary.display) {
        // const ol = overlayLSOAbyIMD(layersMapByCCG, "LSOA by CCG");
        const ol = overlayLSOAbyCCG(geoDataLsoaBoundaries);
        updateOverlay("lsoaBoundaryFull", ol);
      }

      // zoom option here
      if (overlayLsoaBoundary.zoomExtent) {
        thisMap.fitBounds(geoDataLsoaBoundaries.getBounds());
      }

      if (overlayLsoaBoundary.inc) {
        mapsWithLSOA.set(thisMap, geoDataLsoaBoundaries);
      }
    });
  }

  // Do you want to include the LSOA Boundary layer by IMD (option to display is later) - this can be slow
  // This layer will not be filtered ie. full boundary
  if (overlayLsoaBoundaryByIMD.inc || overlayLsoaBoundaryByIMD.zoomExtent) {
    Promise.allSettled([promGeoDataLsoaBoundaries, promDataIMD]).then(
      (lsoaBoundaries) => {
        const layersMapByIMD = new Map();

        const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
          style: styleLsoa,
          pane: "lsoaBoundaryPane",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa; // category variable, used to store the distinct feature eg. phc_no, practice_group etc

            let imdDecile;
            if (mapLSOAbyIMD.has(lsoa)) {
              imdDecile = mapLSOAbyIMD.get(lsoa); // IMD Decile
            } else {
              imdDecile = "exc"; // undefined
            }

            if (!layersMapByIMD.has(imdDecile)) {
              layersMapByIMD.set(imdDecile, L.layerGroup());
            }
            layersMapByIMD.get(imdDecile).addLayer(layer);
          },
        });

        if (overlayLsoaBoundaryByIMD.display) {
          L.layerGroup(Array.from(layersMapByIMD.values())).addTo(thisMap);
        }

        if (overlayLsoaBoundaryByIMD.inc || overlayLsoaBoundaryByIMD.display) {
          const ol = overlayLSOAbyIMD(layersMapByIMD, "LSOA by IMD");
          updateOverlay("lsoaBoundaryFull", ol);
        }

        // zoom option here
        if (overlayLsoaBoundaryByIMD.zoomExtent) {
          thisMap.fitBounds(geoDataLsoaBoundaries.getBounds());
        }

        if (overlayLsoaBoundaryByIMD.inc) {
          mapsWithLSOA.set(thisMap, geoDataLsoaBoundaries);
        }
      }
    );
  }

  // This is the option for maps which subsequently filter the lsoa
  if (overlayFilteredLsoa.inc) {
    mapsWithLSOAFiltered.set(thisMap, null);
  }

  if (userOverlayNationalTrusts) {
    promHospitalDetails.then((data) => {
      // Styling: https://gis.stackexchange.com/a/360454
      const nhsTrustSites = L.conditionalMarkers([]),
        nonNhsTrustSites = L.conditionalMarkers([]);

      let i = 0,
        j = 0; // counter for number of providers in each category

      data.forEach((d) => {
        const category = d.sector;
        const popupText = `<h3>${d.organisationCode}: ${d.organisationName}</h3>
        <p>${d.parentODSCode}: ${d.parentName}
        <br>${d.sector}</p>`;

        if (category === "NHS Sector") {
          const marker = trustMarker({
            position: d.markerPosition,
            className: "nhs",
            text: "H",
            popupText: popupText,
            popupClass: "popup-trustNHS",
          });
          marker.addTo(nhsTrustSites);
          i++;
        } else {
          // Independent Sector
          const marker = trustMarker({
            position: d.markerPosition,
            className: "independent",
            text: "H",
            popupText: popupText,
            popupClass: "popup-trustIS",
          });
          marker.addTo(nonNhsTrustSites);
          j++;
        }
      });

      // This option controls how many markers can be displayed
      nhsTrustSites.options.maxMarkers = i;
      nonNhsTrustSites.options.maxMarkers = j;

      // Overlay structure for Trust Sites
      const nationalTrusts = overlayNationalTrusts(
        nhsTrustSites,
        nonNhsTrustSites
      );

      updateOverlay("nationalTrusts", nationalTrusts);

      function trustMarker({
        position,
        className,
        text = "H",
        popupText,
        popupClass = "popup-dark",
      } = {}) {
        return L.marker(position, {
          icon: L.divIcon({
            className: `trust-marker ${className}`,
            html: text,
            iconSize: L.point(20, 20),
            popupAnchor: [0, -10],
          }),
        }).bindPopup(popupText, { className: popupClass }); // popup formatting applied in css, css/leaflet_tooltip.css
      }

      function overlayNationalTrusts(nhs, independent) {
        return {
          label: "National Hospital Sites <i class='fa-solid fa-circle-h'></i>",
          selectAllCheckbox: true,
          children: [
            {
              label:
                "NHS <i class='fa-solid fa-circle-h' style='font-size:14px;color:blue;'></i>",
              layer: nhs,
            },
            {
              label:
                "Independent <i class='fa-solid fa-circle-h' style='font-size:14px;color:green;'></i>",
              layer: independent,
            },
          ],
        };
      }
    });
  }

  return {
    map: thisMap,
    scaleBar: scaleBar,
    sideBar: sideBar,
    home: home,
    homeButton: homeButton,
    zoomTo: zoomTo,
    // LayerTreeControl
    // baselayers: baselayers,
    // overlays: overlays,
    updateOverlay: updateOverlay,
    layerControl: layerControl,
    refreshOverlayControl: refreshOverlayControl,
    promTesting: promTesting,
  };
}

// Popup text for the gp markers. This updates with the change in date to give the relevant population figure
function updatePopUpText(sourceLayer) {
  sourceLayer.eachLayer(function (layer) {
    const period = userSelections.selectedDate,
      practiceCode = layer.feature.properties.orgCode,
      // clinicalDirector = layer.feature.properties.clinical_director,
      pcnName = layer.feature.properties.pcn_name,
      population = dataPopulationGPSummary.get(period).get(practiceCode);

    let practiceName;
    if (practiceLookup.has(practiceCode)) {
      practiceName = titleCase(practiceLookup.get(practiceCode));
    } else {
      practiceName = "";
    }

    const popupText = `<h3>${pcnName}</h3>
      <p>${practiceCode}: ${practiceName}
      <br>Population (${formatPeriod(period)}): ${formatNumber(
      population
    )}</p>`;
    // <br>Clinical Director: ${clinicalDirector}

    layer.setPopupContent(popupText);
  });
}

function refreshMapOverlayControls() {
  /*
  to refresh the map overlay buttons
  this needs to be done anytime something is changed that affects the overlay
  Uses the last map (arbitrary) to ensure all the data has been loaded
  */
  const lastMap = mapStore[mapStore.length - 1];
  lastMap.promTesting.then(() => {
    for (const thisMap of mapStore) {
      thisMap.refreshOverlayControl();
    }
  });
}

// consider incorporating this into mapinit
// options around fitBounds, setView
function defaultHome({ zoomInt = 9 } = {}) {
  mapOfMaps.forEach(function (value, key) {
    key.flyTo(value, (zoom = zoomInt));
  });
  // const map = this.map;
  // map.fitBounds(layersMapBoundaries.get("voyCCGMain").getBounds());
}

// Example using a handful of selected Trust locations
const trustSitesLoc = {
  yorkTrust: [53.96895, -1.08427],
  scarboroughTrust: [54.28216, -0.43619],
  harrogateTrust: [53.99381, -1.51756],
  leedsTrust: [53.80687, -1.52034],
  southTeesTrust: [54.55176, -1.21479],
  hullTrust: [53.74411, -0.035813],
  selbyMIU: [53.77748, -1.07832],
};

function selectedTrustMarker(location, text) {
  return L.marker(location, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "h-square",
      borderColor: "red",
      backgroundColor: "transparent",
      textColor: "rgba(255,0,0)", // Text color of marker icon
      popupAnchor: [0, -5], // adjusts offset position of popup
    }),
    zIndexOffset: 1000,
    draggable: false,
  }).bindPopup(text); // Text to display in pop up
}

// Dummy moveable (draggable) marker for demo only
function moveableMarker() {
  return L.marker(trustSitesLoc.yorkTrust, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "atom",
      borderColor: "Black", // "rgba(242,247,53)",
      backgroundColor: "transparent",
      textColor: "Black", // "rgba(242,247,53)", // Text color of marker icon
      popupAnchor: [0, -5], // adjusts offset position of popup
    }),
    zIndexOffset: 1001,
    draggable: true,
  }).bindPopup("Drag to move me"); // Text to display in pop up
}

// Separate marker for York Trust
function yorkTrust() {
  const map = this.map;
  return L.marker(trustSitesLoc.yorkTrust, {
    icon: L.BeautifyIcon.icon({
      iconShape: "circle",
      icon: "h-square",
      borderColor: "red",
      backgroundColor: "transparent",
      textColor: "rgba(255,0,0)", // Text color of marker icon
    }),
    zIndexOffset: 1000,
    draggable: false,
  })
    .addTo(map)
    .bindPopup("York Hospital"); // Text to display in pop up
}

// function homeButton() {
//   const map = this.map;
//   return L.easyButton(
//     "fa-solid fa-house",
//     function (btn) {
//       // map.setView(trustSitesLoc.yorkTrust, 9);
//       map.setView(
//         layersMapBoundaries.get("voyCCGMain").getBounds().getCenter(),
//         9
//       );
//     },
//     "Zoom To Home"
//   ).addTo(map);
// }

/*
Define options of bouncing for all markers
https://github.com/hosuaby/Leaflet.SmoothMarkerBouncing#options-of-bouncing

When pcnFormatting is called, if bounce parameter is set to true,
  toggleBouncing is applied to the marker.
  This will stop/ start the bouncing when the marker is clicked

The function updateBouncingMarkers is applied when a practice change is made
Either via the practice selection drop down or on marker click
*/
L.Marker.setBouncingOptions({
  bounceHeight: 15, // height of the bouncing
  contractHeight: 12,
  bounceSpeed: 52, // bouncing speed coefficient
  contractSpeed: 52,
  // shadowAngle: null,
  elastic: true,
  exclusive: true,
});

function updateBouncingMarkers() {
  // https://github.com/hosuaby/Leaflet.SmoothMarkerBouncing
  /*
  // stop all bouncing
  This would apply to all maps with bouncing.
  If only wanted to apply to specific map (eg. mapMain)
    step 1: test userSelections.selectedPractice !== "All Practices"
    step 2: loop through markers (like below, no need to check practice) and set to .stopBouncing()
  */
  L.Marker.stopAllBouncingMarkers();

  // array of layers in the mapMain
  // mapsWithGPMain.forEach(function (value, key) {
  for (const value of mapsWithGPMain.values()) {
    const arr = Array.from(value[1].values());
    arr.forEach(function (test) {
      let obj = test._layers;
      Object.values(obj).forEach(function (val) {
        const gpPractice = val.feature.properties.orgCode;
        const marker = val._bouncingMotion.marker;
        if (gpPractice === userSelections.selectedPractice) {
          marker.bounce(); // starts/stops bouncing of the marker
        }
      });
    });
  }
}

function styleLsoaOrangeOutline() {
  return {
    fillColor: "#FFA400", // background
    fillOpacity: 0, // transparent
    weight: 0.9, // border
    color: "#FFA400", // border
    opacity: 1,
    // dashArray: "3",
  };
}

function highlightFeature(selPractice, map, zoomToExtent = false) {
  if (typeof highlightedPractice !== "undefined") {
    map.map.removeLayer(highlightedPractice);
  }

  Promise.allSettled([promGeoDataGP]).then((data) => {
    highlightedPractice = L.geoJSON(data[0].value, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.orgCode === selPractice) {
          return L.marker(latlng, {
            icon: arrHighlightIcons[5],
            zIndexOffset: -5,
          });
        }
      },
    });

    if (selPractice === "All Practices" || selPractice === undefined) {
      defaultHome();
    } else {
      map.map.addLayer(highlightedPractice);

      if (zoomToExtent) {
        // map.map.fitBounds(highlightedPractice.getBounds());
        const practiceLocation = highlightedPractice.getBounds().getCenter();
        map.map.setView(practiceLocation, 10);
      }
    }
  });
}

function overlayPCNs(mapObj) {
  return {
    label: "Sites by PCN",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        selectAllCheckbox: true,
        children: [
          {
            label: "North",
            selectAllCheckbox: true,
            children: [
              {
                label: "South Hambleton And Ryedale",
                layer: mapObj.get("South Hambleton And Ryedale"),
              },
            ],
          },
          {
            label: "Central",
            selectAllCheckbox: true,
            children: [
              {
                label: "Priory Medical Group",
                layer: mapObj.get("Priory Medical Group"),
              },
              {
                label: "West, Outer and North East York",
                layer: mapObj.get("West, Outer and North East York"),
              },
              {
                label: "York City Centre",
                layer: mapObj.get("York City Centre"),
              },
              {
                label: "York East",
                layer: mapObj.get("York East"),
              },
              {
                label: "York Medical Group",
                layer: mapObj.get("York Medical Group"),
              },
            ],
          },
          {
            label: "South",
            selectAllCheckbox: true,
            children: [
              {
                label: "Selby Town",
                layer: mapObj.get("Selby Town"),
              },
              {
                label: "Tadcaster & Selby Rural Area",
                layer: mapObj.get("Tadcaster & Selby Rural Area"),
              },
            ],
          },
        ],
      },
    ],
  };
}

function overlayTrusts() {
  return {
    label: "Local Hospital Sites <i class='fa-solid fa-circle-h'></i>",
    selectAllCheckbox: true,
    children: [
      {
        label: "York",
        layer: selectedTrustMarker(trustSitesLoc.yorkTrust, "York Trust"),
      },
      {
        label: "Harrogate",
        layer: selectedTrustMarker(
          trustSitesLoc.harrogateTrust,
          "Harrogate Trust"
        ),
      },
      {
        label: "Scarborough",
        layer: selectedTrustMarker(
          trustSitesLoc.scarboroughTrust,
          "Scarborough Trust"
        ),
      },
      {
        label: "Leeds",
        layer: selectedTrustMarker(trustSitesLoc.leedsTrust, "Leeds Trust"),
      },
      {
        label: "South Tees",
        layer: selectedTrustMarker(
          trustSitesLoc.southTeesTrust,
          "South Tees Trust"
        ),
      },
      {
        label: "Hull",
        layer: selectedTrustMarker(trustSitesLoc.hullTrust, "Hull Trust"),
      },
      {
        label: "Selby MIU",
        layer: selectedTrustMarker(trustSitesLoc.selbyMIU, "Selby MIU"),
      },
      {
        label: "Move Me",
        layer: moveableMarker(),
      },
    ],
  };
}

function overlayWards(mapObj) {
  return {
    label: "Ward Boundaries",
    selectAllCheckbox: true,
    children: [
      {
        label: "CYC",
        selectAllCheckbox: true,
        children: [
          {
            label: "Ward Group: 1",
            layer: mapObj.get(1),
          },
          {
            label: "Ward Group: 2",
            layer: mapObj.get(2),
          },
          {
            label: "Ward Group: 3",
            layer: mapObj.get(3),
          },
          {
            label: "Ward Group: 4",
            layer: mapObj.get(4),
          },
          {
            label: "Ward Group: 5",
            layer: mapObj.get(5),
          },
          {
            label: "Ward Group: 6",
            layer: mapObj.get(6),
          },
        ],
      },
    ],
  };
}

function overlayLSOAbyCCG(data) {
  return {
    label: "LSOA by CCG",
    selectAllCheckbox: true,
    children: [
      {
        label: "Vale of York",
        layer: data,
      },
    ],
  };
}

function overlayLSOAbyIMD(mapObj, labelDesc) {
  return {
    label: labelDesc,
    selectAllCheckbox: true,
    children: [
      {
        label: "IMD: 1 (Most Deprived)",
        layer: mapObj.get(1),
      },
      {
        label: "IMD: 2",
        layer: mapObj.get(2),
      },
      {
        label: "IMD: 3",
        layer: mapObj.get(3),
      },
      {
        label: "IMD: 4",
        layer: mapObj.get(4),
      },
      {
        label: "IMD: 5",
        layer: mapObj.get(5),
      },
      {
        label: "IMD: 6",
        layer: mapObj.get(6),
      },
      {
        label: "IMD: 7",
        layer: mapObj.get(7),
      },
      {
        label: "IMD: 8",
        layer: mapObj.get(8),
      },
      {
        label: "IMD: 9",
        layer: mapObj.get(9),
      },
      {
        label: "IMD: 10  (Least Deprived)",
        layer: mapObj.get(10),
      },
      {
        label: "Exc",
        layer: mapObj.get("exc"),
      },
    ],
  };
}

function overlayAddSeparator() {
  // Adds a horizontal line
  return {
    label: '<div class="leaflet-control-layers-separator"></div>',
  };
}

// ###########################################################################################

// ############################### map_functions.js #######################################

function recolourPopnLSOAIMD() {
  /*
    For updating the LSOA colours by population in the IMD chart
    */
  const maxValue = maxPopulation();

  // refreshMapPopnLegend(maxValue);
  imdLegend.legend({
    color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
    title: "Population",
    width: 600,
    marginLeft: 50,
  });

  mapsWithLSOAFiltered.get(mapIMD.map)[0].eachLayer(function (layer) {
    const lsoaCode = layer.feature.properties.lsoa;

    let value = actualPopulation(lsoaCode);

    if (value === undefined) {
      value = 0;
    }

    if (value > minPopulationLSOA) {
      layer.setStyle({
        // https://github.com/d3/d3-scale-chromatic
        fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
        fillOpacity: 0.8,
        weight: 1, // border
        color: "white", // border
        opacity: 1,
        // dashArray: "3",
      });
      // layer.on("click", function (e) {
      //   // update other charts
      //   console.log({ lsoa: selectedLsoa });
      // });
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
            <p>${userSelections.selectedPractice}</p>
            <p>${formatPeriod(userSelections.nearestDate())}</p>
        Pop'n: ${formatNumber(value)}
        `
    );
  });
}

let imdDomainDescD3 = "Population",
  imdDomainShortD3 = "Population";

function imdDomainD3({ id, thisMap } = {}) {
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
  for (let key of dataRatesLookup.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    imdDomainDescD3 = d3.select("#selImdDomainD3 option:checked").text();
    if (imdDomainDescD3 === "Population") {
      imdDomainShortD3 = "Population";
    } else if (dataRatesLookup.has(imdDomainDescD3)) {
      imdDomainShortD3 = dataRatesLookup.get(imdDomainDescD3).datasetDesc;
    } else {
      imdDomainShortD3 = mapIMDDomain.get(imdDomainDescD3).datasetDesc;
    }
    console.log({ imdDomain: imdDomainDescD3 });
    // refreshBubbleChart()
    updateD3BubbleLsoa();
    // updateBubbleColour(imdDomainShortD3);
  });

  // Define the div for the tooltip
  const tooltipD3Lsoa = newTooltip.tooltip(div);
  tooltipD3Lsoa.style("height", "75px").style("width", "180px");

  // add SVG to Leaflet map via Leaflet
  const svgLayer = L.svg();
  svgLayer.addTo(thisMap);

  const svg = d3.select("#mapIMDD3").select("svg"),
    g = svg.select("g").attr("class", "bubble-group");

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
  // function projectPoint(x, y) {
  //   const point = thisMap.latLngToLayerPoint(new L.LatLng(y, x));
  //   this.stream.point(point.x, point.y);
  // }

  // const transform = d3.geoTransform({ point: projectPoint }),
  //   path = d3.geoPath().projection(transform);

  let d3BubbleEnter;

  function updateBubbleColour(defaultIMD = "Population") {
    if (defaultIMD === "Population") {
      // Style and legend for population
      const maxValue = maxPopulation();

      lsoaCentroidLegend.legend({
        color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
        title: "Population",
        width: 600,
        marginLeft: 50,
      });

      d3BubbleEnter.style("fill", function (d) {
        return d3.interpolateYlGnBu(d.lsoaPopulation / maxValue);
      });
    } else if (dataRatesMax.has(defaultIMD)) {
      // convert short description back to long
      const shortDesc = dataRatesKeys.get(defaultIMD);

      const colour = defaultRatesProperties.legendColour();

      lsoaCentroidLegend.legend({
        color: colour,
        title: dataRatesLookup.get(shortDesc).legendTitle,
        leftSubTitle: dataRatesLookup.get(shortDesc).leftSubTitle,
        rightSubTitle: dataRatesLookup.get(shortDesc).rightSubTitle,
        tickFormat: dataRatesLookup.get(shortDesc).tickFormat,
        width: 600,
        marginLeft: 50,
      });

      // The colour is determined by the overall significance  - not at individual practice level
      // if (userSelections.selectedPractice === "All Practices") {
      d3BubbleEnter.style("fill", function (d) {
        if (dataRates.get(defaultIMD).get("All").has(d.lsoa)) {
          let sig = dataRates.get(defaultIMD).get("All").get(d.lsoa)[0].signf;
          return colour(sig);
        } else {
          return "transparent";
        }
      });
    } else {
      // for IMD
      // an array of the individual values
      const rawValues = dataIMD.map(function (d) {
        return d[defaultIMD];
      });
      // console.log(rawValues)

      const colour = mapIMDDomain.get(imdDomainDescD3).scale(rawValues);

      lsoaCentroidLegend.legend({
        color: colour, //mapIMDDomain.get(imdDomainDescD3).legendColour(rawValues),
        title: mapIMDDomain.get(imdDomainDescD3).legendTitle,
        leftSubTitle: mapIMDDomain.get(imdDomainDescD3).leftSubTitle,
        rightSubTitle: mapIMDDomain.get(imdDomainDescD3).rightSubTitle,
        tickFormat: mapIMDDomain.get(imdDomainDescD3).tickFormat,
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
  L.geoJson(geoDataLsoaPopnCentroid, {
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

  function updateD3BubbleLsoa() {
    /*
    Update the population details or counts when using rates based data sets
    For the rates based data, the circle size uses the volume of activity rather than the population
    Colour will be used to show whether the rate is statistically significant eg. lower / higher rate
    */
    if (dataRatesMax.has(imdDomainShortD3)) {
      lsoaCentroidDetails.forEach((lsoa) => {
        let value = 0;
        if (userSelections.selectedPractice === "All Practices") {
          if (dataRates.get(imdDomainShortD3).get("All").has(lsoa.lsoa)) {
            value = dataRates
              .get(imdDomainShortD3)
              .get("All")
              .get(lsoa.lsoa)[0].activityU;
          } else {
            value = 0;
          }
        } else if (
          dataRates.get(imdDomainShortD3).has(userSelections.selectedPractice)
        ) {
          if (
            dataRates
              .get(imdDomainShortD3)
              .get(userSelections.selectedPractice)
              .has(lsoa.lsoa)
          ) {
            value = dataRates
              .get(imdDomainShortD3)
              .get(userSelections.selectedPractice)
              .get(lsoa.lsoa)[0].activityU;
          } else {
            value = 0;
          }
        } else {
          value = 0;
        }

        // For rates data, lsoaPopulation is actually the volume of eg. attendances
        lsoa.lsoaPopulation = value;
      });
    } else {
      lsoaCentroidDetails.forEach((lsoa) => {
        let value = actualPopulation(lsoa.lsoa);

        if (value === undefined) {
          value = 0;
        }
        lsoa.lsoaPopulation = value;
      });
    }

    const maxValue = d3.max(lsoaCentroidDetails, function (d) {
      return d.lsoaPopulation;
    });
    // , maxValueNice = Math.ceil(maxValue / 100) * 100; //  round to the nearest 100

    const radius = d3
      .scaleSqrt()
      .domain([0, maxValue]) // 1e4 or 10,000
      .range([0, 20]);

    const d3BubbleSelection = g.selectAll("circle").data(
      lsoaCentroidDetails
        .filter((popn) => popn.lsoaPopulation > minPopulationLSOA)
        .sort(
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
        console.log(d);
      })
      .on("mouseover", function (event, d) {
        const sel = d3.select(this);
        sel.classed("hover", true);
        sel.raise();
        sel.style("fill-opacity", 1);
        const pos = this.getBoundingClientRect();
        // console.log(d)

        let str,
          subString = "";

        if (imdDomainDescD3 === "Population") {
          str = `LSOA: <strong>${
            d.lsoa
          }</strong><br>Pop'n: <span style="color:red">${formatNumber(
            d.lsoaPopulation
          )}</span>`;
        } else if (dataRatesMax.has(imdDomainShortD3)) {
          let value,
            latestPopn,
            stdRate = 0,
            crudeRate = 0;

          if (userSelections.selectedPractice === "All Practices") {
            latestPopn = dataPopulationGPLsoa
              .get(userSelections.nearestQuarter)
              .get("All")
              .get(d.lsoa);

            if (dataRates.get(imdDomainShortD3).get("All").has(d.lsoa)) {
              value = dataRates
                .get(imdDomainShortD3)
                .get("All")
                .get(d.lsoa)[0].activityU;
              stdRate = dataRates
                .get(imdDomainShortD3)
                .get("All")
                .get(d.lsoa)[0].rate;
            } else {
              value = 0;
            }
          } else {
            latestPopn = dataPopulationGPLsoa
              .get(userSelections.nearestQuarter)
              .get(userSelections.selectedPractice)
              .get(d.lsoa);

            if (
              dataRates
                .get(imdDomainShortD3)
                .has(userSelections.selectedPractice)
            ) {
              if (
                dataRates
                  .get(imdDomainShortD3)
                  .get(userSelections.selectedPractice)
                  .has(d.lsoa)
              ) {
                value = dataRates
                  .get(imdDomainShortD3)
                  .get(userSelections.selectedPractice)
                  .get(d.lsoa)[0].activityU;
              } else {
                value = 0;
              }
            } else {
              value = 0;
            }
          }

          crudeRate = (value / latestPopn) * 1000;

          str = `LSOA: <strong>${
            d.lsoa
          }</strong><br>Pop'n: <span style="color:red">${formatNumber(
            latestPopn
          )}</span>`;

          subString = `<br><strong>Attendances:
          </strong><span style="color:red">${formatNumber(value)}</span>`;

          if (userSelections.selectedPractice === "All Practices") {
            subString += `<br><strong>std Rate:
          </strong><span style="color:red">${formatNumber(stdRate)}</span>`;
          } else {
            subString += `<br><strong>std Rate:
            </strong><span style="color:red">n/a</span>`;
          }

          subString += `<br><strong>Crude Rate:
          </strong><span style="color:red">${formatNumber(crudeRate)}</span>`;
        } else {
          str = `LSOA: <strong>${
            d.lsoa
          }</strong><br>Pop'n: <span style="color:red">${formatNumber(
            d.lsoaPopulation
          )}</span>`;

          let obj = dataIMD.find((x) => x.lsoa === d.lsoa);

          if (obj !== undefined) {
            const value = obj[imdDomainShortD3];

            subString = `<br><strong>${imdDomainDescD3}:
          </strong><span style="color:red">${formatNumber(value)}</span>`;
          } else {
            return "";
          }
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
        sel.style("fill-opacity", 0.8);
        newTooltip.mouseout(tooltipD3Lsoa);
      })
      .attr("class", "bubble")
      .attr("r", function (d) {
        if (d.lsoaPopulation > 0) {
          return radius(d.lsoaPopulation);
        } else {
          return 0;
        }
      })
      // .style("fill", function (d) {
      //   return d3.interpolateYlGnBu(d.lsoaPopulation / maxValue);
      // })
      .style("fill-opacity", function (d) {
        const lsoaCode = d.lsoa;

        let value = actualPopulation(lsoaCode);

        if (value > minPopulationLSOA) {
          return 0.8;
        } else {
          // console.log({ testing: lsoaCode });
          return 0.1;
        }
      })
      .style("pointer-events", "all");

    updateBubblePosition(); // Needed otherwise only updates after change in eg. zoom
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

  function updateBubblePosition() {
    d3BubbleEnter.attr("transform", function (d) {
      const layerPoint = thisMap.latLngToLayerPoint(d.lsoaCentre);
      return "translate(" + layerPoint.x + "," + layerPoint.y + ")";
    });

    return {
      updateD3BubbleLsoa: updateD3BubbleLsoa,
      // updateBubbleColour: updateBubbleColour,
    };
  }

  // Every time the map changes (post viewreset, move or moveend) update the SVG paths
  thisMap.on("viewreset move moveend", updateBubblePosition);

  return {
    updateD3BubbleLsoa: updateD3BubbleLsoa,
    // updateBubbleColour: updateBubbleColour,
  };
}

// Map IMD by LSOA
function recolourIMDLayer(defaultIMD = "imdRank") {
  // const maxValue = d3.max(v, function (d) {
  //   return d[defaultIMD];
  // });

  if (defaultIMD === "population") {
    recolourPopnLSOAIMD();
  } else {
    /*
        rawValues are the values in the appropriate field
        These are ignored for the IMD indicators since they are hardcoded based on the number of LSOAs: 1 to 32,844
        However, for the 'imd' population figures, these are used
        */
    const rawValues = dataIMD.map(function (d) {
      return d[defaultIMD];
    });
    // console.log(rawValues)

    const colour = mapIMDDomain.get(imdDomainDesc).scale(rawValues);

    imdLegend.legend({
      color: colour, //mapIMDDomain.get(imdDomainDesc).legendColour(rawValues),
      title: mapIMDDomain.get(imdDomainDesc).legendTitle,
      leftSubTitle: mapIMDDomain.get(imdDomainDesc).leftSubTitle,
      rightSubTitle: mapIMDDomain.get(imdDomainDesc).rightSubTitle,
      tickFormat: mapIMDDomain.get(imdDomainDesc).tickFormat,
      width: 600,
      marginLeft: 50,
    });

    if (mapsWithLSOAFiltered.has(mapIMD.map)) {
      mapsWithLSOAFiltered.get(mapIMD.map)[0].eachLayer(function (layer) {
        const lsoaCode = layer.feature.properties.lsoa;

        if (mapsFilteredLSOA.has(lsoaCode)) {
          // the filter lsoaFunction populates a map object of lsoas (with relevant population)
          let obj = dataIMD.find((x) => x.lsoa === lsoaCode);
          if (obj !== undefined) {
            // console.log(obj[defaultIMD], maxValue);
            const value = obj[defaultIMD];

            layer.setStyle({
              // https://github.com/d3/d3-scale-chromatic
              fillColor: colour(value), //colourScheme(value / maxValue),
              fillOpacity: 0.8,
              weight: 1, // border
              color: "white", // border
              opacity: 1,
              // dashArray: "3",
            });

            layer.bindPopup(
              `<h3>${layer.feature.properties.lsoa}</h3>
              <p>IMD: ${formatNumber(value)}</p>
            `
            );
          }
          // });
        } else {
          // if population is less than set amount, make it transparent
          layer.setStyle({
            // no (transparent) background
            fillColor: "#ff0000", // background
            fillOpacity: 0, // transparent
            weight: 0, // border
            color: "red", // border
            opacity: 0,
          });
        }
      });
    }
  }
}
// }

/*
For colouring the choropleth map and legend

Scale is used to colour the maps.
legendColour is used to create the colour bar (ramp)

Some scales require the whole dataset (values) for the domain. This can be derived using eg. d3.range(m, n) which returns an array of m-n+1 values from m to n
Other scales only require the min and max values as an array. This can be derived using d3.extent (values) or d3.min and d3.max
*/
const noLSOAs = 32_844, // this is the number of lsoas nationally
  arrNoLSOAs = d3.range(1, noLSOAs + 1); // returns an array [1, 2, ..., noLSOAs]

const defaultIMDProperties = {
  datasetDesc: "datasetFieldName", // which field in the dataset to refer to
  scale(values) {
    // values not used here but is subsequently used in the population fields so need to pass the parameter here
    return d3
      .scaleQuantize()
      .domain([1, noLSOAs])
      .range(d3.quantize(this.colourScheme, 10));
  },
  // legendColour(values) {
  //   // values not used here but are used in the population fields so need to pass the parameter
  //   return d3
  //     .scaleSequential()
  //     .domain([1, noLSOAs + 1])
  //     .interpolator(this.colourScheme);
  // },
  colourScheme: (t) => d3.interpolateReds(1 - t), // this reverses the interpolateReds colour scheme
  legendTitle: "IMD Subtitle",
  leftSubTitle: "Most Deprived",
  rightSubTitle: "Least Deprived",
  tickFormat: ",.0f", // thousands comma, no decimals
};

const defaultIMDPopnProperties = {
  datasetDesc: "datasetFieldName", // which field in the dataset to refer to
  scale(values) {
    // values not used here but are used in the population fields so need to pass the parameter
    return d3
      .scaleSequentialQuantile()
      .domain(values)
      .interpolator(this.colourScheme);
    // Alternative option example
    // return d3.scaleQuantize()
    // .domain(d3.extent(values))
    // .range(d3.quantize(this.colourScheme, 10));
  },
  // legendColour(values) {
  //   // values not used here but are used in the population fields so need to pass the parameter
  //   return d3
  //     .scaleSequentialQuantile()
  //     .domain((values))
  //     .interpolator(this.colourScheme);
  //   // Alternative option example
  //   // return d3.scaleQuantize()
  //   // .domain(d3.extent(values))
  //   // .range(d3.quantize(this.colourScheme, 10));
  // },
  colourScheme: d3.interpolateBlues,
  legendTitle: "Sub Population",
  leftSubTitle: "",
  rightSubTitle: "",
  tickFormat: ",.0f", // thousands comma, no decimals
};

const defaultRatesProperties = {
  datasetDesc: "ratesDataFieldName", // which field in the dataset to refer to
  scale() {
    return (
      d3
        .scaleOrdinal()
        // .domain(["lower", "nosig", "higher"])
        .domain([-1, 0, 1])
        .range(["green", "grey", "red"])
    );
  },
  legendColour() {
    return (
      d3
        .scaleOrdinal()
        // .domain(["lower", "nosig", "higher"])
        .domain([-1, 0, 1])
        .range(["green", "grey", "red"])
    );
  },
  // colourScheme: d3.schemeSpectral,
  legendTitle: "Rates Demo",
  leftSubTitle: "lower",
  rightSubTitle: "higher",
};

const imdRankProperties = Object.create(defaultIMDProperties);
imdRankProperties.datasetDesc = "imdRank";
const incomeRankProperties = Object.create(defaultIMDProperties);
incomeRankProperties.datasetDesc = "incomeRank";
const employmentRankProperties = Object.create(defaultIMDProperties);
employmentRankProperties.datasetDesc = "employmentRank";
const educationRankProperties = Object.create(defaultIMDProperties);
educationRankProperties.datasetDesc = "educationRank";
const healthRankProperties = Object.create(defaultIMDProperties);
healthRankProperties.datasetDesc = "healthRank";
const crimeRankProperties = Object.create(defaultIMDProperties);
crimeRankProperties.datasetDesc = "crimeRank";
const housingRankProperties = Object.create(defaultIMDProperties);
housingRankProperties.datasetDesc = "housingRank";
const livingEnvironRankProperties = Object.create(defaultIMDProperties);
livingEnvironRankProperties.datasetDesc = "livingEnvironRank";
const incomeChildRankProperties = Object.create(defaultIMDProperties);
incomeChildRankProperties.datasetDesc = "incomeChildRank";
const incomeOlderRankProperties = Object.create(defaultIMDProperties);
incomeOlderRankProperties.datasetDesc = "incomeOlderRank";
const childRankProperties = Object.create(defaultIMDProperties);
childRankProperties.datasetDesc = "childRank";
const adultSkillsRankProperties = Object.create(defaultIMDProperties);
adultSkillsRankProperties.datasetDesc = "adultSkillsRank";
const geogRankProperties = Object.create(defaultIMDProperties);
geogRankProperties.datasetDesc = "geogRank";
const barriersRankProperties = Object.create(defaultIMDProperties);
barriersRankProperties.datasetDesc = "barriersRank";
const indoorsRankProperties = Object.create(defaultIMDProperties);
indoorsRankProperties.datasetDesc = "indoorsRank";
const outdoorsRankProperties = Object.create(defaultIMDProperties);
outdoorsRankProperties.datasetDesc = "outdoorsRank";
const totalPopnProperties = Object.create(defaultIMDPopnProperties);
totalPopnProperties.datasetDesc = "totalPopn";
const dependentChildrenProperties = Object.create(defaultIMDPopnProperties);
dependentChildrenProperties.datasetDesc = "dependentChildren";
const popnMiddleProperties = Object.create(defaultIMDPopnProperties);
popnMiddleProperties.datasetDesc = "popnMiddle";
const popnOlderProperties = Object.create(defaultIMDPopnProperties);
popnOlderProperties.datasetDesc = "popnOlder";
const popnWorkingProperties = Object.create(defaultIMDPopnProperties);
popnWorkingProperties.datasetDesc = "popnWorking";

const ae_01RatesProperties = Object.create(defaultRatesProperties);
ae_01RatesProperties.datasetDesc = "AE_01";
const selbyUTCRatesProperties = Object.create(defaultRatesProperties);
selbyUTCRatesProperties.datasetDesc = "selbyUTC";
const testNewRatesProperties = Object.create(defaultRatesProperties);
testNewRatesProperties.datasetDesc = "testNew";

// const mapRatesDomain = new Map();

// These would be hard coded to provide a lookup from the data key to the description
const dataRatesLookup = new Map();
dataRatesLookup.set("A&E Demo", ae_01RatesProperties);
dataRatesLookup.set("Selby UTC", selbyUTCRatesProperties);
dataRatesLookup.set("Long Description testNew", testNewRatesProperties);

const mapIMDDomain = new Map();

mapIMDDomain.set("IMD Rank", imdRankProperties);
mapIMDDomain.set("IMD Decile", {
  datasetDesc: "imdDecile",
  scale() {
    const deciles = 10;
    return d3
      .scaleOrdinal()
      .domain(d3.range(1, deciles + 1))
      .range(this.colourScheme[deciles]);
  },
  legendColour() {
    const deciles = 10;
    return d3
      .scaleOrdinal()
      .domain(d3.range(1, deciles + 1))
      .range(this.colourScheme[deciles]);
  },
  colourScheme: d3.schemeSpectral,
  legendTitle: "IMD Decile",
  leftSubTitle: "Most Deprived",
  rightSubTitle: "Least Deprived",
});
mapIMDDomain.set("Income", incomeRankProperties);
mapIMDDomain.set("Employment", employmentRankProperties);
mapIMDDomain.set("Education Skills and Training", educationRankProperties);
mapIMDDomain.set("Health Deprivation and Disability", healthRankProperties);
mapIMDDomain.set("Crime", crimeRankProperties);
mapIMDDomain.set("Barriers to Housing and Services", housingRankProperties);
mapIMDDomain.set("Living Environment", livingEnvironRankProperties);
mapIMDDomain.set(
  "Income Deprivation Affecting Children Index",
  incomeChildRankProperties
);
mapIMDDomain.set(
  "Income Deprivation Affecting Older People",
  incomeOlderRankProperties
);
mapIMDDomain.set("Children and Young People Subdomain", childRankProperties);
mapIMDDomain.set("Adult Skills Subdomain", adultSkillsRankProperties);
mapIMDDomain.set("Geographical Barriers Subdomain", geogRankProperties);
mapIMDDomain.set("Wider Barriers Subdomain", barriersRankProperties);
mapIMDDomain.set("Indoors Subdomain", indoorsRankProperties);
mapIMDDomain.set("Outdoors Subdomain", outdoorsRankProperties);
mapIMDDomain.set("Total population mid 2015", totalPopnProperties);
mapIMDDomain.set(
  "Dependent Children aged 0 15 mid 2015",
  dependentChildrenProperties
);
mapIMDDomain.set("Population aged 16 59 mid 2015", popnMiddleProperties);
mapIMDDomain.set(
  "Older population aged 60 and over mid 2015",
  popnOlderProperties
);
mapIMDDomain.set("Working age population 18 59 64", popnWorkingProperties);

// default values
let imdDomainDesc = "Population",
  imdDomainShort = "population";

(function imdDomain(id = "selIMD") {
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
  select.setAttribute("id", "selImdDomain");

  // Option constructor: args text, value, defaultSelected, selected
  select.options.add(new Option("Population", 0, true, true));
  let counter = 1;
  for (let key of mapIMDDomain.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }

  for (let key of dataRatesLookup.keys()) {
    select.options.add(new Option(key, counter));
    counter++;
  }
  // for (let key of mapIMDDomain.keys()) {
  //   if (counter !== 0) {
  //     select.options.add(new Option(key, counter));
  //   } else {
  //     select.options.add(new Option(key, 0, true, true));
  //   }
  //   counter++;
  // }

  frag.appendChild(select);
  span.appendChild(frag);

  d3.select(select).on("change", function () {
    imdDomainDesc = d3.select("#selImdDomain option:checked").text();

    if (mapIMDDomain.has(imdDomainDesc)) {
      imdDomainShort = mapIMDDomain.get(imdDomainDesc).datasetDesc;
    } else if (dataRatesLookup.has(imdDomainDesc)) {
      imdDomainShort = dataRatesLookup.get(imdDomainDesc);
    } else if (imdDomainDesc === "Population") {
      imdDomainShort = "population";
    } else {
      imdDomainShort = "population";
    }

    // if (imdDomainDesc !== "Population") {
    //   imdDomainShort = mapIMDDomain.get(imdDomainDesc).datasetDesc;
    // } else {
    //   imdDomainShort = "population";
    // }

    console.log({ imdDomainShort: imdDomainShort });
    recolourIMDLayer(imdDomainShort);
  });
})();

let firstPass = true;

function filterGPPracticeSites(zoomToExtent = false) {
  /* This will deselect the 'entire' GP Sites layer
  and return an additional filtered layer based on the selected practice
  */

  Promise.allSettled([promGeoDataGP, gpDetails]).then((data) => {
    mapsWithGPSites.forEach(function (value, key) {
      // value includes the original unfiltered sites layer, value[0] and the filtered layer if exists, value[1]
      let isLayerDisplayed = false;
      let isFilteredLayerDisplayed = false;
      if (key.hasLayer(value[0])) {
        // the original sites layer
        key.removeLayer(value[0]);
        isLayerDisplayed = true;
      }

      // Does the map already show the filtered sites layer
      if (value.length > 1) {
        if (key.hasLayer(value[1])) {
          key.removeLayer(value[1]);
          isFilteredLayerDisplayed = true;
        }
        // value.pop(); // not necessary as will be overwritten?
        delete value[1]; // keeps the array length but the filtered sites layer (in index 1) becomes undefined
      }

      if (
        userSelections.selectedPractice !== undefined &&
        userSelections.selectedPractice !== "All Practices"
      ) {
        // const layersMapGpSites = new Map(); // will be the filtered layer

        const gpSites = L.geoJson(data[0].value, {
          // https://leafletjs.com/reference-1.7.1.html#geojson
          pointToLayer: function (feature, latlng) {
            return pcnFormatting(feature, latlng);
          },
          onEachFeature: function (feature, layer) {
            const category = feature.properties.pcn_name;

            let orgName = layer.feature.properties.orgName;
            if (orgName === null) {
              if (practiceLookup.has(layer.feature.properties.orgCode)) {
                orgName = titleCase(
                  practiceLookup.get(layer.feature.properties.orgCode)
                );
              } else {
                orgName = "";
              }
            }

            const popupText = `<h3>${category}</h3>
        <p>${layer.feature.properties.orgCode}:
        ${orgName}
        <br>Parent Org:${layer.feature.properties.parent}</p>`;

            layer.bindPopup(popupText, { className: "popup-dark" }); // popup formatting applied in css, css/leaflet_tooltip.css

            layer.on("mouseover", function (e) {
              this.openPopup();
            });
            layer.on("mouseout", function (e) {
              this.closePopup();
            });
            // layer.on("click", function (e) {
            // });
            // Initialize the category array if not already set.
            //   if (!layersMapGpSites.has(category)) {
            //     layersMapGpSites.set(category, L.layerGroup());
            //   }
            //   layersMapGpSites.get(category).addLayer(layer);
          },
          filter: function (d) {
            // match site codes based on 6 char GP practice code
            const strPractice = d.properties.orgCode;

            return strPractice.substring(0, 6) ===
              userSelections.selectedPractice.substring(0, 6)
              ? true
              : false;
          },
        });

        // key is the map we are working with
        if (isFilteredLayerDisplayed || firstPass) {
          gpSites.addTo(key);
          firstPass = false;
        }

        value[1] = gpSites; // append the filtered layer

        // Selected GP Sites Overlay
        const ol = {
          label: "Selected Practice Sites",
          layer: gpSites,
        };
        value[2] = ol; // append the overlay

        mapsWithGPSites.set(key, value);

        if (zoomToExtent) {
          key.fitBounds(gpSites.getBounds().pad(0.1));
        }
      } else {
        // reset to show all sites
        if (isLayerDisplayed) {
          // (isLayerDisplayed || key === mapPopn.map)
          key.addLayer(value[0]);
        }
        key.flyTo(mapOfMaps.get(key), 9);

        // Remove the overlay
        value[2] = null; // null will be used in the filter function to remove the overlay
      }
    });
    // refreshFilteredGPSitesOverlays();
  });
}

function refreshFilteredGPSitesOverlays() {
  // mapStore is an array of the maps that use the filtered GP Sites
  let refreshOverlay = false;
  for (let mapGPSites of mapStore) {
    if (mapsWithGPSites.has(mapGPSites.map)) {
      const arr = mapsWithGPSites.get(mapGPSites.map);
      if (arr.length > 2) {
        if (arr[2] !== null) {
          // if it's null then delete the overlay label
          refreshOverlay = true;
          mapGPSites.updateOverlay("gpSitesFiltered", arr[2]);
        } else {
          mapGPSites.updateOverlay(
            "gpSitesFiltered",
            "",
            true // option to delete overlay
          );
        }
      }
    } else {
      // console.log({gpSitesMap: 'update gpSites map array'})
    }
  }

  // Once the lsoa has been refreshed, update the overlay
  if (refreshOverlay) {
    // refreshMapOverlayControls();
  }
}

// Contains lsoa (key) and it's population for the selected practice (value)
const mapsFilteredLSOA = new Map(); // selected lsoas

async function filterFunctionLsoa(zoomToExtent = false) {
  /*
  Consider moving this into the init function if not splitting by eg. IMD
  */
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promDataGPPopnLsoa,
    promDataIMD,
  ])
    .then((lsoaBoundaries) => {
      mapsFilteredLSOA.clear();

      mapsWithLSOAFiltered.forEach(function (value, key) {
        // Remove the original layer
        if (value !== null && value !== undefined) {
          if (key.hasLayer(value[0])) {
            key.removeLayer(value[0]);
          }
        }

        const geoDataLsoaBoundaries = L.geoJSON(geoLsoaBoundaries, {
          style: styleLsoaOrangeOutline,
          pane: "lsoaBoundaryPane2",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa;

            layer.on("click", function (e) {
              // update other charts
              selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
              console.log({ lsoa: selectedLsoa });
            });
          },
          filter: function (d) {
            // console.log(d.properties.lsoa)
            const lsoaCode = d.properties.lsoa;

            let population = actualPopulation(lsoaCode);

            if (population > minPopulationLSOA) {
              mapsFilteredLSOA.set(lsoaCode, population);
              return true;
            }
          },
        });

        geoDataLsoaBoundaries.addTo(key);

        const ol = {
          label: "LSOA by Population",
          layer: geoDataLsoaBoundaries,
          // selectAllCheckbox: true,
          // children: [{ layer: geoDataLsoaBoundaries }]
        };
        mapsWithLSOAFiltered.set(key, [geoDataLsoaBoundaries, ol]); // filtered lsoa map, popn over eg. 20

        // if (incLayer) {
        // L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);
        // }

        if (zoomToExtent) {
          key.fitBounds(geoDataLsoaBoundaries.getBounds());
        }
      });
    })
    .then(() => {
      // recolourPopnLSOA();
      recolourIMDLayer(imdDomainShort);
    })
    .then(() => {
      /*
      Previously tried running this within the above .then statement but this typically results in
      an error when trying to remove a layer
      */
      const lastMap = mapStore[mapStore.length - 1];
      lastMap.promTesting.then(() => {
        refreshFilteredGPSitesOverlays();
        refreshFilteredLSOAOverlays();
      });
    });
}

async function filterFunctionLsoaByIMD(zoomToExtent = false) {
  /*
  This procedures works but is potentially slow since removing all layers rather than one overarching one
  */
  await Promise.allSettled([
    promGeoDataLsoaBoundaries,
    promDataGPPopnLsoa,
    promDataIMD,
  ])
    .then((lsoaBoundaries) => {
      mapsFilteredLSOA.clear();

      mapsWithLSOAFiltered.forEach(function (value, key) {
        const incLayer = key.hasLayer(value);
        // Remove the original layer
        if (value !== null) {
          if (key.hasLayer(value[0])) {
            key.removeLayer(value[0]);
          } else {
            value[2]();
          }
        }

        const layersMapByIMD = new Map();

        const geoDataLsoaBoundaries = L.geoJSON(lsoaBoundaries[0].value, {
          style: styleLsoaOrangeOutline,
          pane: "lsoaBoundaryPane2",
          onEachFeature: function (feature, layer) {
            const lsoa = feature.properties.lsoa;

            let imdDecile;
            if (mapLSOAbyIMD.has(lsoa)) {
              imdDecile = mapLSOAbyIMD.get(lsoa); // IMD Decile
            } else {
              imdDecile = "exc"; // undefined
            }

            // Initialize the category array if not already set.
            if (!layersMapByIMD.has(imdDecile)) {
              layersMapByIMD.set(imdDecile, L.layerGroup());
            }
            layersMapByIMD.get(imdDecile).addLayer(layer);

            layer.on("click", function (e) {
              // update other charts
              selectedLsoa = feature.properties.lsoa; // change the lsoa to whichever was clicked
              console.log({ lsoa: selectedLsoa });
            });
          },
          filter: function (d) {
            // console.log(d.properties.lsoa)
            const lsoaCode = d.properties.lsoa;

            let population = actualPopulation(lsoaCode);

            if (population > minPopulationLSOA) {
              mapsFilteredLSOA.set(lsoaCode, population);
              return true;
            }
          },
        });

        L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);

        function removeFeature() {
          layersMapByIMD.forEach(function (value) {
            key.removeLayer(value);
          });
        }

        const ol = overlayLSOA(layersMapByIMD, "LSOA Population");
        mapsWithLSOAFiltered.set(key, [
          geoDataLsoaBoundaries,
          ol,
          removeFeature,
        ]); // filtered lsoa map, popn over eg. 20

        // if (incLayer) {
        // L.layerGroup(Array.from(layersMapByIMD.values())).addTo(key);
        // }

        if (zoomToExtent) {
          key.fitBounds(geoDataLsoaBoundaries.getBounds());
        }
      });
    })
    .then(() => {
      // recolourPopnLSOA();
      recolourIMDLayer(imdDomainShort);
      refreshFilteredLSOAOverlays();
    });
}

function refreshFilteredLSOAOverlays() {
  // mapStore is an array of the maps that use the filtered LSOA
  let refreshOverlay = false;
  for (let mapLSOA of mapStore) {
    if (mapsWithLSOAFiltered.has(mapLSOA.map)) {
      const arr = mapsWithLSOAFiltered.get(mapLSOA.map);
      if (arr.length > 1) {
        refreshOverlay = true;
        mapLSOA.updateOverlay("filteredLSOA", arr[1]);
      }
    } else {
      // console.log({lsoaFilteredMap: 'update lsoa map array'})
    }
  }

  // Once the lsoa has been refreshed, update the overlay
  if (refreshOverlay) {
    refreshMapOverlayControls();
  }
}

async function mapMarkersNationalTrust() {
  // Styling: https://gis.stackexchange.com/a/360454
  const nhsTrustSites = L.conditionalMarkers([]),
    nonNhsTrustSites = L.conditionalMarkers([]);

  let i = 0,
    j = 0; // counter for number of providers in each category
  const data = await promHospitalDetails;

  data.forEach((d) => {
    const category = d.sector;
    const popupText = `<h3>${d.organisationCode}: ${d.organisationName}</h3>
      <p>${d.parentODSCode}: ${d.parentName}
      <br>${d.sector}</p>`;

    if (category === "NHS Sector") {
      const marker = trustMarker(d.markerPosition, "nhs", "H", popupText);
      marker.addTo(nhsTrustSites);
      i++;
    } else {
      // Independent Sector
      const marker = trustMarker(
        d.markerPosition,
        "independent",
        "H",
        popupText
      );
      marker.addTo(nonNhsTrustSites);
      j++;
    }
  });

  // This option controls how many markers can be displayed
  nhsTrustSites.options.maxMarkers = i;
  nonNhsTrustSites.options.maxMarkers = j;

  // Overlay structure for Trust Sites
  const nationalTrusts = overlayNationalTrusts(nhsTrustSites, nonNhsTrustSites);

  // Add overlay to mapMain
  overlaysTreeMain.children[4] = nationalTrusts;

  function trustMarker(position, className, text = "H", popupText) {
    return L.marker(position, {
      icon: L.divIcon({
        className: `trust-marker ${className}`,
        html: text,
        iconSize: L.point(20, 20),
        popupAnchor: [0, -10],
      }),
    }).bindPopup(popupText);
  }

  function overlayNationalTrusts(nhs, independent) {
    return {
      label: "National Hospital Sites <i class='fa-solid fa-circle-h'></i>",
      selectAllCheckbox: true,
      children: [
        {
          label:
            "NHS <i class='fa-solid fa-circle-h' style='font-size:14px;color:blue;'></i>",
          layer: nhs,
        },
        {
          label:
            "Independent <i class='fa-solid fa-circle-h' style='font-size:14px;color:green;'></i>",
          layer: independent,
        },
      ],
    };
  }
}

function maxPopulation() {
  return userSelections.selectedPractice !== undefined &&
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
}

function actualPopulation(lsoa) {
  return userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
    ? dataPopulationGPLsoa
        .get(userSelections.nearestDate())
        .get(userSelections.selectedPractice)
        .get(lsoa)
    : dataPopulationGPLsoa
        .get(userSelections.nearestDate())
        .get("All")
        .get(lsoa);
}

// function recolourPopnLSOA() {
//   /*
//     For updating the LSOA colours in mapPopulation
//     */
//   const maxValue = maxPopulation();

//   // refreshMapPopnLegend(maxValue);
//   popnLegend.legend({
//     color: d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu),
//     title: "Population",
//     width: 600,
//     marginLeft: 50,
//   });

//   mapsWithLSOAFiltered.get(mapPopn.map)[0].eachLayer(function (layer) {
//     const lsoaCode = layer.feature.properties.lsoa;

//     let value = actualPopulation(lsoaCode);

//     if (value === undefined) {
//       value = 0;
//     }

//     if (value > minPopulationLSOA) {
//       layer.setStyle({
//         // https://github.com/d3/d3-scale-chromatic
//         fillColor: d3.interpolateYlGnBu(value / maxValue), // colour(value),
//         fillOpacity: 0.8,
//         weight: 1, // border
//         color: "white", // border
//         opacity: 1,
//         // dashArray: "3",
//       });
//       // layer.on("click", function (e) {
//       //   // update other charts
//       //   console.log({ lsoa: selectedLsoa });
//       // });
//     } else {
//       layer.setStyle({
//         // no (transparent) background
//         fillColor: "#ff0000", // background
//         fillOpacity: 0, // transparent
//         weight: 0, // border
//         color: "red", // border
//         opacity: 0,
//       });
//     }

//     layer.bindPopup(
//       `<h3>${layer.feature.properties.lsoa}</h3>
//             <p>${userSelections.selectedPractice}</p>
//             <p>${formatPeriod(userSelections.nearestDate())}</p>
//         Pop'n: ${formatNumber(value)}
//         `
//     );
//   });
// }

// ###########################################################################################

// ############################### map_init.js #######################################

// Set up the maps

// Used to keep track of the map overlay for subsequent refresh
const mapOverlays = new Map();
const mapStore = []; // used to store the variable that stores each map. Can be used in subsequent loops...
// GP Main Site Map
const mapMain = mapInitialise({
  mapDivID: "mapMain", // mapMain is the div id to place the map
  baselayer: "Bright", // set the default baselayer. Default is Bright
  userOverlayGPMain: { inc: true, display: true },
  userOverlayCCGBoundary: { display: true },
  userOverlayWardBoundary: { inc: true },
  userOverlayNationalTrusts: true,
});
mapMain.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
// mapMain.home = {lat: 54.018213, lng: -10.0} // can change the home button position
mapMain.homeButton(); // mapMain.homeButton({ latLng: trustSitesLoc.yorkTrust, zoom: 12 });
mapStore.push(mapMain);
const sidebarMapMain = mapMain.sideBar(); // default is left, can use mapMain.sideBar({side: "right"});
sidebarMapMain.addPanel(sidebarContent.panelOverview);
sidebarMapMain.addPanel(sidebarContent.panelSpecific);
sidebarMapMain.addPanel(sidebarContent.panelMail);
sidebarMapMain.addPanel(sidebarContent.panelDummy);
sidebarMapMain.addPanel(sidebarContent.panelSettings);

mapMain.updateOverlay("selectedTrusts", overlayTrusts());

/*
// Population Map by lsoa
const mapPopn = mapInitialise({
  mapDivID: "mapPopnLSOA",
  baselayer: "Dark",
  userOverlayGPSites: { inc: true, display: true },
  userOverlayLsoaBoundary: { inc: true, display: false },
  userOverlayFilteredLsoa: { inc: true },
});
mapPopn.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapPopn.homeButton();
mapStore.push(mapPopn);
const sidebarPopn = mapPopn.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarPopn.addPanel(sidebarContent.panelOverview);

mapPopn.updateOverlay("selectedTrusts", overlayTrusts());

const popnLegend = legendWrapper("footerMapPopn", genID.uid("popn"));
*/

/*
IMD Map by LSOA

  The data only imports lsoas in VoY CCG boundary
  The extent of the national data is 1 (most deprived area) to 32,844 (least deprived area)
  Since this is only a subset, the values will not always extend from 1 to 32,844

  For the imd charts, the domain should be 1 to 32,844 (hard coded) - this keeps it consistent, esp. if extend the data
  For the population charts, the domain represents the extent

Useful IMD FAQ: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/853811/IoD2019_FAQ_v4.pdf
*/

const mapIMD = mapInitialise({
  mapDivID: "mapIMDLSOA",
  baselayer: "Dark", // Jawg Matrix
  userOverlayGPSites: { inc: true, display: true },
  userOverlayLsoaBoundary: { inc: true, display: false },
  userOverlayFilteredLsoa: { inc: true },
  userOverlayNationalTrusts: true,
});
mapIMD.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapIMD.homeButton();
mapStore.push(mapIMD);
const sidebarIMD = mapIMD.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarIMD.addPanel(sidebarContent.panelOverview);
sidebarIMD.addPanel(sidebarContent.panelIMDSpecific);

const imdLegend = legendWrapper("footerMapIMD", genID.uid("imd"));

mapIMD.updateOverlay("selectedTrusts", overlayTrusts());
mapIMD.updateOverlay("separatorLine", overlayAddSeparator());

/*
Population and IMD by LSOA (D3 Circle Map)
https://bost.ocks.org/mike/bubble-map/

https://labs.os.uk/public/os-data-hub-tutorials/web-development/d3-overlay

Drawing points of interest using this demo:
  https://chewett.co.uk/blog/1030/overlaying-geo-data-leaflet-version-1-3-d3-js-version-4/

*/

const mapD3Bubble = mapInitialise({
  mapDivID: "mapIMDD3",
  baselayer: "OS Light", // High Contrast
  userOverlayLsoaBoundary: { inc: true },
  userOverlayFilteredLsoa: { inc: true },
  // userOverlayGPMain: { inc: true, display: false },
  userOverlayGPSites: { inc: true, display: false },
  userOverlayNationalTrusts: true,
});
mapD3Bubble.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapD3Bubble.homeButton();
mapStore.push(mapD3Bubble);
const lsoaCentroidLegend = legendWrapper("footerMapD3Leaf", genID.uid("lsoa"));

mapD3Bubble.updateOverlay("selectedTrusts", overlayTrusts());
mapD3Bubble.updateOverlay("separatorLine", overlayAddSeparator());

// bubbleGroup to run a function in the overlayers tree
const htmlD3Bubble = svgCheckBox("mapIMDD3");

// returns a html string with a checkbox to enable toggling of the d3 svg circle layer
function svgCheckBox(id) {
  const cboxId = genID.uid("cbox").id;

  return `<span class="d3Toggle" onmouseover="this.style.cursor='pointer'" onclick="toggleBubbles('${id}', '${cboxId}')";><input type="checkbox" id="${cboxId}" checked> Toggle Circles</span>`;
}

mapD3Bubble.updateOverlay("functionCall", {
  label: htmlD3Bubble,
});

function toggleBubbles(elemParentID, cboxID) {
  // function to toggle the D3 circle bubbles
  // need this specific element if more than one d3 bubble map
  const bubbleGroup = d3.select(`#${elemParentID} .bubble-group`);
  const checkBox = document.getElementById(cboxID);

  if (bubbleGroup.style("visibility") === "hidden") {
    bubbleGroup.style("visibility", "visible");
    checkBox.checked = true;
  } else {
    bubbleGroup.style("visibility", "hidden");
    checkBox.checked = false;
  }
  /*
  const bubbleGroup = document
    .getElementById(elemParentID) // need this specific element if more than one d3 bubble map
    .getElementsByClassName("bubble-group")[0];

  const checkBox = document.getElementById("d3Check");
  if (bubbleGroup.style.visibility === "hidden") {
    bubbleGroup.style.visibility = "visible";
    checkBox.checked = true;
  } else {
    bubbleGroup.style.visibility = "hidden";
    checkBox.checked = false;
  }
*/
}

// const sidebarD3 = mapD3Bubble.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});

// Functions to create the charts runs last - after all the data is available
Promise.allSettled([promDataGPPopn, promDataGPPopnLsoa]).then(() => {
  initD3Charts();

  Promise.allSettled([importGeoData]).then(() => {
    // The following require the above population data and the geoData
    circlePopnIMDChart = imdDomainD3({
      id: "selD3Leaf",
      thisMap: mapD3Bubble.map,
    });
    filterFunctionLsoa(true);
    //   .then(() => {
    //   recolourPopnLSOA();
    //   recolourIMDLayer(imdDomainShort);
    // });

    Promise.allSettled([promGeoDataGP, gpDetails]).then(() => {
      // Main practice site popup text. Requires practiceLookup
      // updatePopUpText(mapsWithGPMain.get(mapMain.map)[0]) // can be used to update an individual map
      for (const value of mapsWithGPMain.values()) {
        updatePopUpText(value[0]);
      }
    });
    // not sure if this is necessary...
    Promise.allSettled([
      promHospitalDetails,
      promGeoDataCYCWards,
      promGeoDataLsoaBoundaries,
      promDataIMD,
    ]).then(() => {
      // refreshes the overlaysTree to ensure everything is included and collapsed
      refreshMapOverlayControls();
    });
  });
});

// GP Associated Sites Map
/*
const mapSites = mapInitialise({
  mapDivID: "mapSites",
  // baselayer: "Grey",
  userOverlayGPSites: { inc: true, display: true },
  userOverlayCCGBoundary: { display: true },
});
mapSites.scaleBar(); // default is bottomleft, can use mapMain.scaleBar({position: "bottomright"});
mapSites.homeButton();
mapStore.push(mapSites)
const sidebarSites = mapSites.sideBar(); // default is left, can use mapMain.sidebar({side: "right"});
sidebarSites.addPanel(sidebarContent.panelOverview);

mapSites.updateOverlay("selectedTrusts", overlayTrusts());
*/

/*
OS Features API
https://labs.os.uk/public/os-data-hub-examples/os-features-api/wfs-example-bbox

The below is a working example of using the OS Features API to add a hospital and hospice 'shapes' layer
The overlay only adds what is visible in the bounding box (refreshes if map moves)

The initial call to getFeatures(bounds) should be moved to the init set up function

Comment out as a bit excessive for this example

*/

// const wfsServiceUrl = "https://api.os.uk/features/v1/wfs",
//   tileServiceUrl = "https://api.os.uk/maps/raster/v1/zxy";

// // Add layer group to make it easier to add or remove layers from the map.
// const osShapeHospital = new L.layerGroup(), //.addTo(mapMain.map);
//   osShapeHospice = new L.layerGroup();

// // Get the visible map bounds (BBOX).
// let bounds = mapMain.map.getBounds();

// getFeatures(bounds); // move this to end, after promises and in intial set up

// const overlayOSShapes = {
//   label: "OS Feature Demo <i class='fa-solid fa-square-h'></i>",
//   selectAllCheckbox: true,
//   children: [
//     {
//       label: "Hospital",
//       layer: osShapeHospital,
//     },
//     {
//       label: "Hospice",
//       layer: osShapeHospice,
//     },
//   ],
// };
// overlaysTreeMain.children[6] = overlayOSShapes;

// // Add event which will be triggered when the map has finished moving (pan + zoom).
// // Implements a simple strategy to only request data when the map viewport invalidates
// // certain bounds.
// mapMain.map.on("moveend", function () {
//   let bounds1 = new L.latLngBounds(
//       bounds.getSouthWest(),
//       bounds.getNorthEast()
//     ),
//     bounds2 = mapMain.map.getBounds();

//   if (JSON.stringify(bounds) !== JSON.stringify(bounds1.extend(bounds2))) {
//     bounds = bounds2;
//     getFeatures(bounds);
//   }
// });

// // Get features from the WFS.

// async function getFeatures(bounds) {
//   // Convert the bounds to a formatted string.
//   const sw = `${bounds.getSouthWest().lat},${bounds.getSouthWest().lng}`,
//     ne = `${bounds.getNorthEast().lat},${bounds.getNorthEast().lng}`;

//   const coords = `${sw} ${ne}`;

//   /*
//   Create an OGC XML filter parameter value which will select the
//   features (site function) intersecting the BBOX coordinates.

//   Useful Features:
//   Hospital
//   Hospice
//   Medical Care Accommodation (dataset not great but includes nursing homes, not in York though?)

//     // to explore all, remove filter
//    const xml = `<ogc:Filter>
//   <ogc:BBOX>
//   <ogc:PropertyName>SHAPE</ogc:PropertyName>
//   <gml:Box srsName="urn:ogc:def:crs:EPSG::4326">
//   <gml:coordinates>${coords}</gml:coordinates>
//   </gml:Box>
//   </ogc:BBOX>
//   </ogc:Filter>`;
//   */

//   const xmlHospital = `<ogc:Filter>
//   <ogc:And>
//   <ogc:BBOX>
//   <ogc:PropertyName>SHAPE</ogc:PropertyName>
//   <gml:Box srsName="urn:ogc:def:crs:EPSG::4326">
//   <gml:coordinates>'${coords}'</gml:coordinates>
//   </gml:Box>
//   </ogc:BBOX>
//   <ogc:PropertyIsEqualTo>
//   <ogc:PropertyName>SiteFunction</ogc:PropertyName>
//   <ogc:Literal>Hospital</ogc:Literal>
//   </ogc:PropertyIsEqualTo>
//   </ogc:And>
//   </ogc:Filter>`;

//   const xmlHospice = `<ogc:Filter>
//   <ogc:And>
//   <ogc:BBOX>
//   <ogc:PropertyName>SHAPE</ogc:PropertyName>
//   <gml:Box srsName="urn:ogc:def:crs:EPSG::4326">
//   <gml:coordinates>'${coords}'</gml:coordinates>
//   </gml:Box>
//   </ogc:BBOX>
//   <ogc:PropertyIsEqualTo>
//   <ogc:PropertyName>SiteFunction</ogc:PropertyName>
//   <ogc:Literal>Hospice</ogc:Literal>
//   </ogc:PropertyIsEqualTo>
//   </ogc:And>
//   </ogc:Filter>`;

//   // Define (WFS) parameters object.
//   const wfsParamsHospital = {
//     key: apiKey,
//     service: "WFS",
//     request: "GetFeature",
//     version: "2.0.0",
//     typeNames: "Sites_FunctionalSite",
//     outputFormat: "GEOJSON",
//     srsName: "urn:ogc:def:crs:EPSG::4326",
//     filter: xmlHospital,
//   };

//   const wfsParamsHospice = {
//     key: apiKey,
//     service: "WFS",
//     request: "GetFeature",
//     version: "2.0.0",
//     typeNames: "Sites_FunctionalSite",
//     outputFormat: "GEOJSON",
//     srsName: "urn:ogc:def:crs:EPSG::4326",
//     filter: xmlHospice,
//   };

//   // Use fetch() method to request GeoJSON data from the OS Features API.
//   // If successful, remove everything from the layer group; then add a new GeoJSON

//   await Promise.allSettled([
//     d3.json(getUrl(wfsParamsHospital)),
//     d3.json(getUrl(wfsParamsHospice)),
//   ]).then((values) => {
//     osShapeHospital.clearLayers();
//     osShapeHospice.clearLayers();

//     const geoJsonHospital = new L.geoJson(values[0].value, {
//       onEachFeature: function (feature, layer) {
//         layer.bindPopup(feature.properties.DistinctiveName1);
//       },
//       style: {
//         color: "#f00",
//         weight: 1,
//         fillOpacity: 0.8,
//       },
//     });

//     osShapeHospital.addLayer(geoJsonHospital);

//     const geoJsonHospice = new L.geoJson(values[1].value, {
//       onEachFeature: function (feature, layer) {
//         layer.bindPopup(feature.properties.DistinctiveName1);
//       },
//       style: {
//         color: "#00f",
//         weight: 1,
//         fillOpacity: 0.8,
//       },
//     });

//     osShapeHospice.addLayer(geoJsonHospice);
//   });
// }

// /*
//  * Return URL with encoded parameters.
//  * @param {object} params - The parameters object to be encoded.
//  */
// function getUrl(params) {
//   const encodedParameters = Object.keys(params)
//     .map((paramName) => paramName + "=" + encodeURI(params[paramName]))
//     .join("&");

//   return wfsServiceUrl + "?" + encodedParameters;
// }

// ###########################################################################################
