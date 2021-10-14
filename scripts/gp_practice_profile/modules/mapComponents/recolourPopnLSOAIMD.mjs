import {
  maxPopulation,
  legendWrapper,
  genID,
  mapsWithLSOAFiltered,
  mapIMD,
  actualPopulation,
  minPopulationLSOA,
  userSelections,
  formatPeriod,
  formatNumber
} from "../../aggregateModules.mjs";

const imdLegend = legendWrapper("footerMapIMD", genID.uid("imd"));
export {imdLegend}
export function recolourPopnLSOAIMD() {
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
