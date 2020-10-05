/*
 https://github.com/marslan390/BeautifyMarker
 https://fontawesome.com/start
 https://fontawesome.com/license/free

 animation: https://l-lin.github.io/font-awesome-animation/
*/

// default settings
// https://stackoverflow.com/questions/21341274/leaflet-js-api-icons-why-do-iconanchor-and-popupanchor-have-different-coordinat
const defaultOptions = {
  backgroundColor: "hsla(360, 100%, 100%, 1)",
  popupAnchor: [14, 0], // point from which the popup should open relative to the iconAnchor
  iconSize: [28, 28],
  iconAnchor: [14, 14], // point of the icon which will correspond to marker's location
  innerIconAnchor: [-2, 5],
  isAlphaNumericIcon: true, // enables text, set below
  text: "test",
  borderColor: null,
  textColor: null
};

// const markerDefault = Object.create(defaultOptions);
// markerDefault.iconShape = "marker";
// markerDefault.icon = "circle";
// markerDefault.isAlphaNumericIcon = false;

// Marker Shapes
const markerDefault = {
  iconShape: "marker",
  icon: "circle",
  iconAnchor: [14, 28],
  isAlphaNumericIcon: false
};

const circleDefault = {
  iconShape: "circle",
  icon: "circle",
};

const doughnutDefault = {
  iconShape: "doughnut",
  icon: "circle",
  isAlphaNumericIcon: false,
  borderWidth: 5
};

const circleDotDefault = {
  iconShape: "circle-dot",
  icon: "square"
};

const rectangleDefault = {
  iconShape: "rectangle",
  icon: "square"
};

const rectangleDotDefault = {
  iconShape: "rectangle-dot",
  icon: "square"
};

const highlightDefault = {
  iconShape: "doughnut",
  icon: "circle",
  isAlphaNumericIcon: false,
  borderWidth: 5,
  backgroundColor: "hsla(360, 100%, 100%, 0)", // transparent
  iconSize: [46, 46],
  iconAnchor: [23, 30],
  customClasses: "faa-flash animated faa-fast" // flash is only one that works, can add faa-fast or faa-slow to control speed
};

// Colours
const defaultRed = {
  borderColor: "rgba(228,26,28,1)",
  textColor: "rgba(228,26,28,0.5)"
};

const defaultBlue = {
  borderColor: "rgba(55,126,184,1)",
  textColor: "rgba(55,126,184,0.7)"
};

const defaultGreen = {
  borderColor: "rgba(77,175,74,1)",
  textColor: "rgba(77,175,74,0.5)"
};

const defaultPurple = {
  borderColor: "rgba(152,78,163,1)",
  textColor: "rgba(152,78,163,0.5)"
};

const defaultOrange = {
  borderColor: "rgba(255,127,0,1)",
  textColor: "rgba(255,127,0,0.5)"
};

const defaultYellow = {
  borderColor: "rgba(255,255,51,1)",
  textColor: "rgba(255,255,51,0.5)"
};

const defaultBrown = {
  borderColor: "rgba(166,86,40,1)",
  textColor: "rgba(166,86,40,0.8)"
};

const defaultPink = {
  borderColor: "rgba(247,129,191,1)",
  textColor: "rgba(247,129,191,0.8)"
};

const defaultWhite = {
  borderColor: "hsla(360, 100%, 100%, 1)",
  textColor: "hsla(360, 100%, 100%, 0.8)"
};

// default map marker style - map marker
const markerRedOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultRed
);
const markerRed = L.BeautifyIcon.icon(markerRedOpt);

const markerBlueOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultBlue
);
const markerBlue = L.BeautifyIcon.icon(markerBlueOpt);

const markerGreenOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultGreen
);
const markerGreen = L.BeautifyIcon.icon(markerGreenOpt);

const markerPurpleOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultPurple
);
const markerPurple = L.BeautifyIcon.icon(markerPurpleOpt);

const markerOrangeOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultOrange
);
const markerOrange = L.BeautifyIcon.icon(markerOrangeOpt);

const markerYellowOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultYellow
);
const markerYellow = L.BeautifyIcon.icon(markerYellowOpt);

const markerBrownOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultBrown
);
const markerBrown = L.BeautifyIcon.icon(markerBrownOpt);

