const // parseDate = d3.utcParse('%Y-%m-%d %H:%M:%S.%L'), // import format, previously timeParse
  // https://github.com/d3/d3-time-format/blob/master/README.md#timeParse
  formatDaily = d3.timeFormat("%d-%b-%y"),
  formatPeriod = d3.timeFormat("%b-%y"),
  // formatMonth = d3.timeFormat('%b'), // %m - month as a decimal number [01,12]
  // formatMonthNo = d3.timeFormat('%m'),
  // formatWeekday = d3.timeFormat('%a'),
  // %w - Sunday-based weekday as a decimal number [0,6]
  formatWeekdayNo = d3.timeFormat("%u"), // %u - Monday-based (ISO 8601) weekday as a decimal number [1,7]
  // consider week number for weekly trends?
  // formatHour24 = d3.timeFormat('%H'), // %H - hour (24-hour clock)
  // formatTime = d3.timeFormat("%H:%M"),
  formatNumber = d3.format(",d"), // for display purposes
  formatDuration = d3.utcFormat("%H:%M");
// timeScaleDuration = d3
// 	.scaleTime()
// 	.domain([
// 		sqlDayZero,
// 		d3.timeDay.offset(sqlDayZero, 1)
// 	]) // d3.timeDay.ceil(sqlDayZero)
// 	.range([0, 60 * 24]);
// timeScaleDuration.invert(200) ie. 200 minutes = 3hrs and 20 mins
// Mon Jan 01 1900 03:20:00

const chtWidthStd = 400,
  chtHeightStd = 400,
  chtWidthWide = 500,
  chtHeightTall = 700,
  chtHeightShort = 250;

// Global Variables
const arrWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  arrMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  arrAgeBand = [
    "00-04",
    "05-09",
    "10-14",
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59",
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80-84",
    "85+"
  ];

// Colours

// https://dc-js.github.io/dc.js/docs/html/dc.config.html#defaultColors__anchor
// colour options: https://github.com/d3/d3-scale-chromatic
// examples: d3.schemeCategory20c, d3.schemeSet1, d3.schemeBlues[9], d3.schemeBrBG[7]
dc.config.defaultColors(d3.schemeSet2);

// d3.schemeCategory20b has been removed from D3v5
const d3SchemeCategory20b = [
  "#393b79",
  "#5254a3",
  "#6b6ecf",
  "#9c9ede",
  "#637939",
  "#8ca252",
  "#b5cf6b",
  "#cedb9c",
  "#8c6d31",
  "#bd9e39",
  "#e7ba52",
  "#e7cb94",
  "#843c39",
  "#ad494a",
  "#d6616b",
  "#e7969c",
  "#7b4173",
  "#a55194",
  "#ce6dbd",
  "#de9ed6"
];

// optional function to adjust hcl parameters
function saturate(colour, k = 1) {
  const { h, c, l } = d3.hcl(colour);
  return d3.hcl(h, c + 18 * k, l);
}

function sunburstColours(inColour) {
  // Base Colours (originally designed around diagnosis codes)
  // http://colorbrewer2.org/?type=sequential&scheme=BuPu&n=9#type=qualitative&scheme=Paired&n=12
  const mapColours = new Map([
    [11, "#a6cee3"],
    [21, "#1f78b4"],
    [31, "#b2df8a"],
    [35, "#ff0000"], // new
    [41, "#33a02c"],
    [51, "#fb9a99"],
    [55, "#00ff00"], // new
    [61, "#e31a1c"],
    [71, "#fdbf6f"],
    [75, "#0000ff"], // new
    [81, "#ff7f00"],
    [91, "#cab2d6"],
    [97, "#6a3d9a"],
    [99, "#ffff99"],
    [0, "#808080"], // unknown, grey
    [999, "#ffff00"] // old code, grey
  ]);

  // Sunburst Colours
  // http://bl.ocks.org/sathomas/4a3b74228d9cb11eb486
  let colour, // Main colour based on top layer key (eg. s1 = 11)
    startColour,
    endColour;

  const colours = d3
    .scaleLinear()
    .interpolate(d3.interpolateHcl)
    .domain([10, 90]);

  // Take the inputted string eg. 111213 and split in to an array every two characters ['11', '12', '13']
  const arr = String(inColour).match(/.{1,2}/g);

  // Base Colour
  colour = startColour = endColour = d3.hcl(mapColours.get(+arr[0])); // lightGreenFirstPalette[x]

  if (arr.length === 1) {
    return colour;
  } else {
    for (let i = 2; i <= arr.length; i++) {
      (startColour = startColour.darker()), (endColour = endColour.brighter());
    }

    colours.range([startColour, endColour]);
    return colours(arr[arr.length - 1]); //  the last item in the array
  }
}
