// Colour Testing
// https://bl.ocks.org/micahstubbs/7c025e79f256e9325002f89430c87ea9


const dark = [
  "#B08B12",
  "#BA5F06",
  "#8C3B00",
  "#6D191B",
  "#842854",
  "#5F7186",
  "#193556",
  "#137B80",
  "#144847",
  "#254E00"
];

const mid = [
  "#E3BA22",
  "#E58429",
  "#BD2D28",
  "#D15A86",
  "#8E6C8A",
  "#6B99A1",
  "#42A5B3",
  "#0F8C79",
  "#6BBBA1",
  "#5C8100"
];

const light = [
  "#F2DA57",
  "#F6B656",
  "#E25A42",
  "#DCBDCF",
  "#B396AD",
  "#B0CBDB",
  "#33B6D0",
  "#7ABFCC",
  "#C8D7A1",
  "#A0B700"
];

const palettes = [light, mid, dark];
const lightGreenFirstPalette = palettes
  .map(d => d.reverse())
  .reduce((a, b) => a.concat(b));
