// const contextCCG = d3.select("#empty000").node().getContext("2d"),
//   pathCCG = d3.geoPath().context(contextCCG);

let geoData, topoData;

const promGeoData = d3.json("Data/geo/lsoa_gp_selected_simple20cp6.geojson");
const promTopoData = d3.json("Data/geo/lsoa_gp_selected_simple20cp6.topojson");
const promUSGeoData = d3.json("https://d3js.org/us-10m.v1.json");


// Local: Import topo
promTopoData.then((ccg) => {

  const width = 500,
    height = 600;

  const svg = d3
    .select("#empty000")
    .append("svg")
    // .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("stroke", "#000")
    .style("stroke - linejoin", "round")
    .style("stroke - linecap", "round");

  // pathSvg = d3.geoPath();
// https://www.openstreetmap.org/#map=12/53.9789/-1.0767

  // Convert topoJson to geoJson for display
  const lsoa = topojson.feature(ccg, ccg.objects.lsoa_gp_selected_original) // lsoa_gp_selected_original, lsoa_gp_selected_simple20cp6

  const projection = d3.geoMercator() // geoMercator is standard projection for webmaps
    .fitSize([width, height], lsoa) // this will work out the appropriate scale, translate to display the map in the given svg size

    const path = d3.geoPath()
    .projection(projection);

  // Manual approach
  // const projection = d3.geoAlbers()
  // .center([0, 53.9789]) // set the center to 0°W 55.4°N, giving an effective origin of 4.4°W 55.4°N
  // .rotate([0.5, -0.06]) // rotate longitude
  // .parallels([50, 60]) // standard parallels of 50°N and 60°N ie. how far north
  // .scale(40000)
  //   .translate([960 / 2, 600 / 2]); // width / height





  svg
    .append("path")
    .datum(lsoa)
    .attr(
      "d",
      path
  );





  // const transform = {
  //   scale: [0.009995801851947097, 0.005844667153098606],
  //   translate: [-56.77775821661018, 12.469025989284091],
  // };

  // ccg.transform = transform;

  //   svg.append("path")
  //       .attr("stroke", "#aaa")
  //       .attr("stroke-width", 0.5)
  //       .attr("d", pathSvg(topojson.mesh(ccg, ccg.objects.counties, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));

  //   svg.append("path")
  //       .attr("stroke-width", 0.5)
  //       .attr("d", pathSvg(topojson.mesh(ccg, ccg.objects.states, function(a, b) { return a !== b; })));


});


// Learning using geoJson
promGeoData
  .then((data) => {
    geoData = data;
  })
  .then(() => {
    console.log(geoData);

    // convert geoJson to topoJson
    topoData = topojson.topology({ foo: geoData });
    console.log(topoData);

    // contextCCG.beginPath();
    // pathCCG(topojson.mesh(topoData, topoData.objects.foo));
    // contextCCG.stroke();

    // to convert back to geojson
    // geoData = topojson.feature(
    //   data,
    //   data.objects.ccg_boundary_national_202104
    // );
  });

//   promTopoData
//   .then((data) => {
//       console.log(data)
//     contextCCG.beginPath();
//     pathCCG(topojson.feature(data, data.objects.lsoa_gp_selected_simple20cp6));
//     contextCCG.stroke();
//   })


// Bostock Example with topoJson and Canvas
promUSGeoData.then((data) => {
  const contextUS = d3.select("#empty001").node().getContext("2d"),
    path = d3.geoPath().context(contextUS);

  // console.log(data);

  contextUS.beginPath();
  path(topojson.mesh(data));
  contextUS.stroke();
});

// Bostock Example with topoJson and Canvas
promUSGeoData.then((us) => {
  // https://bl.ocks.org/mbostock/4108203
  const svg = d3.select("#empty002"),
    pathSvg = d3.geoPath();

  svg
    .append("path")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 0.5)
    .attr(
      "d",
      pathSvg(
        topojson.mesh(us, us.objects.counties, function (a, b) {
          return a !== b && ((a.id / 1000) | 0) === ((b.id / 1000) | 0);
        })
      )
    );

  svg
    .append("path")
    .attr("stroke-width", 0.5)
    .attr(
      "d",
      pathSvg(
        topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
        })
      )
    );

  svg
    .append("path")
    .attr("d", pathSvg(topojson.feature(us, us.objects.nation)));
});
