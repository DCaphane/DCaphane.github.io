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
${chtHeightStd + margin.top + margin.bottom}`
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

  var yAxisBar = d3.axisLeft().scale(y);

  svg
    .append("g")
    .attr("class", "y axis")
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
    const newData = d.get(selectedDate);

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
            .on("click", function (event, d) {
              console.log("selPractice:", d.practice);
            })
            .on("mouseover", function (event, d) {
              const sel = d3.select(this);
              sel.attr("fill", "red");
              const str = `<strong>Code: ${d.practice}</strong><br>
      <span style="color:red">
        ${practiceLookup.get(d.practice)}
        </span><br>
      Popn: ${formatNumber(d.population)}
        `;
              newTooltip.mouseover(tooltipPopnBar, str, event);
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
      .attr("class", "bar")
      .classed("barPopn highlight", function (d) {
        return d.practice === selectedPractice;
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

    // svg
    //   .selectAll("rect")
    //   .append("title")
    //   .text(function (d) {
    //     return `${d[0]}\n${practiceLookup.get(d[0])}\n${formatNumber(d[1])}`;
    //   });

    // svg
    //   .selectAll(".val-label")
    //   .data(newData)
    //   .enter()
    //   .append("text")
    //   .classed("val-label", true)

    // .attr("x", function (d, i) {
    //   return x(d[0]) + x.bandwidth() / 2;
    // })
    // .attr("y", chtHeightStd)

    // .transition("label")
    // .delay(function (d, i) {
    //   return i * 50; // gives it a smoother effect
    // })
    // .duration(1000)

    // .attr("y", function (d, i) {
    //   return y(d[1]) - 4;
    // })
    // .attr("text-anchor", "middle")
    // .text(function (d) {
    //   return d[1];
    // });

    // const xAxis = (g) =>
    // g
    //   .attr("transform", `translate(0,${chtHeightStd})`)
    //   .call(d3.axisBottom(x).tickSizeOuter(0));

    //   const gx = svg.append("g").call(xAxis);
    //   svg
    //     .append("g")
    //     .attr("class", "axis bottom")
    //     .attr("transform", translation(0, chtHeightStd));

    svg
      .selectAll(".bar-label")
      .data(newData.keys(), function (d) {
        return d;
      })
      .join(
        (
          enter // ENTER new elements present in new data.
        ) =>
          enter
            .append("text")
            .attr("class", "axis bottom")
            .classed("bar-label", true)
            .attr("font-family", "sans-serif")
            .attr("font-size", "0.75rem")
            .attr("transform", function (d, i) {
              return `translate(
        ${x(d) + x.bandwidth() / 2 - 5},
      ${chtHeightStd + 30})
rotate(-60)`;
            })

            .attr("text-anchor", "middle")
            .text(function (d) {
              return d;
            }),
        (
          update // UPDATE old elements present in new data.
        ) =>
          update.call((update) =>
            update
              .transition(t)
              .delay(function ([x, y, i]) {
                return i * 50;
              })
              .attr("transform", function (d, i) {
                return `translate(
                ${x(d) + x.bandwidth() / 2 - 5},
              ${chtHeightStd + 30})
        rotate(-60)`;
              })
          ),
        (
          exit // EXIT old elements not present in new data.
        ) => exit.call((exit) => exit.remove()) // exit.transition(t).remove()
      );
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
