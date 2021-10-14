import {
  recolourPopnLSOAIMD,
  dataIMD,
  mapIMDDomain,
  imdDomainDesc,
  mapsWithLSOAFiltered,
  mapsFilteredLSOA,
  mapIMD,
  imdLegend,
  formatNumber,
} from "../../aggregateModules.mjs";

// Map IMD by LSOA
export function recolourIMDLayer(defaultIMD = "imdRank") {
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
