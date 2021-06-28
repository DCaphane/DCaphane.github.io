const chtWidthStd = 400,
  chtHeightStd = 400,
  chtWidthWide = 500,
  chtHeightTall = 700,
  chtHeightShort = 250;

const margin = {
  top: 50,
  right: 10,
  bottom: 150,
  left: 85,
};

// https://github.com/d3/d3-time-format
const parseDate = d3.timeParse("%b-%y"), // import format: mmm-yy
  parseDate2 = d3.timeParse("%d/%m/%Y"), // import format: dd/mm/yyyy
  formatPeriod = d3.timeFormat("%b-%y"), // presentational format eg. Apr-16
  formatNumber = d3.format(",d");

const formatPercent1dp = d3.format(".1%"), // for x-axis to reduce overlap - still testing
  formatPercent = d3.format(".0%"); // rounded percent
