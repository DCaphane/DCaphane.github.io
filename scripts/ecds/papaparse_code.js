Papa.parse("Data/ecds/AE_RawData_snomed.csv", {
    download: true,
    header: false,
    delimiter: ",",
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: d => {
      console.timeEnd("dataImport");
      // Formatting
  
      console.time("parseTime");
  
      // Following used to identify order of columns returned in sql query
      // Could return this in sql, import as csv --> array...
  
      d.data.forEach(function(d) {
        // Time formatting
        // d[0] = parseDate(d[0]);
        // Subsequent Time Derived Fields
        // d.Daily = +d3.timeDay(d[0]); // + turns date into an integer (time in ms since 1970, jsDayZero)
        // d.Period = +d3.timeMonth(d[0]); // new Date(d[0].getFullYear(), d[0].getMonth(), 1);
        // d.Month = +formatMonthNo(d[0]) - 1;
        // d.WeekdayNo = +formatWeekdayNo(d[0]);
        // d.Hour = +d[0].getHours(); // +formatHour12(d[0]);
        // d[0] = +d[0];
        //d[0] = null;
  
        d[sqlCols.duration] = Math.min(d[sqlCols.duration], maxDuration); // Fix max duration at source
        d[sqlCols.ageBand] = arrAgeBand.indexOf(d[sqlCols.ageBand]);
  
        if (practiceObj[d[sqlCols.practice]] !== undefined) {
          d[sqlCols.practice] = +practiceObj[d[sqlCols.practice]][0];
        } else {
          d[sqlCols.practice] = 0;
        }
        // Diagnosis Analysis
        if (diagnosisRefObj[+d[sqlCols.diagnosis]] !== undefined) {
          // ie. snomed code has been found...
          d.Diagnoses = diagnosisRefObj[+d[sqlCols.diagnosis]];
          d.DiagnosisMainGroup = diagnosisRefObj[+d[sqlCols.diagnosis]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.diagnosis] === 0) {
            // null diagnosis returned in original data
            d.Diagnoses = [0];
            d.DiagnosisMainGroup = 0;
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.Diagnoses = [999];
            d.DiagnosisMainGroup = 999;
            // The below is used to log any diagnosis codes that do not have a valid lookup. Consider adding for reference
            diagnosis_set.add(+d[sqlCols.diagnosis]);
          }
        }
  
        if (attdSourceRefObj[d[sqlCols.refSource]] !== undefined) {
          // ie. snomed code has been found...
          d.attdSource = attdSourceRefObj[d[sqlCols.refSource]];
          // d.ComplaintMainGroup = complaintRefObj[d[5]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.refSource] === 0) {
            d.attdSource = [0];
            // .ComplaintMainGroup = ["0"];
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.attdSource = [0];
            // d.ComplaintMainGroup = [0];
            // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
            attdSource_set.add(d[sqlCols.refSource]);
          }
        }
  
        if (complaintRefObj[d[sqlCols.complaint]] !== undefined) {
          // ie. snomed code has been found...
          d.Complaint = complaintRefObj[+d[sqlCols.complaint]];
          // d.ComplaintMainGroup = complaintRefObj[d[8]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.complaint] === 0) {
            d.Complaint = [0];
            // .ComplaintMainGroup = ["0"];
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.Complaint = [0];
            // d.ComplaintMainGroup = [0];
            // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
            complaint_set.add(d[sqlCols.complaint]);
          }
        }
  
        if (dischdestRefObj[d[sqlCols.dischDest]] !== undefined) {
          // ie. snomed code has been found...
          d.dischDest = dischdestRefObj[d[sqlCols.dischDest]];
          // d.ComplaintMainGroup = complaintRefObj[d[5]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.dischDest] === 0) {
            d.dischDest = [0];
            // .ComplaintMainGroup = ["0"];
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.dischDest = [0];
            // d.ComplaintMainGroup = [0];
            // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
            dischdest_set.add(d[sqlCols.dischDest]);
          }
        }
  
        if (dischstatusRefObj[d[sqlCols.dischStatus]] !== undefined) {
          // ie. snomed code has been found...
          d.dischStatus = dischstatusRefObj[d[sqlCols.dischStatus]];
          // d.ComplaintMainGroup = complaintRefObj[d[5]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.dischStatus] === 0) {
            d.dischStatus = [0];
            // .ComplaintMainGroup = ["0"];
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.dischStatus = [0];
            // d.ComplaintMainGroup = [0];
            // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
            dischstatus_set.add(d[sqlCols.dischStatus]);
          }
        }
  
        if (dischfupRefObj[d[sqlCols.dischFUP]] !== undefined) {
          // ie. snomed code has been found...
          d.dischFUP = dischfupRefObj[d[sqlCols.dischFUP]];
          // d.ComplaintMainGroup = complaintRefObj[d[5]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.dischFUP] === 0) {
            d.dischFUP = [0];
            // .ComplaintMainGroup = ["0"];
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.dischFUP = [0];
            // d.ComplaintMainGroup = [0];
            // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
            dischfup_set.add(d[sqlCols.dischFUP]);
          }
        }
  
        if (injdrugRefObj[d[sqlCols.injDrug]] !== undefined) {
          // ie. snomed code has been found...
  
          d.injdrug = injdrugRefObj[d[sqlCols.injDrug]];
          // d.ComplaintMainGroup = complaintRefObj[d[5]][0];
        } else {
          // code not found in ref table look up - investigate
          if (d[sqlCols.injDrug] === 0) {
            d.injdrug = [0];
            // .ComplaintMainGroup = ["0"];
          } else {
            // snomed code was submitted but not found in existing look up. Typically old code that has since been removed.
            d.injdrug = [0];
            // d.ComplaintMainGroup = [0];
            // The below is used to log any complaint codes that do not have a valid lookup. Consider adding for reference
            injdrug_set.add(d[sqlCols.injDrug]);
          }
        }
      });
  
      // missingSnomedCodes["diagnosis"] = diagnosis_set;
      // missingSnomedCodes["complaint"] = complaint_set;
      // missingSnomedCodes["attdSource"] = attdSource_set;
      // missingSnomedCodes["dischDest"] = dischdest_set;
      // missingSnomedCodes["dischStatus"] = dischstatus_set;
      // missingSnomedCodes["dischFUP"] = dischfup_set;
      // missingSnomedCodes["injDrug"] = injdrug_set;
      // console.warn(missingSnomedCodes); // snomed codes that have not been found
  
      console.timeEnd("parseTime");
  
      // Run the data through crossfilter and load the cf_data
      cf = crossfilter(d.data);
      all = cf.groupAll();
  
      // // how many rows?
      // console.log(
      //   "%cNo of Records: %s",
      //   "color: blue; background: white",
      //   formatNumber(cf.size())
      // );
      // // log a random record
      // const random = Math.floor(Math.random() * (+cf.size() - +0)) + +0; // random number between 0 and no. records
      // console.log(d.data[random]); // console.log(d.data[0]);// example data
  
      // // Used to present total number of records and number of filtered records
      // dc.dataCount("#counter")
      //   .crossfilter(cf)
      //   .groupAll(all)
      //   .formatNumber(formatNumber)
      //   .html({
      //     some:
      //       "<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records" +
      //       " | <a href='javascript:dc.filterAll(); dc.redrawAll();'>Reset All</a>", // dc.renderAll
      //     all:
      //       "All records selected. Please click on the charts to apply filters."
      //   });
  
      // Dimensions
  
      // Diagnosis Dimensions
  
      // Patient Characteristics
  
      // Other
  
      // Check dimensions
      // console.log(dimPeriod.top(Infinity));
  
      //const dateRange = [minDate, maxDate];
      // console.log(dateRange)
  
      // Crossfilter on a dimension
      // let minDuration = (dimDuration.bottom(1)[0]["Duration"]),
      //     maxDuration = (dimDuration.top(1)[0]["Duration"]);
      //
      // let durationRange = [minDuration, maxDuration];
      // console.log(dimDuration.top(1)[0]["Duration"])
  
      // Crossfilter functions based on diagnosis
      // console.log(dimPeriod.top(5))
      // dimWeekday.filter(function (d) { return d === 'Mon'; });
      // console.log(dimWeekday.top(5))
      // Remove filter
      // dimWeekday.filterAll()
  
      // groupDaily.all();
      // console.log(groupDaily.top(10));
  
      // Check Group
      // console.log(groupTimeofDay.all());
  
      /* Charting */
  
      // Daily and Period Charts are closely linked
  
      const dimDaily = cf.dimension(function(d) {
          return d[sqlCols.arrivalDate];
        }),
        groupDaily = dimDaily.group();
  
      // https://stackoverflow.com/questions/31808718/dc-js-barchart-first-and-last-bar-not-displaying-fully
      // check what the first set of square brakcets are for
      const minDateTS = dimDaily.bottom(1)[0][sqlCols.arrivalDate],
        maxDateTS = dimDaily.top(1)[0][sqlCols.arrivalDate];
  
      const minDate = new Date(minDateTS),
        maxDate = new Date(maxDateTS);
  
      // minDate.setHours(minDate.getHours() - 1);
      // maxDate.setHours(maxDate.getHours() + 1);
  
      const dimPeriod = cf.dimension(function(d) {
          return d[sqlCols.period];
        }),
        groupPeriod = dimPeriod.group();
  
      seriesDaily
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightShort)
        .margins({ top: 0, right: 20, bottom: 60, left: 40 })
        .dimension(dimPeriod)
        .group(groupDaily)
        .x(
          d3
            .scaleTime()
            .domain([
              minDateTS - 1000 * 60 * 60 * 24 * 3,
              maxDateTS + 1000 * 60 * 60 * 24 * 3
            ]) // add & remove one day in ms
            .range([
              d3.timeDay.offset(minDate, -3),
              d3.timeDay.offset(maxDate, 3)
            ])
        ) // add a bit to the max date here
        //
        // .round(d3.timeMonth.round)
        // .xUnits(d3.timeMonths)
        .rangeChart(seriesPeriod) // https://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html#rangeChart__anchor
        .curve(d3.curveLinear)
        .elasticX(false) // set this to false with range series so that the dates align
        .elasticY(true)
        .renderArea(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .renderLabel(false)
        .brushOn(false)
        .xyTipsOn(true) // This is ignored if the chart brush is on
        .dotRadius(5)
        .renderDataPoints({
          radius: 2,
          fillOpacity: 0.8,
          strokeOpacity: 0.0
        })
        .title(function(d) {
          // const day = new Date(d.key).getDay()
          const day = arrWeekDays[+formatWeekdayNo(d.key)];
          if (bankHolidayMap.has(d.key)) {
            return [
              day + ", " + formatDaily(d.key),
              bankHolidayMap.get(d.key),
              "Att'd: " + formatNumber(d.value)
            ].join("\n");
          } else {
            return [
              day + ", " + formatDaily(d.key),
              "Att'd: " + formatNumber(d.value)
            ].join("\n");
          }
        })
        .mouseZoomable(true) // use mouse scroll to zoom in and out
        .controlsUseVisibility(true)
        .turnOnControls(true)
        // colour testing
        // https://dc-js.github.io/dc.js/docs/html/dc.colorMixin.html
        // https://stackoverflow.com/questions/43056664/dc-js-scatter-chart-with-dot-color-based-on-counts
        .colorAccessor(function(d) {
          // console.log(d.x + '\n' + +formatWeekdayNo(d.x)); // + '\n' + test[+formatWeekdayNo(d.x)])
          // console.log(+formatWeekdayNo(d.x))
          if (bankHolidayMap.has(d.x)) {
            return 2; // bank holiday
          } else if (+formatWeekdayNo(d.x) === 1) {
            return 1; // 1 = Monday
          } else {
            return 0; // every other day
          }
        })
        // colours per day of week, starting sunday (first point sets colour for the area/ line. Separate colour to identify Mon)
        .colors(
          d3
            .scaleOrdinal()
            .domain([0, 1, 2]) // regular day, Monday, Bank Holiday
            .range(["#377eb8", "#e41a1c", "#ff8c00"])
        ) // blue, red, yellow
        // need to add some padding around top
        // https://groups.google.com/forum/#!topic/dc-js-user-group/USgVVs4w7IU
        // https://github.com/dc-js/dc.js/issues/1203
        .yAxisPadding(10).yAxisMin = function() {
        return 0;
      };
  
      // http://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html
      seriesDaily
        .xAxis()
        // https://stackoverflow.com/questions/49178363/why-does-my-d3-charts-x-axis-include-the-first-of-every-month-as-a-tick-even-th/49178975#49178975
        //.ticks(d3.timeDay.filter(d => d3.timeDay.count(0, d) % 7 === 0))
        //.ticks(d3.timeDay.every(14))
        .tickFormat(formatDaily);
  
      seriesDaily.render();
  
      // rotate x-axis 90 degrees - need to adjust x/y to align appropriately
      seriesDaily.on("renderlet.a", function(chart) {
        chart
          .selectAll("g.x text")
          .attr("dx", "-30")
          .attr("dy", "-5")
          .attr("transform", "rotate(-90)");
      });
  
      // https://stackoverflow.com/questions/51610885/how-to-change-date-format-value-in-filter-text-dc-js
      seriesDaily.filterPrinter(function(filters) {
        const dateStart = new Date(dc.utils.printSingleValue(filters[0][0]));
        const dateEnd = d3.timeDay.offset(
          new Date(dc.utils.printSingleValue(filters[0][1])),
          -1
        );
        return formatDaily(dateStart) + " to " + formatDaily(dateEnd);
      });
  
      seriesPeriod
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightShort)
        .margins({
          top: 5,
          right: 40,
          bottom: 40,
          left: 40
        })
        .dimension(dimPeriod)
        .group(groupPeriod)
        .x(
          d3
            .scaleTime()
            .domain([minDateTS - 1000 * 60 * 60 * 24, maxDateTS]) // add & remove one day in ms
            .range([
              d3.timeDay.offset(minDate, -1),
              maxDate
              // d3.timeDay.offset(maxDate, 1)
            ])
        )
        .xUnits(d3.timeMonths)
        .round(d3.timeMonth.round) // set filter brush rounding
        // round the bars to days to make the brush snap, so you cant select half a bar.
        // Somehow, only get this to work with .centerBar(false)
        .alwaysUseRounding(true)
        // .elasticX(false)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        //.renderLabel(false)
        .brushOn(true)
        .mouseZoomable(false)
        .centerBar(false)
        //.barPadding(0.3)
        //.outerPadding(50)
        //.gap(30)
        .title(function(d) {
          return [d.key, formatNumber(d.value)].join(": ");
        })
        //.mouseZoomable(false) // use mouse scroll to zoom in and out
        .controlsUseVisibility(true)
        .turnOnControls(true)
        .xAxisPadding(10);
  
      // http://dc-js.github.io/dc.js/docs/html/dc.coordinateGridMixin.html
      seriesPeriod
        .xAxis()
        .tickFormat(function(d) {
          // console.log(d);
          return formatPeriod(new Date(d));
        })
        .ticks(d3.timeMonth.every(1));
  
      // rotate x-axis 90 degrees - need to adjust x/y to align appropriately
      seriesPeriod.on("renderlet.a", function(chart) {
        chart
          .selectAll("g.x text")
          .attr("dx", "-22")
          .attr("dy", "5")
          .attr("transform", "rotate(-90)");
      });
  
      // https://stackoverflow.com/questions/51610885/how-to-change-date-format-value-in-filter-text-dc-js
      // might be able to tidy this up - just using filter and formatting it...
      seriesPeriod.filterPrinter(function(filters) {
        const dateStart = new Date(dc.utils.printSingleValue(filters[0][0]));
        const dateEnd = d3.timeDay.offset(
          new Date(dc.utils.printSingleValue(filters[0][1])),
          -1
        );
        return formatDaily(dateStart) + " to " + formatDaily(dateEnd);
      });
  
      seriesPeriod.render();
  
      const dimWeekdayNo = cf.dimension(function(d) {
        return d[sqlCols.weekday];
      });
      // const groupWeekday = dimWeekday.group();
      // const groupWeekdayNo = dimWeekdayNo.group(); // dimension on day of week
      const groupWeekdayAvg = dimWeekdayNo.group().reduce(
        function(p, v) {
          // reduceAdd
          const day = v[sqlCols.arrivalDate]; // .getTime()
          p.map.set(day, p.map.has(day) ? p.map.get(day) + 1 : 1);
          //p.avg = average_map(p.map);
          return p;
        },
        function(p, v) {
          // reduceRemove
          const day = v[sqlCols.arrivalDate]; // .getTime() // d3.timeDay(v[0])
          p.map.set(day, p.map.has(day) ? p.map.get(day) - 1 : 0);
          //p.avg = average_map(p.map);
          return p;
        },
        function() {
          // reduceInitial
          // need some way of counting dates in filter range
          return { map: d3.map() }; // , counter: 0 };
        }
      );
  
      // Don't need this since in heatmap but for demo only using daily average
      chtDayofWeek
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .dimension(dimWeekdayNo) // dimWeekdayNo
        .group(groupWeekdayAvg) // groupWeekdayNo
        .valueAccessor(function(d) {
          // console.log(d)
          return average_map(d.value.map);
        }) // return kv.value.avg;
        .slicesCap(12) // one for each month - can show top X, rest will be grouped as other
        .innerRadius(70)
        .ordering(function(d) {
          return d.key;
        })
        .title(function(d) {
          return [
            arrWeekDays[d.key],
            formatNumber(average_map(d.value.map))
          ].join(": ");
        })
        .label(function(d) {
          return [
            arrWeekDays[d.key],
            formatNumber(average_map(d.value.map))
          ].join(": ");
        })
        .drawPaths(false)
        // .colorAccessor(function(d, i){return d.value;})
        // .ordinalColors(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628'])
        .ordinalColors(d3.schemeSpectral[7])
        // .colors()
        // .colorDomain()
        .turnOnControls(true)
        .controlsUseVisibility(true)
        .render();
  
      /* not required since can click directly on heatmap labels to filter by day
  chtDayofWeek // only works on certain chart types eg. pie
      .legend(
          dc.htmlLegend()
              .container('#test-legend')
              .legendText(function (d, i) { return arrWeekDays[d.name]; })
              .horizontal(true)
              .highlightSelected(true)
      )
      ;
  */
  
      // need to format the filterPrinter for the day chart {probably won't need but for testing...}
      chtDayofWeek.filterPrinter(function(filters) {
        return filters
          .sort()
          .map(function(f) {
            return arrWeekDays[f];
          })
          .join(", ");
      });
  
      const dimTimeofDay = cf.dimension(function(d) {
        return [d[sqlCols.hour], d[sqlCols.weekday]];
      });
      // declared in global scope
      groupTimeofDay = dimTimeofDay.group();
  
      // For some reason,had to swap order of dimTimeofDay ([hour, day] rather than [day, hour])
      // Without this, clicking on either axis filtered the other axis
      heatmapTimeDay
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightShort * 0.75)
        .dimension(dimTimeofDay)
        .group(groupTimeofDay)
        .keyAccessor(function(d) {
          return d.key[0];
        }) // columns, hours
        .valueAccessor(function(d) {
          return d.key[1];
        }) // rows, days
        .colorAccessor(function(d) {
          return d.value;
        })
        .colors(d3.scaleSequential(d3.interpolateOrRd)) // https://github.com/d3/d3-scale-chromatic
        .calculateColorDomain()
        // the preRedraw below is used to recalculate colours when filters are applied
        // if the colours have absolute meaning then remove this
        // https://stackoverflow.com/questions/36038808/dc-js-heatmap-colour-range-not-getting-updated-after-filter-applied
        .on("preRedraw", function() {
          heatmapTimeDay.calculateColorDomain();
        })
        .title(function(d) {
          const now = new Date(1900, 0, 1, d.key[0]);
          return [
            "Day: " + arrWeekDays[d.key[1]],
            "Hour: " + formatHour12(now),
            "Att'd: " + formatNumber(d.value)
          ].join("\n");
        })
        // Days of Week
        .rowsLabel(function(d) {
          return arrWeekDays[d];
        })
        .rowOrdering(d3.descending)
        // Time, 24 Hour Clock
        .colsLabel(function(d) {
          let pm = d > 12;
          if (d % 3 === 0) {
            return String(d > 12 ? d - 12 : d) + (pm ? " PM" : " AM");
          } else {
            return d > 12 ? d - 12 : d;
          }
        })
        .colOrdering(d3.ascending)
        .xBorderRadius(1) // 6.75 is the default
        .yBorderRadius(1)
        .controlsUseVisibility(true)
        .turnOnControls(true)
        .render();
      // legend: https://github.com/dc-js/dc.js/issues/964
      //.legend(dc.legend()) // can't get this to appear
  
      // https://dc-js.github.io/dc.js/docs/html/dc.baseMixin.html
      heatmapTimeDay.on("renderlet.b", function() {
        heatKey();
      });
  
      // Testing - heatMap Key
      // https://stackoverflow.com/questions/31441536/is-there-a-way-to-make-a-key-or-legend-for-a-heat-map-with-dc-js
      // console.log(groupTimeofDay.all())
  
      // https://github.com/crossfilter/crossfilter/wiki/API-Reference#group_top
      // console.log(groupTimeofDay.top(1)); // returns an array containing the object [{key: [hour, day], value: x}], in this case, highest value (top(1))
  
      // heatKey(10); // initial heatmap scale
  
      // heatmap Key - Testing
      // https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3
      // https://bl.ocks.org/caravinden/eb0e5a2b38c8815919290fa838c6b63b
      // https://codepen.io/greaney/pen/xLGdBq
  
      // create a simple horizontal bar, colour will be a given
      // only x-axis needs to change
  
      // https://stackoverflow.com/questions/31441536/is-there-a-way-to-make-a-key-or-legend-for-a-heat-map-with-dc-js
      // https://stackoverflow.com/questions/49739119/legend-with-smooth-gradient-and-corresponding-labels
      // https://bl.ocks.org/d3indepth/de07fcf34538cd6f8459e17038563ed3
  
      // Testing to move x-axis to the top
      // https://github.com/dc-js/dc.js/issues/1208
  
      // heatmapTimeDay
      // .xAxis(d3.axisTop());
      // end of testing
      // rotate x-axis 90 degrees - need to adjust x/y to align appropriately
  
      // padding is added to top and bottom (for y-axis, left and right for x)
  
      const dimRefSource = cf.dimension(function(d) {
          return d.attdSource;
        }),
        groupRefSource = dimRefSource.group();
  
      chtRefSource
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(100)
        .dimension(dimRefSource)
        .group(groupRefSource)
        .title(function(d) {
          return [
            map_attdSource_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .label(function(d) {
          return map_attdSource_groups.get(+d.path.join(""))[0];
        })
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_attdSource_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      document.getElementById("bl-sectime").style.display = "none";
      document.getElementById("sectime").style.visibility = "visible";
  
      // Diagnosis Charts
      // https://dc-js.github.io/dc.js/examples/sunburst.html
      // https://dc-js.github.io/dc.js/docs/html/dc.sunburstChart.html
  
      const dimDiagMain = cf.dimension(function(d) {
          return d.DiagnosisMainGroup;
        }),
        groupDiagMain = dimDiagMain.group();
  
      chtDiagMain
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        // .margins({ top: 10, right: 50, bottom: 30, left: 40 })
        .dimension(dimDiagMain)
        .group(groupDiagMain)
        //.colors(d3.scaleOrdinal(d3SchemeCategory20b))
        .ordering(function(d) {
          return -d.value;
        }) // sort descending
        .label(function(d) {
          return [map_diagnosis_groups.get(d.key)[0], formatNumber(d.value)].join(
            ": "
          );
        })
        .title(function(d) {
          return [map_diagnosis_groups.get(d.key)[0], formatNumber(d.value)].join(
            ": "
          );
        })
        .elasticX(true)
        .colorAccessor(function(d) {
          return +d.key;
        })
        .colors(function(d) {
          if (d !== undefined) {
            return map_diagnosis_groups.get(+d)[1];
            // return mapColours.get(d);
          }
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      const dimDiagnoses = cf.dimension(function(d) {
          return d.Diagnoses;
        }),
        groupDiagnoses = dimDiagnoses.group();
  
      chtDiagnoses
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(40)
        .dimension(dimDiagnoses)
        .group(groupDiagnoses)
        // https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
        // .ordering(function(d) {
        //   return -d.value;
        // })
        .title(function(d) {
          // d.path gives the parent keys too as an array, console.log(d.path[0])
          // console.log(+d.path.join(''))
          // console.log(d.path.join('')) // convert array, [11, 12, 13] to string (struggle to retrieve key from map when an array)
          return [
            map_diagnosis_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .emptyTitle("test")
        .label(function(d) {
          return [
            map_diagnosis_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        // .legend(dc.legend())
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_diagnosis_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      const dimAcuity = cf.dimension(function(d) {
          return d[sqlCols.acuity];
        }),
        groupAcuity = dimAcuity.group();
  
      chtAcuity
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .slicesCap(12) // one for each month - can show top X, rest will be grouped as other
        .innerRadius(70)
        .dimension(dimAcuity)
        .group(groupAcuity)
        .ordering(function(d) {
          return acuityRefObj[d.key];
        })
        .label(function(d) {
          return acuityRefObj[d.key];
        })
        .title(function(d) {
          return [acuityRefObj[d.key], formatNumber(d.value)].join(": ");
        })
        // .ordinalColors(d3.schemeSpectral[6])
        .ordinalColors([
          colourUnknown,
          "#fc8d59",
          "#fee08b",
          "#e6f598",
          "#99d594",
          "#3288bd"
        ])
        .drawPaths(false)
        .turnOnControls(true)
        .controlsUseVisibility(true)
        .render();
  
      const dimComplaint = cf.dimension(function(d) {
          return d.Complaint;
        }),
        groupComplaint = dimComplaint.group();
  
      chtComplaint
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(100)
        .dimension(dimComplaint)
        .group(groupComplaint)
        // https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
        //.ordering(function (d) { return d.value; })
        // .legend(dc.legend())
        .title(function(d) {
          // console.log(+chtDr.path.join(''));
          return [
            map_complaint_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .label(function(d) {
          return map_complaint_groups.get(+d.path.join(""))[0];
        })
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_complaint_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      const dimDrugAlcohol = cf.dimension(function(d) {
          return d.injdrug;
        }),
        groupDrugAlcohol = dimDrugAlcohol.group();
  
      chtDrugAlcohol
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(100)
        .dimension(dimDrugAlcohol)
        .group(groupDrugAlcohol)
        // https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
        //.ordering(function (d) { return d.value; })
        // .legend(dc.legend())
        .title(function(d) {
          return [
            map_injdrug_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .label(function(d) {
          return map_injdrug_groups.get(+d.path.join(""))[0];
        })
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_injdrug_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      document.getElementById("bl-secdiag").style.display = "none";
      document.getElementById("secdiag").style.visibility = "visible";
  
      // Patient Characteristics
  
      const dimAgeBand = cf.dimension(function(d) {
          return d[sqlCols.ageBand];
        }),
        groupAgeBand = dimAgeBand.group();
  
      chtAgeBand
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightTall)
        // .margins({ top: 10, right: 50, bottom: 30, left: 40 })
        .dimension(dimAgeBand)
        .group(groupAgeBand)
        .ordering(function(d) {
          return -d.key; // arrAgeBand.length - arrAgeBand.indexOf(d.key)
        }) // how to sort this?
        .label(function(d) {
          return [arrAgeBand[d.key], formatNumber(+d.value)].join(": ");
        })
        .title(function(d) {
          return [arrAgeBand[d.key], formatNumber(+d.value)].join(": ");
        })
        .elasticX(true)
        // .colorAccessor(function(d, i){return d.value;})
        .ordinalColors(d3SchemeCategory20b)
        .turnOnControls(true)
        .controlsUseVisibility(true)
        .render();
  
      const dimGPPractice = cf.dimension(function(d) {
          return d[sqlCols.practice];
        }),
        groupGPPractice = dimGPPractice.group();
  
      dropGPPractice
        .useViewBoxResizing(true)
        .width(chtWidthWide)
        .height(chtHeightStd)
        .dimension(dimGPPractice)
        .group(groupGPPractice) //dimGPPractice.group()
        .multiple(true)
        .numberVisible(18)
        .turnOnControls()
        .controlsUseVisibility(true)
        .promptText("Select All")
        .order(function(a, b) {
          return b.value > a.value ? 1 : a.value > b.value ? -1 : 0;
        })
        .title(function(d) {
          if (+d.key !== 0) {
            const pCode = practiceArr[d.key - 1],
              pDetails = practiceObj[pCode];
  
            return [pCode, pDetails[1], pDetails[2], formatNumber(d.value)].join(
              ": "
            );
          } else {
            return "Other: " + formatNumber(d.value);
          }
        })
        .render();
  
      const dimEDFD = cf.dimension(function(d) {
          return d[sqlCols.commSerial];
        }),
        groupEDFD = dimEDFD.group(); // shouldn't be needed with below
  
      cBoxEDFD
        .useViewBoxResizing(true)
        .dimension(dimEDFD)
        .group(groupEDFD)
        .multiple(true)
        //.numberVisible(3)
        .promptText("Select All")
        .order(function(a, b) {
          return b.value > a.value ? 1 : a.value > b.value ? -1 : 0;
        })
        .title(function(d) {
          if (d.key === 0) {
            return ["Not Streamed: ", formatNumber(d.value)].join("");
          } else {
            return ["EDFD: ", formatNumber(d.value)].join("");
          }
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      document.getElementById("bl-secpatient").style.display = "none";
      document.getElementById("secpatient").style.visibility = "visible";
  
      const dimDischDest = cf.dimension(function(d) {
          return d.dischDest;
        }),
        groupDischDest = dimDischDest.group();
  
      chtDischDest
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(100)
        .dimension(dimDischDest)
        .group(groupDischDest)
        // https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
        //.ordering(function (d) { return d.value; })
        // .legend(dc.legend())
        .title(function(d) {
          return [
            map_dischdest_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .label(function(d) {
          return map_dischdest_groups.get(+d.path.join(""))[0];
        })
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_dischdest_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      const dimDischStatus = cf.dimension(function(d) {
          return d.dischStatus;
        }),
        groupDischStatus = dimDischStatus.group();
  
      chtDischStatus
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(100)
        .dimension(dimDischStatus)
        .group(groupDischStatus)
        // https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
        //.ordering(function (d) { return d.value; })
        // .legend(dc.legend())
        .title(function(d) {
          return [
            map_dischstatus_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .label(function(d) {
          return map_dischstatus_groups.get(+d.path.join(""))[0];
        })
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_dischstatus_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      const dimDischFUP = cf.dimension(function(d) {
          return d.dischFUP;
        }),
        groupDischFUP = dimDischFUP.group();
  
      chtDischFUP
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightStd)
        .innerRadius(100)
        .dimension(dimDischFUP)
        .group(groupDischFUP)
        // https://stackoverflow.com/questions/50743024/dc-sunburst-ordering-pie-slices
        //.ordering(function (d) { return d.value; })
        // .legend(dc.legend())
        .title(function(d) {
          return [
            map_dischfup_groups.get(+d.path.join(""))[0],
            formatNumber(d.value)
          ].join(": ");
        })
        .label(function(d) {
          return map_dischfup_groups.get(+d.path.join(""))[0];
        })
        .colorAccessor(function(d) {
          return +d.path.join("");
        })
        .colors(function(d) {
          return map_dischfup_groups.get(+d)[1];
        })
        .turnOnControls()
        .controlsUseVisibility(true)
        .render();
  
      const dimDuration = cf.dimension(function(d) {
          return d[sqlCols.duration]; // cut off at eg. 8 hours
        }),
        groupDuration = dimDuration.group();
  
      // consider turning this into a line chart (for speed)
      chtDuration
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightShort)
        .margins({
          top: 10,
          right: 20,
          bottom: 40,
          left: 40
        })
        .dimension(dimDuration)
        .group(groupDuration)
        .x(
          d3.scaleTime().domain([0, 1000 * 60 * 60 * 8])
          // .range([new Date(0), new Date(0).setHours(4, 15)]) // hours and minutes
        )
        .xUnits(d3.timeMinutes)
        .round(d3.timeMinute.every(5)) // chart shows each minute but brush will snap to nearest 5 mins
        .curve(d3.curveLinear)
        .renderArea(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .renderLabel(false)
        .brushOn(true)
        .xyTipsOn(true)
        //.renderDataPoints({fillOpacity: 0.8, strokeOpacity: 0.0, radius: 0.25})
        .elasticX(false) // have to turn this off to set domain
        .elasticY(true)
        .mouseZoomable(false)
        .title(function(d) {
          return [d.key, formatNumber(d.value)].join(": ");
        })
        .controlsUseVisibility(true)
        .turnOnControls(true)
        .xAxisPadding(0);
  
      chtDuration
        .xAxis()
        .tickFormat(function(d) {
          let date = new Date(d); // jsDayZero.setMilliseconds(d)
          return formatDuration(date);
        })
        .ticks(d3.timeMinute.every(30));
  
      chtDuration.filterPrinter(function(filters) {
        return (
          formatDuration(filters[0][0]) + " to " + formatDuration(filters[0][1])
        );
      });
  
      // rotate x-axis 90 degrees - need to adjust x/y to align appropriately
      chtDuration.on("renderlet.a", function(chart) {
        chart
          .selectAll("g.x text")
          .attr("dx", "-20")
          .attr("dy", "-5")
          .attr("transform", "rotate(-90)");
      });
  
      chtDuration.render();
  
      document.getElementById("bl-secdisch").style.display = "none";
      document.getElementById("secdisch").style.visibility = "visible";
  
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Using_map_to_reformat_objects_in_an_array
      // from an array of objects, return the object values as an array
      // https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array
      // test = groupDaily.all().map(a => a.value);
      // https://stackoverflow.com/questions/42109965/crossfilter-double-grouping-where-key-is-the-value-of-another-reduction
  
      // The array here needs to be an int rather than a time
      let groupArrayDuration = dimWeekdayNo.group().reduce(
        function(p, v) {
          p.push(v[sqlCols.duration]);
          return p;
        },
        function(p, v) {
          p.splice(p.indexOf(v[sqlCols.duration]), 1);
          return p;
        },
        function() {
          return [];
        }
      );
  
      // .yAxisPadding(10) // // padding is added to top and bottom (for y-axis, left and right for x)
      // the below removes the impact of the paddings at the bottom
      // .yAxisMin = function () { return 0; }
      // temporary to consider
      boxPlotDuration
        .useViewBoxResizing(true)
        .width(chtWidthStd)
        .height(chtHeightShort)
        .margins({
          top: 0,
          right: 20,
          bottom: 30,
          left: 40
        })
        .dimension(dimWeekdayNo)
        .group(groupArrayDuration) // pass in an array here
        // .renderDataPoints(false)
        .showOutliers(false) //, if true, adds around a second to processing time
        .yAxisLabel("Duration (hrs:mins)")
        // .xAxisLabel("Weekday")
        // the below is to format the displayed values
        .tickFormat(function(d) {
          const date = new Date(d);
          return formatDuration(date);
        })
        .elasticX(true)
        .elasticY(true)
        //.yAxisMax = function() {
        //	return 1000 * 60 * 60 * 8;
        //}
        .turnOnControls()
        .controlsUseVisibility(true);
  
      // https://github.com/d3/d3-axis
  
      boxPlotDuration.xAxis().tickFormat(function(d) {
        return arrWeekDays[d];
      });
  
      const arrTicks = [],
        ticks = 48,
        int = 1000 * 60 * 30; // tick marks every 30 mins
      for (let i = 0; i <= ticks; i++) {
        arrTicks.push(i * int);
      }
  
      boxPlotDuration
        .yAxis()
        .tickFormat(function(d) {
          let date = new Date(d);
          return formatDuration(date);
        })
        // rather than arrTicks, can we use time.every 15 mins? didn't previously work but does mins have to be 1000 * 60 * eg. 30mins
        // .ticks(d3.timeMinute.every(30)) // can't get this to work
        // .tickArguments([d3.timeMinute.every(30)])
        .tickValues(arrTicks);
  
      boxPlotDuration.render();
  
      boxPlotDuration.filterPrinter(function(filters) {
        return filters
          .sort()
          .map(function(f) {
            return arrWeekDays[f];
          })
          .join(", ");
      });
  
      const dimLSOA = cf.dimension(function(d) {
          return d[sqlCols.lsoa];
        }),
        groupLSOA = dimLSOA.group();
  
      d3.json("../Data/geo/lsoas_simple50.geojson").then(function(lsoasJson) {
        // https://github.com/dc-js/dc.leaflet.js
        // note issue with pop ups described here:
        //     https://github.com/dc-js/dc.leaflet.js/issues/22
        // http://bl.ocks.org/KatiRG/cccd23dd7a830da0de5c
        // https://leafletjs.com/examples/choropleth/
  
        // Dynamic Colour Domain
        // https://groups.google.com/forum/#!topic/dc-js-user-group/6_EzrHSRQ30
  
        mapLSOA.on("preRender", function(chart) {
          chart.colorDomain(
            d3.extent(chart.group().all(), chart.valueAccessor())
          );
        });
        mapLSOA.on("preRedraw", function(chart) {
          chart.colorDomain(
            d3.extent(chart.group().all(), chart.valueAccessor())
          );
        });
  
        mapLSOA
          .useViewBoxResizing(true)
          .width(chtWidthWide)
          .height(chtHeightStd)
          .dimension(dimLSOA)
          .group(groupLSOA)
          // .colorCalculator(function (d) { return d ? mapLSOA.colors()(d) : '#ccc'; })
          .colors(d3.scaleQuantize().range(d3.schemeYlOrRd[7]))
          .colorDomain([
            d3.min(groupLSOA.all(), dc.pluck("value")),
            d3.max(groupLSOA.all(), dc.pluck("value"))
          ])
          .colorAccessor(function(d) {
            return d.value;
          })
          //.map() //not sure what this does...
          // .brushOn(true) // default = true
          .mapOptions(
            // https://leafletjs.com/reference-1.3.4.html#map-option
            {
              // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
              center: [53.96838, -1.08269], // centre on York Hospital
              zoom: 9,
              minZoom: 6, // how far out eg. 0 = whole world
              maxZoom: 14, // how far in, eg. to the detail (max = 18)
              // https://leafletjs.com/reference-1.3.4.html#latlngbounds
              maxBounds: [
                [50.0, 1.6232], //south west
                [59.79, -10.239] //north east
              ]
            }
          )
          .geojson(lsoasJson)
          // .title(function(d) {
          //   return ["lsoa: " + d.key,
          //           "Value: " + formatNumber(d.value)
          // ].join("\n");
          // })
          .featureKeyAccessor(function(feature) {
            return feature.properties.lsoa11cd;
          })
          .featureOptions({
            // formatting of feature layer
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7
          })
          // Issue with popups described here: https://github.com/dc-js/dc.js/issues/608
          // With brushOn set to false, pop up appears on click but filter will not apply
          // With brushOn set to true (default), pop up will not appear but filter works
          .brushOn(true)
          .renderPopup(true)
          .popup(function(d, feature) {
            return feature.properties.lsoa11cd + ": " + d.value;
          })
          .legend(dc_leaflet.legend().position("bottomright"))
          .turnOnControls()
          .controlsUseVisibility(true)
          .render();
      });
  
      document.getElementById("bl-sectest").style.display = "none";
      document.getElementById("sectest").style.visibility = "visible";
  
      // dc.renderAll();
      // heatKey();
  
      // to load with filters already displayed,this needs to go below the render
      // look into whether best to renderAll or separately...
      //seriesPeriod
      // .filter([minDate.setHours(minDate.getHours() +1), maxDate]);
      //.filter(dc.filters.RangedFilter(minDate, maxDate));
  
      // bouncing-loader
      // https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
      // document.getElementsByClassName(
      //   "bouncing-loader"
      // )[0].style.display = "none";
  
      // https://medium.com/@jsdevray/5-ways-to-loop-over-dom-elements-from-queryselectorall-in-javascript-55bd66ca4128
      // Below returns HTMLColection - difficult to work with...
      //let dcCharts = document.getElementsByClassName('dcCharts'); // document.getElementById('article-right').getElementsByClassName('dcCharts')
      //
  
      //for (let i = 0; i < dcCharts.length; i++) {
      //   dcCharts[i].style.display = "block";
      //
  
      // Returns a static NodeList that can be iterated over directly
      // https://developer.mozilla.org/en-US/docs/Web/API/NodeList
      // https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/querySelectorAll
      // let dcCharts = document.querySelectorAll('.dcCharts');
      // dcCharts.forEach(dcChart => {
      //     dcChart.style.display = "block";
      // });
  
      // initially hidden whilst loading, then set to block to display
      // document.querySelectorAll(".dcCharts").forEach(dcChart => {
      //   dcChart.style.display = "block";
      // });
  
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
  
      /* Testing - update the heatmapKey after applying a filter to any chart
                      // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
                                          dc.chartRegistry.list().forEach(function (chart) {
                                              chart.on('filtered', function () {
                                                  // your event listener code goes here.
                                                  // All this code appears to run twice...
                                                  heatKey();
                                              });
                                          });
                      */
  
      // End Timing
      console.timeEnd("ProcessTime");
    }
  });


  
function heatKey(noCells) {
  //console.trace();
  //debugger;
  // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
  const margin = {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    },
    width = 200 - margin.left - margin.right,
    height = 20 - margin.top - margin.bottom;
  let arrCells = [];

  // from a number between 0 and 1, return a colour from the colour scale
  const sequentialScale = d3
    .scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateOrRd);

  // this sorts the day time in dscending order
  const heatmapGroup = groupTimeofDay.top(groupTimeofDay.size()); // 24 hours by 7 days = 168 - this returns an array of all records, # sorted descending #

  // Returns the top record
  let heatmapTDmax = heatmapGroup[0];
  console.log(heatmapTDmax); // returns the object only {key: [hour, day], value: x}
  // console.log(heatmapTDmax.key); // to extract the key only, [hour, day]
  // console.log(heatmapTDmax.value); // to extract the value only, x

  // Using the below to return the last record
  let heatmapTDmin = heatmapGroup[groupTimeofDay.size() - 1]; // +Object.keys(heatmapGroup).length;
  console.log(heatmapTDmin);

  let heatmapTDRange = heatmapTDmax.value - heatmapTDmin.value;
  // from a number between 0 and 1, returns a value between the min and max values
  const heatmapTDScale = d3.interpolateRound(
    heatmapTDmin.value,
    heatmapTDmax.value
  );

  if (noCells === undefined) {
    // console.log(heatmapTDRange)
    if (heatmapTDRange > 100) {
      noCells = 10;
    } else {
      noCells = 5;
    }
  }

  for (let i = 0; i < noCells; i++) {
    arrCells.push(i / (noCells - 1));
  }
  // console.log(arrCells);

  d3.select("#legend")
    .selectAll("svg")
    //.data(arrCells)
    //.exit()
    .remove();

  let svg = d3
    .select("#legend")
    .append("svg")
    // .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (60)); // height + margin.top + margin.bottom
    .attr("viewBox", "0 5 200 20"); // height + margin.top + margin.bottom

// update this to join transition (d3.v5 - see practice profile charts as example)
// https://stackoverflow.com/questions/52337854/interactive-update-does-not-work-in-heatmap
  let heatKeyCells = svg
    .selectAll("g")
    .data(arrCells)
    .enter()
    .append("g")
    .attr("transform", "translate(" + 5 + "," + 5 + ")"); // (height / 2)

  heatKeyCells
    .append("rect")
    .attr("x", function(d, i) {
      return i * 10;
    })
    .attr("class", "heatCell")
    .attr("y", 0)
    .attr("width", 9)
    .attr("height", 9)
    .style("fill", function(d) {
      return sequentialScale(d);
    });

  heatKeyCells
    .append("text")
    .text(function(d, i) {
      if (i % 2 === 0 || i === noCells - 1) {
        return heatmapTDScale(d);
      }
    })
    .attr("class", "heatLabel")
    .merge(heatKeyCells)
    .attr("x", function(d, i) {
      return i * 10;
    })
    .attr("dx", 5)
    .attr("y", 15)
    .attr("font-size", "0.15em")
    .attr("fill", "#009")
    .attr("text-anchor", "middle");

  // Insert text into html
  document.getElementById("heatDayMax").textContent =
    arrWeekDays[heatmapTDmax.key[1]];
  document.getElementById("heatTimeMax").textContent = formatHour12(
    new Date(0).setHours(heatmapTDmax.key[0])
  );

  document.getElementById("heatDayMin").textContent =
    arrWeekDays[heatmapTDmin.key[1]];
  document.getElementById("heatTimeMin").textContent = formatHour12(
    //new Date(1900, 0, 1, heatmapTDmin.key[0], 0, 0, 0)
    new Date(0).setHours(heatmapTDmin.key[0])
  );
  console.warn("Why do i run twice? Update to d3.v5 join transition");
}
