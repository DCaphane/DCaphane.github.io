const svgBar = d3
  .select("#cht_PopBar")
  .append("svg")
  .attr(
    "viewBox",
    "0 0 " +
      (chtWidthWide + marginDemog.left + marginDemog.right) +
      " " +
      (chtHeightStd + marginDemog.top + marginDemog.bottom)
  );

const bar = svgBar
  .append("g")
  .attr("fill", "steelblue")
  .style("mix-blend-mode", "multiply");

const xBar = d3
  .scaleBand()
  .range([margin.left, chtWidthWide - margin.right])
  .padding(0.1);

const yBar = d3
  .scaleLinear()
  .nice()
  .range([chtHeightStd - margin.bottom, margin.top]);

const xAxis = (g) =>
  g
    .attr("transform", `translate(0,${chtHeightStd - margin.bottom})`)
    .call(d3.axisBottom(xBar).tickSizeOuter(0));

const yAxisBar = (g) =>
  g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yBar))
    .call((g) => g.select(".domain").remove());

// const gx = svgBar.append("g").call(xAxis);
svgBar
  .append("g")
  .attr("class", "axis bottom")
  .attr("transform", translation(0, chtHeightStd));


svgBar
  .append("g")
  .attr("class", "y axis")
  .attr("id", "axis--yBar")
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
// bar
//   .data(data, (d) => d.name)
//   .order()
//   .transition(t)
//   .delay((d, i) => i * 20)
//   .attr("x", (d) => x(d.name));

// gx.transition(t)
//   .call(xAxis)
//   .selectAll(".tick")
//   .delay((d, i) => i * 20);


function fnChartBarData(data) {

  const d = d3.rollup(
    data,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => +d.Period,
    (d) => d.Practice
  );

  redrawBarChart(d.get(selectedDate));
}


function redrawBarChart(data) {

  let t = d3.transition().duration(750).ease(d3.easeBounce);
    xBar.domain(data.keys()) // practice codes
    // xBar.domain(data.sort(order).map(data.keys()));
    yBar.domain([0, d3.max(data.values())])

    svgBar
    .select(".axis.bottom")
    .transition(t)
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -7) // shifts text up (+) or down (-)
    .attr("dy", ".35em") // shifts text left (+) or right
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end");

  svgBar.select("#axis--yBar").transition(t).call(yAxisBar).selectAll("text");

    bar
    .selectAll("rect")
      .data(data.keys(), function (d) {
      return d; // practice code
    })
    .join(
      (
        enter // ENTER new elements present in new data.
      ) =>
        enter
          .append("rect")
          .datum(function (d, i) {
            let x, y; // x = practice, y = value, i = index (irrelevant)
            [x, y, i] = [d, data.get(d), i];
            // console.log([x, y, i])
            return [x, y, i];
          })
          .attr("x", ([x, y, i]) => xBar(x))
                .attr("y", ([x, y, i]) => yBar(y))
                .attr("width", xBar.bandwidth())
          .attr("height", ([x, y, i]) => yBar(0) - yBar(y))
          // .attr("class", "trend-circle faa-vertical animated-hover")
          // .classed("highlight animated", function ([x, y, i]) {
          //   return null;
          // })
          .call((enter) =>
          enter
            .transition(t)
            .delay(function ([x, y, i]) {
              // a different delay for each circle
              return i * 50;
            })
            .attr("cy", function ([x, y, i]) {
              return yBar(y);
            })
        ),
    (
      update // UPDATE old elements present in new data.
    ) =>
      update.call((update) =>
        update.transition(t).attr("cy", function ([x, y, i]) {
          return y;
        })
      ),
    (
      exit // EXIT old elements not present in new data.
    ) => exit.call((exit) => exit.transition(t).remove())
  );
}