const markerPinkOpt = Object.assign(
  {},
  defaultOptions,
  markerDefault,
  defaultPink
);
const markerPink = L.BeautifyIcon.icon(markerPinkOpt);

const arrMarkerIcons = [
  markerRed,
  markerBlue,
  markerGreen,
  markerPurple,
  markerOrange,
  markerYellow,
  markerBrown,
  markerPink
];

// map marker style - circle

const circleRedOpt = Object.assign(
  {}, // initialise empty array
  defaultOptions, // other settings eg. size, anchor
  circleDefault, // shape
  defaultRed // colour
);
const circleRed = L.BeautifyIcon.icon(circleRedOpt);

const circleBlueOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultBlue
);
const circleBlue = L.BeautifyIcon.icon(circleBlueOpt);

const circleGreenOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultGreen
);
const circleGreen = L.BeautifyIcon.icon(circleGreenOpt);

const circlePurpleOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultPurple
);
const circlePurple = L.BeautifyIcon.icon(circlePurpleOpt);

const circleOrangeOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultOrange
);
const circleOrange = L.BeautifyIcon.icon(circleOrangeOpt);

const circleYellowOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultYellow
);
const circleYellow = L.BeautifyIcon.icon(circleYellowOpt);

const circleBrownOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultBrown
);
const circleBrown = L.BeautifyIcon.icon(circleBrownOpt);

const circlePinkOpt = Object.assign(
  {},
  defaultOptions,
  circleDefault,
  defaultPink
);
const circlePink = L.BeautifyIcon.icon(circlePinkOpt);

const arrCircleIcons = [
  circleRed,
  circleBlue,
  circleGreen,
  circlePurple,
  circleOrange,
  circleYellow,
  circleBrown,
  circlePink
];

// map marker style - doughnut
const doughnutRedOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultRed
);
const doughnutRed = L.BeautifyIcon.icon(doughnutRedOpt);

const doughnutBlueOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultBlue
);
const doughnutBlue = L.BeautifyIcon.icon(doughnutBlueOpt);

const doughnutGreenOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultGreen
);
const doughnutGreen = L.BeautifyIcon.icon(doughnutGreenOpt);

const doughnutPurpleOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultPurple
);
const doughnutPurple = L.BeautifyIcon.icon(doughnutPurpleOpt);

const doughnutOrangeOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultOrange
);
const doughnutOrange = L.BeautifyIcon.icon(doughnutOrangeOpt);

const doughnutYellowOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultYellow
);
const doughnutYellow = L.BeautifyIcon.icon(doughnutYellowOpt);

const doughnutBrownOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultBrown
);
const doughnutBrown = L.BeautifyIcon.icon(doughnutBrownOpt);

const doughnutPinkOpt = Object.assign(
  {},
  defaultOptions,
  doughnutDefault,
  defaultPink
);
const doughnutPink = L.BeautifyIcon.icon(doughnutPinkOpt);

const arrDoughnutIcons = [
  doughnutRed,
  doughnutBlue,
  doughnutGreen,
  doughnutPurple,
  doughnutOrange,
  doughnutYellow,
  doughnutBrown,
  doughnutPink
];

// map marker style - circleDot
const circleDotRedOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultRed
);
const circleDotRed = L.BeautifyIcon.icon(circleDotRedOpt);

const circleDotBlueOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultBlue
);
const circleDotBlue = L.BeautifyIcon.icon(circleDotBlueOpt);

const circleDotGreenOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultGreen
);
const circleDotGreen = L.BeautifyIcon.icon(circleDotGreenOpt);

const circleDotPurpleOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultPurple
);
const circleDotPurple = L.BeautifyIcon.icon(circleDotPurpleOpt);

const circleDotOrangeOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultOrange
);
const circleDotOrange = L.BeautifyIcon.icon(circleDotOrangeOpt);

const circleDotYellowOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultYellow
);
const circleDotYellow = L.BeautifyIcon.icon(circleDotYellowOpt);

const circleDotBrownOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultBrown
);
const circleDotBrown = L.BeautifyIcon.icon(circleDotBrownOpt);

const circleDotPinkOpt = Object.assign(
  {},
  defaultOptions,
  circleDotDefault,
  defaultPink
);
const circleDotPink = L.BeautifyIcon.icon(circleDotPinkOpt);

