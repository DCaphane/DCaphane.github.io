/*
Line and marker transitions
	https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
*/

const chtWidthStd = 400,
  chtHeightStd = 400,
  chtWidthWide = 500,
  chtHeightTall = 700,
  chtHeightShort = 250;

const margin = {
  top: 50,
  right: 10,
  bottom: 150,
  left: 85
};

const parseDate = d3.timeParse("%b-%y"), // import format
  formatPeriod = d3.timeFormat("%b-%y"), // presentational format eg. Apr-16
  formatNumber = d3.format(",d");

let yAxisZero = false;

// Trend by Period
const svgTrend = d3
  .select("#cht_PopTrend")
  .append("svg")
  .attr("viewBox", "0 0 " + chtWidthWide + " " + (chtHeightShort + 100))
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xPeriod = d3.scaleTime().rangeRound([0, chtWidthWide - 120]),
  yPeriod = d3.scaleLinear().rangeRound([chtHeightShort, 0]);

const xAxisPeriod = d3.axisBottom(xPeriod),
  yAxisPeriod = d3.axisLeft(yPeriod);

const plotLine = d3
  .line()
  .x(function(d) {
    return xPeriod(d.Period);
  })
  .y(function(d) {
    return yPeriod(d.Population);
  });

let line, dot;

// Define the div for the tooltip
const div = d3
  .select("body")
  .append("div") // need to understand this...
  .attr("class", "tooltip")
  .style("opacity", 0);

// Tooltips
const tipTrend = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d, i) {
    return (
      "<strong>" +
      formatPeriod(d.Period) +
      ':<br></strong> <span style="color:red">' +
      formatNumber(d.Population) +
      "</span>"
    );
  });

svgTrend.call(tipTrend);

// Add a 'select', drop down box
const selPracticeDropDown = document.getElementById("selPractice"),
  selPracticeCompareDropDown = document.getElementById("selPracticeCompare");

// Load the initial data and then variations on this for subsequent filtering
let dataLevel_00, // initially loaded data
  dataLevel_01, // by period
  dataLevel_02, // by practice by period
  dataLevel_03 = [], // by age/ sex, latest period (init chart)
  dataLevel_04, // by age/ sex, by practice by period
  data_DemoInit; // used to initialise demographic data

// Hard code age bands using 'Age Band Org' (original) figures to keep in order
// this version can be used if in the 'row' function use Age_Band: d.Age_Band_Org,
// However, in earlier versions, age was capped at 85+ years
// var ageBands = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95+']

let uniquePractices,
  selectedPractice,
  selectedPracticeCompare = "None",
  selectedDate;

