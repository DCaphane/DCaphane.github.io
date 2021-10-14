import {
  mapIMDDomain,
  dataRatesLookup,
  recolourIMDLayer,
} from "../../aggregateModules.mjs";

let imdDomainDesc = "Population",
  imdDomainShort = "population";
export { imdDomainDesc, imdDomainShort };

imdDomain();

function imdDomain(id = "selIMD") {
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
}