const arrCircleDotIcons = [
  circleDotRed,
  circleDotBlue,
  circleDotGreen,
  circleDotPurple,
  circleDotOrange,
  circleDotYellow,
  circleDotBrown,
  circleDotPink
];

// Rectangle Marker
const rectangleRedOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultRed
);
const rectangleRed = L.BeautifyIcon.icon(rectangleRedOpt);

const rectangleBlueOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultBlue
);
const rectangleBlue = L.BeautifyIcon.icon(rectangleBlueOpt);

const rectangleGreenOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultGreen
);
const rectangleGreen = L.BeautifyIcon.icon(rectangleGreenOpt);

const rectanglePurpleOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultPurple
);
const rectanglePurple = L.BeautifyIcon.icon(rectanglePurpleOpt);

const rectangleOrangeOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultOrange
);
const rectangleOrange = L.BeautifyIcon.icon(rectangleOrangeOpt);

const rectangleYellowOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultYellow
);
const rectangleYellow = L.BeautifyIcon.icon(rectangleYellowOpt);

const rectangleBrownOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultBrown
);
const rectangleBrown = L.BeautifyIcon.icon(rectangleBrownOpt);

const rectanglePinkOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDefault,
  defaultPink
);
const rectanglePink = L.BeautifyIcon.icon(rectanglePinkOpt);

const arrRectangleIcons = [
  rectangleRed,
  rectangleBlue,
  rectangleGreen,
  rectanglePurple,
  rectangleOrange,
  rectangleYellow,
  rectangleBrown,
  rectanglePink
];

// map marker style - rectangleDot
const rectangleDotRedOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultRed
);
const rectangleDotRed = L.BeautifyIcon.icon(rectangleDotRedOpt);

const rectangleDotBlueOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultBlue
);
const rectangleDotBlue = L.BeautifyIcon.icon(rectangleDotBlueOpt);

const rectangleDotGreenOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultGreen
);
const rectangleDotGreen = L.BeautifyIcon.icon(rectangleDotGreenOpt);

const rectangleDotPurpleOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultPurple
);
const rectangleDotPurple = L.BeautifyIcon.icon(rectangleDotPurpleOpt);

const rectangleDotOrangeOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultOrange
);
const rectangleDotOrange = L.BeautifyIcon.icon(rectangleDotOrangeOpt);

const rectangleDotYellowOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultYellow
);
const rectangleDotYellow = L.BeautifyIcon.icon(rectangleDotYellowOpt);

const rectangleDotBrownOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultBrown
);
const rectangleDotBrown = L.BeautifyIcon.icon(rectangleDotBrownOpt);

const rectangleDotPinkOpt = Object.assign(
  {},
  defaultOptions,
  rectangleDotDefault,
  defaultPink
);
const rectangleDotPink = L.BeautifyIcon.icon(rectangleDotPinkOpt);

const arrRectangleDotIcons = [
  rectangleDotRed,
  rectangleDotBlue,
  rectangleDotGreen,
  rectangleDotPurple,
  rectangleDotOrange,
  rectangleDotYellow,
  rectangleDotBrown,
  rectangleDotPink
];

// map marker style - highlight
const highlightRedOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultRed
);
const highlightRed = L.BeautifyIcon.icon(highlightRedOpt);

const highlightBlueOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultBlue
);
const highlightBlue = L.BeautifyIcon.icon(highlightBlueOpt);

const highlightGreenOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultGreen
);
const highlightGreen = L.BeautifyIcon.icon(highlightGreenOpt);

const highlightPurpleOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultPurple
);
const highlightPurple = L.BeautifyIcon.icon(highlightPurpleOpt);

const highlightOrangeOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultOrange
);
const highlightOrange = L.BeautifyIcon.icon(highlightOrangeOpt);

const highlightYellowOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultYellow
);
const highlightYellow = L.BeautifyIcon.icon(highlightYellowOpt);

const highlightBrownOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultBrown
);
const highlightBrown = L.BeautifyIcon.icon(highlightBrownOpt);

const highlightPinkOpt = Object.assign(
  {},
  defaultOptions,
  highlightDefault,
  defaultPink
);
const highlightPink = L.BeautifyIcon.icon(highlightPinkOpt);

const arrHighlightIcons = [
  highlightRed,
  highlightBlue,
  highlightGreen,
  highlightPurple,
  highlightOrange,
  highlightYellow,
  highlightBrown,
  highlightPink
];