d3.csv("data/GP_Practice_Populations.csv", function row(d) {
  return {
    Practice: d.Practice_Mapped,
    Locality: d.Locality,
    Age_Band: d.Age_Band,
    Period: parseDate(d.Period),
    Male_Pop: +d.Male,
    Female_Pop: +d.Female,
    Total_Pop: +d.Total
  };
})
  .then(function(data) {
    dataLevel_00 = data; // key fields from data, formatted by row() function
    // console.log(dataLevel_00)

    // List of practices for use in drop down ------------------------
    uniquePractices = d3
      .nest()
      .key(function(d) {
        return d.Practice;
      })
      .sortKeys(d3.ascending)
      .rollup(function(v) {
        return v.length;
      })
      .entries(dataLevel_00);
    // console.log(uniquePractices)

    // drop down button
    let options = d3
      .selectAll(".selPractice")
      .selectAll("option")
      .data(uniquePractices)
      .enter()
      .append("option")
      .attr("value", function(d) {
        return d.key;
      })
      .text(function(d) {
        return d.key + ': ' + practiceLookup.get(d.key);
      });

    // Add a default 'Select Total' option to drop down box
    selPracticeDropDown.options[
      selPracticeDropDown.options.length
    ] = new Option("Total CCG", "Default");
    // Show this 'Total' option as the default by selecting
    selPracticeDropDown.selectedIndex =
      [selPracticeDropDown.options.length] - 1;

    // Add a default 'Select None' option to the compare drop down box
    selPracticeCompareDropDown.options[
      selPracticeCompareDropDown.options.length
    ] = new Option("Total CCG", "Default");
    selPracticeCompareDropDown.options[
      selPracticeCompareDropDown.options.length
    ] = new Option("None", "None");
    selPracticeCompareDropDown.selectedIndex =
      [selPracticeCompareDropDown.options.length] - 1;

    d3.select("#selPractice").on("change", function() {
      let selection =
        selPracticeDropDown.options[selPracticeDropDown.selectedIndex].value;
      selectedPractice = selection;
      // console.log(selectedPractice)

      if (selectedPractice === "Default") {
        initChtPeriod();
      } else {
        chartPopulationTrend(selectedPractice);
      }

      chartDemographics(selectedPractice, selectedDate);
      chartDemographicsCompare(selectedPracticeCompare, selectedDate);
    });
    // ---------------------------------------------------------------

    d3.select("#selPracticeCompare").on("change", function() {
      var selectionCompare =
        selPracticeCompareDropDown.options[
          selPracticeCompareDropDown.selectedIndex
        ].value;
      selectedPracticeCompare = selectionCompare;
      // console.log(selectedPracticeCompare)

      chartDemographicsCompare(selectedPracticeCompare, selectedDate);
    });

    // List of Age Bands ------------------------
    uniqueAgeBands = d3
      .nest()
      .key(function(d) {
        return d.Age_Band;
      })
      .sortKeys(d3.ascending)
      .rollup(function(v) {
        return v.length;
      })
      .entries(dataLevel_00);
    // console.log(uniqueAgeBands)

    // for default date, use the most recent period
    selectedDate = d3.max(dataLevel_00, function(d) {
      return d.Period;
    });
    // console.log(selectedDate)

    // Total by Period for initial Trend Chart
    dataLevel_01 = d3
      .nest()
      .key(function(d) {
        return d.Period;
      })
      .rollup(function(v) {
        return {
          total: d3.sum(v, function(d) {
            return d.Total_Pop;
          })
        };
      })
      .entries(dataLevel_00);
    // console.log(dataLevel_01)

    // Practices by Period - Trend Chart Filtered
    dataLevel_02 = d3
      .nest()
      .key(function(d) {
        return d.Practice;
      })
      .key(function(d) {
        return d.Period;
      })
      .rollup(function(v) {
        return {
          total: d3.sum(v, function(d) {
            return d.Total_Pop;
          })
        };
      })
      .entries(dataLevel_00);
    // console.log(dataLevel_02)

    //-------------------------------------------------------
    // Practices by Period and Age Band - Trend Chart Filtered
    data_DemoInit = d3
      .nest()
      .key(function(d) {
        return d.Period;
      })
      .key(function(d) {
        return d.Age_Band;
      })
      .rollup(function(v) {
        return {
          total: d3.sum(v, function(d) {
            return d.Total_Pop;
          }),
          male: d3.sum(v, function(d) {
            return d.Male_Pop;
          }),
          female: d3.sum(v, function(d) {
            return d.Female_Pop;
          })
        };
      })
      .entries(dataLevel_00);

    data_DemoInit.forEach(function(d) {
      d.Period = new Date(d.key);
      // d.Population = d.values;
    });
    // console.log(data_DemoInit)
    // console.log(selectedDate)

    data_DemoInit.forEach(function(d) {
      if (d.Period.getTime() === selectedDate.getTime())
        // comparing dates
        Array.prototype.push.apply(dataLevel_03, d.values);
    });
    // console.log(dataLevel_03);
    // ---------------------------------------------------------

    // Practices by Period by Age/Sex - Demographic Chart Filtered
    dataLevel_04 = d3
      .nest()
      .key(function(d) {
        return d.Practice;
      })
      .key(function(d) {
        return d.Period;
      })
      .key(function(d) {
        return d.Age_Band;
      })
      .rollup(function(v) {
        return {
          total: d3.sum(v, function(d) {
            return d.Total_Pop;
          }),
          male: d3.sum(v, function(d) {
            return d.Male_Pop;
          }),
          female: d3.sum(v, function(d) {
            return d.Female_Pop;
          })
        };
      })
      .entries(dataLevel_00);
    // console.log(dataLevel_04)

    initChtPeriod();
    //initChtDemo();
    chartDemographics(selectedPractice, selectedDate);
  })
  .catch(function(error) {
    // handle loading error here
  });

