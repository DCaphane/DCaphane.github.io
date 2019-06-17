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

let selectedPracticeCompare = "None",
  selectedDate;
// selectedPractice

const parseDate = d3.timeParse("%b-%y"), // import format
  formatPeriod = d3.timeFormat("%b-%y"); // presentational format eg. Apr-16
//formatNumber = d3.format(",d");

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent

const practiceLookup = new Map([
  ["B81036", "Pocklington"],
  ["B82005", "Priory Medical Group"]
]);


// sort map by key: https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object
let uniquePracticesOrg = new Map(),
  uniquePractices;

// let uniqueAgeBandsOrg = new Map(),
//   uniqueAgeBands;


// Format the data as appropriate
var promise1 = d3
  .csv("data/GP_Practice_Populations.csv", function row(d) {
    // Loop through the raw data to:
    // i. identify unique practices
    let practiceItem = d.Practice_Mapped.substring(0, 6);
    if (!uniquePracticesOrg.has(practiceItem)) {
      uniquePracticesOrg.set(practiceItem, false);
    }

    // ii. unique age bands (is this used?)
    // let ageItem = d.Age_Band;
    // if (!uniqueAgeBandsOrg.has(ageItem)) {
    //   uniqueAgeBandsOrg.set(ageItem, false);
    // }

    // iii. format columns as appropriate
    return {
      Practice: practiceItem, // d.Practice_Mapped
      Locality: d.Locality,
      Age_Band: d.Age_Band,
      Period: parseDate(d.Period),
      Male_Pop: +d.Male,
      Female_Pop: +d.Female,
      Total_Pop: +d.Total
    };
  })
  .then(function(dataLevel_00) {
    // dataLevel_00 = data; // key fields from data, formatted by row() function
    // console.log(dataLevel_00)

    // List of practices (sorted A-Z) for use in drop down ------------------------
    uniquePractices = new Map([...uniquePracticesOrg.entries()].sort());
    uniquePracticesOrg.clear();

    // This is hard coded to order ages in correct order
    // uniqueAgeBands = new Map([...uniqueAgeBandsOrg.entries()].sort());


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
            return +d.Total_Pop;
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
      if (d.Period.getTime() === selectedDate.getTime()) {
        // comparing dates
        Array.prototype.push.apply(dataLevel_03, d.values);
        //dataLevel_03.push(d.values);
      }
    });
    // console.log(data_DemoInit)
    // console.log(selectedDate)
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

    return data_DemoInit;
  })
  .catch(function(error) {
    // handle loading error here
  });


  // Function to create Title Case
String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
