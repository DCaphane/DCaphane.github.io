function fnChartBarData(dataImport) {
  // https://gist.github.com/lstefano71/21d1770f4ef050c7e52402b59281c1a0
  const d = d3.rollup(
    dataImport,
    (v) => d3.sum(v, (d) => d.Total_Pop),
    (d) => +d.Period,
    (d) => d.Practice
  );

  const newData = d.get(selectedDate);

  var svg = d3
    .select("#cht_PopBar")
    .append("svg")
    .attr(
      "viewBox",
      `0 0
      ${chtWidthWide + margin.left + margin.right}
${chtHeightStd + margin.top + margin.bottom}`
    );

  let tooltipPopnBar = Tooltip("#cht_PopBar");
  tooltipPopnBar.style("height", "65px").style("width", "150px");

  var x = d3
    .scaleBand()
    .domain(
      newData.keys()
      // data.map(function (d) {
      //   return d[0];
      // })
    )
    .range([margin.left, chtWidthWide - margin.right])
    .padding(0.1);

  // max y value used for domain and colour scheme so calculate once here
  const yMax = d3.max(newData.values());
  var y = d3
    .scaleLinear()
    .nice()
    .domain([
      0,
      yMax,
      //   data, function (d) {
      //   return d.value;
      // }
      // ),
    ])
    .range([chtHeightStd, margin.top]);

  var yAxis = d3.axisLeft().scale(y);

  svg
    .append("g")
    .attr("class", "y axis")
    .attr("id", "axis--yBar")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    // text label for the y axis
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 10 - margin.left)
    .attr("x", 0 - chtHeightStd / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Population");

  svg
    .selectAll("rect")
    .data(newData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .classed("barPopn highlight", function (d) {
      return d[0] === selectedPractice;
    })
    .on("click", function (event, d) {
      console.log("selPractice:", d[0]);
    })
    .on("mouseenter", function () {
      const sel = d3.select(this);
      sel.attr("fill", "red");
      mouseover(sel, tooltipPopnBar);
    })
    .on("mousemove", function (event, d) {
      const str = `<strong>Code: ${d[0]}</strong><br>
      <span style="color:red">
        ${practiceLookup.get(d[0])}
        </span><br>
      Popn: ${formatNumber(d[1])}
        `;
      tooltipText(tooltipPopnBar, str, event);
    })
    .on("mouseleave", function () {
      const sel = d3.select(this);
      mouseleave(sel, tooltipPopnBar);
      sel
        .transition()
        .duration(250)
        .attr("fill", function (d) {
          return d3.interpolateGreys(d3.max([1.0 - d[1] / yMax, 0.4]));
        });
    })

    .attr("fill", function (d) {
      return d3.interpolateGreys(d3.max([1.0 - d[1] / yMax, 0.4]));
    })

    .attr("x", function (d, i) {
      return x(d[0]);
    })
    .attr("width", x.bandwidth())
    .attr("y", chtHeightStd)

    .transition("bars")
    .delay(function (d, i) {
      return i * 50;
    })
    .duration(1000)

    .attr("y", function (d, i) {
      return y(d[1]);
    })
    .attr("height", function (d, i) {
      return chtHeightStd - y(d[1]);
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
    .data(newData)
    .enter()
    .append("text")
    .attr("class", "axis bottom")
    .classed("bar-label", true)
    .attr("font-family", "sans-serif")
    .attr("font-size", "0.75rem")
    .attr("transform", function (d, i) {
      return `translate(
        ${x(d[0]) + x.bandwidth() / 2 - 5},
      ${chtHeightStd + 30})
         rotate(-60)`;
    })

    .attr("text-anchor", "middle")
    .text(function (d) {
      return d[0];
    });

  // Add a drop down
  const divBarOrder = document.querySelector("#barOrder"),
    frag = document.createDocumentFragment(),
    select = document.createElement("select");

  select.setAttribute("id", "test");
  select.setAttribute("class", "dropdown-input");

  // Option constructor: args text, value, defaultSelected, selected
  select.options.add(new Option("Alphabetical (Code)", 0, true, true));
  // select.options.add(new Option("Alphabetical (Name)", 0, true, true));
  select.options.add(new Option("Popn Asc", 1));
  select.options.add(new Option("Popn Desc", 2));

  frag.appendChild(select);
  divBarOrder.appendChild(frag);

  d3.select("#test").on("change", function () {
    let mapOrdered, sortStringValues;
    // let t = d3.transition().duration(750).ease(d3.easeBounce);

    const sortType = +eval(d3.select(this).property("value")),
      sortDesc = d3.select("#test option:checked").text();

    switch (sortType) {
      case 0: // alphabetical A-Z
        mapOrdered = [...newData.keys()].sort(); // map keys to array and then sort
        x.domain(mapOrdered);
        break;
      case 1: // volume ascending
        // https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object
        sortStringValues = (a, b) =>
          (a[1] > b[1] && 1) || (a[1] === b[1] ? 0 : -1);
        mapOrdered = new Map([...newData].sort(sortStringValues));
        x.domain(mapOrdered.keys()); // volume
        break;
      case 2: // volume descending
        sortStringValues = (b, a) =>
          (a[1] > b[1] && 1) || (a[1] === b[1] ? 0 : -1);
        mapOrdered = new Map([...newData].sort(sortStringValues));
        x.domain(mapOrdered.keys()); // volume
        break;
    }

    svg
      .selectAll(".bar")
      .transition()
      .duration(500)
      .attr("x", function (d, i) {
        return x(d[0]);
      });

    // svg
    //   .selectAll(".val-label")
    //   .transition()
    //   .duration(500)
    //   .attr("x", function (d, i) {
    //     return x(d[0]) + x.bandwidth() / 2;
    //   });

    svg
      .selectAll(".bar-label")
      .transition()
      .duration(500)
      .attr("transform", function (d, i) {
        return `translate(
          ${x(d[0]) + x.bandwidth() / 2 - 5},
        ${chtHeightStd + 30})
           rotate(-60)`;
      });
  });
}