function initChtPeriod() {
  svgTrend.selectAll("*").remove();

  let chtDataTrend = [];
  chtDataTrend = dataLevel_01;

  // format data
  chtDataTrend.forEach(function(d) {
    d.Period = new Date(d.key);
    d.Population = +d.value.total;
  });
  // console.log(chtDataTrend)

  xPeriod
    .domain(
      d3.extent(chtDataTrend, function(d) {
        return d.Period;
      })
    )
    .nice();

  if (yAxisZero) {
    yPeriod
      .domain([
        0,
        d3.max(chtDataTrend, function(d) {
          return d.Population;
        })
      ])
      .nice();
  } else {
    yPeriod
      .domain(
        d3.extent(chtDataTrend, function(d) {
          return d.Population;
        })
      )
      .nice();
  }

  svgTrend
    .append("g")
    .attr("class", "x axis")
    .attr("id", "axis--x")
    .attr("transform", "translate(0," + chtHeightShort + ")")
    .call(xAxisPeriod)
    .append("text")
    .attr("x", chtWidthWide / 2)
    .attr("y", 30)
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Period");

  svgTrend
    .append("g")
    .attr("class", "y axis")
    .attr("id", "axis--y")
    .call(yAxisPeriod)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -chtHeightShort / 2 + 30)
    .attr("y", -55)
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Population");

  line = svgTrend
    .append("g")
    .append("path")
    // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .datum(chtDataTrend)
    .attr("d", plotLine);

  dot = svgTrend
    .append("g")
    .attr("id", "scatter")
    // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .selectAll(".dot")
    .data(chtDataTrend)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      // 'dot'
      if (d.Period.getTime() == selectedDate.getTime()) {
        return "dot_highlight";
      } else {
        return "dot";
      }
    })
    .attr("r", 6)
    .attr("cx", function(d) {
      return xPeriod(d.Period);
    })
    .attr("cy", function(d) {
      return yPeriod(d.Population);
    })
    .on("click", function(d) {
      selectedDate = d.Period;
      console.log(selectedDate);
      d3.selectAll(".dot_highlight").attr("class", "dot");
      d3.select(this).attr("class", "dot_highlight");
      chartDemographics(undefined, d.Period);
      chartDemographicsCompare(selectedPracticeCompare, d.Period);
    })
    .on("mouseenter", tipTrend.show)
    .on("mouseover", function(d) {
      d3.select(this).attr("class", "dot_highlight");
    })
    .on("mouseout", function(d) {
      if (d.Period.getTime() == selectedDate.getTime()) {
        d3.select(this).attr("class", "dot_highlight"); // marker
      } else {
        d3.select(this).attr("class", "dot"); // marker
      }
    })
    .on("mouseleave", tipTrend.hide);
}

// default chart for total population
function chartPopulationTrend(practiceCode) {
  var chtDataTrend = [];

  if (!practiceCode) {
    // no practice selected, default
    chtDataTrend = dataLevel_01;
  } else {
    // chtDataTrend = dataLevel_02.filter(function (d) { return d.key === practiceCode })
    // http://stackoverflow.com/questions/38179672/d3-js-extract-array-in-object-within-array
    dataLevel_02.forEach(function(d) {
      if (d.key === practiceCode)
        Array.prototype.push.apply(chtDataTrend, d.values);
    });
  }

  // format data
  chtDataTrend.forEach(function(d) {
    d.Period = new Date(d.key);
    d.Population = +d.value.total;
  });
  // console.log(chtDataTrend)

  xPeriod
    .domain(
      d3.extent(chtDataTrend, function(d) {
        return d.Period;
      })
    )
    .nice();

  if (yAxisZero) {
    yPeriod
      .domain([
        0,
        d3.max(chtDataTrend, function(d) {
          return d.Population;
        })
      ])
      .nice();
  } else {
    yPeriod
      .domain(
        d3.extent(chtDataTrend, function(d) {
          return d.Population;
        })
      )
      .nice();
  }

  svgTrend
    .select(".x.axis")
    .transition()
    .duration(750)
    .call(xAxisPeriod);

  svgTrend
    .select(".y.axis")
    .transition()
    .duration(750)
    .call(yAxisPeriod);

  line
    .datum(chtDataTrend)
    .transition()
    .duration(750)
    .attr("d", plotLine);

  //Update all circles
  d3.selectAll("circle")
    .data(chtDataTrend)
    .transition()
    .duration(750)
    .attr("cx", function(d) {
      return xPeriod(d.Period);
    })
    .attr("cy", function(d) {
      return yPeriod(d.Population);
    });
  //.attr('class', 'dot');

  //Enter new circles
  d3.selectAll("circle")
    .data(chtDataTrend)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return xPeriod(d.Period);
    })
    .attr("cy", function(d) {
      return yPeriod(d.Population);
    })
    .attr("r", 5);

  // Remove old
  d3.selectAll("circle")
    .data(chtDataTrend)
    .exit()
    .remove();
}

// Function to create Title Case
String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Toggle the y-axis on the trend chart to show 0 or nice
const trendYAxisZero = document.getElementById("trend-yAxis");
trendYAxisZero.addEventListener("click", function() {
  yAxisZero = trendYAxisZero.checked;
  chartPopulationTrend(selectedPractice);
});
