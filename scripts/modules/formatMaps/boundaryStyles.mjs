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


export {styleCCG, styleLsoa, styleWard, wardsStyle, wardsStyleLabels}
