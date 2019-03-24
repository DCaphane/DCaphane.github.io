// https://github.com/marslan390/BeautifyMarker
// https://fontawesome.com/start
// https://fontawesome.com/license/free

// default settings
const objColours = {
  // add a transparent option
  red: ["rgba(228,26,28,1)", "rgba(228,26,28,0.5)"],
  blue: ["rgba(55,126,184,1)", "rgba(55,126,184,0.7)"],
  green: ["rgba(77,175,74,1)", "rgba(77,175,74,0.5)"],
  purple: ["rgba(152,78,163,1)", "rgba(152,78,163,0.5)"],
  orange: ["rgba(255,127,0,1)", "rgba(255,127,0,0.5)"],
  yellow: ["rgba(255,255,51,1)", "rgba(255,255,51,0.5)"],
  brown: ["rgba(166,86,40,1)", "rgba(166,86,40,0.5)"],
  pink: ["rgba(247,129,191,1)", "rgba(247,129,191,0.5)"],
  white: ["hsla(360, 100%, 100%, 1)", "hsla(360, 100%, 100%, 0.8)"]
};

const objMarkers = {
  // icon, size, anchor
  mapMarker: ["marker", [22, 22]],
  circleMarker: ["circle", [22, 22]],
  circleDotMarker: ["circle-dot", [22, 22]],
  rectangleMarker: ["rectangle", [22, 22]], // pop up errors with rectangle marker?
  rectangleDotMarker: ["rectangle-dot", [22, 22]],
  doughnutMarker: ["doughnut", [22, 22]]
};

// map marker style - map marker
const markerRed = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle", // 'user-md',
    borderColor: objColours.red[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.red[1] // Text color of marker icon
  }),
  markerBlue = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.blue[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.blue[1]
  }),
  markerGreen = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.green[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.green[1]
  }),
  markerPurple = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.purple[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.purple[1]
  }),
  markerOrange = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.orange[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.orange[1]
  }),
  markerYellow = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.yellow[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.yellow[1]
  }),
  markerBrown = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.brown[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.brown[1]
  }),
  markerPink = L.BeautifyIcon.icon({
    iconShape: objMarkers.mapMarker[0],
    icon: "circle",
    borderColor: objColours.pink[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.pink[1]
  });

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
const circleRed = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle", // 'user-md',
    borderColor: objColours.red[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.red[1] // Text color of marker icon
  }),
  circleBlue = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.blue[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.blue[1]
  }),
  circleGreen = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.green[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.green[1]
  }),
  circlePurple = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.purple[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.purple[1]
  }),
  circleOrange = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.orange[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.orange[1]
  }),
  circleYellow = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.yellow[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.yellow[1]
  }),
  circleBrown = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.brown[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.brown[1]
  }),
  circlePink = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleMarker[0],
    icon: "circle",
    borderColor: objColours.pink[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.pink[1]
  });

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
const doughnutRed = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.red[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.red[1] // Text color of marker icon
  }),
  doughnutBlue = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.blue[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.blue[1]
  }),
  doughnutGreen = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.green[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.green[1]
  }),
  doughnutPurple = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.purple[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.purple[1]
  }),
  doughnutOrange = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.orange[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.orange[1]
  }),
  doughnutYellow = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.yellow[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.yellow[1]
  }),
  doughnutBrown = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.brown[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.brown[1]
  }),
  doughnutPink = L.BeautifyIcon.icon({
    iconShape: objMarkers.doughnutMarker[0],
    icon: "square",
    borderColor: objColours.pink[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.pink[1]
  });

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
const circleDotRed = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.red[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.red[1] // Text color of marker icon
  }),
  circleDotBlue = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.blue[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.blue[1]
  }),
  circleDotGreen = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.green[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.green[1]
  }),
  circleDotPurple = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.purple[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.purple[1]
  }),
  circleDotOrange = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.orange[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.orange[1]
  }),
  circleDotYellow = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.yellow[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.yellow[1]
  }),
  circleDotBrown = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.brown[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.brown[1]
  }),
  circleDotPink = L.BeautifyIcon.icon({
    iconShape: objMarkers.circleDotMarker[0],
    icon: "square",
    borderColor: objColours.pink[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.pink[1]
  });

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

// map marker style - rectangle
const rectangleRed = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.red[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.red[1] // Text color of marker icon
  }),
  rectangleBlue = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.blue[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.blue[1]
  }),
  rectangleGreen = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.green[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.green[1]
  }),
  rectanglePurple = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.purple[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.purple[1]
  }),
  rectangleOrange = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.orange[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.orange[1]
  }),
  rectangleYellow = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.yellow[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.yellow[1]
  }),
  rectangleBrown = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.brown[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.brown[1]
  }),
  rectanglePink = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleMarker[0],
    icon: "square",
    borderColor: objColours.pink[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.pink[1]
  });

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
const rectangleDotRed = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.red[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.red[1] // Text color of marker icon
  }),
  rectangleDotBlue = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.blue[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.blue[1]
  }),
  rectangleDotGreen = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.green[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.green[1]
  }),
  rectangleDotPurple = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.purple[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.purple[1]
  }),
  rectangleDotOrange = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.orange[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.orange[1]
  }),
  rectangleDotYellow = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.yellow[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.yellow[1]
  }),
  rectangleDotBrown = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.brown[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.brown[1]
  }),
  rectangleDotPink = L.BeautifyIcon.icon({
    iconShape: objMarkers.rectangleDotMarker[0],
    icon: "square",
    borderColor: objColours.pink[0],
    backgroundColor: objColours.white[0],
    textColor: objColours.pink[1]
  });

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
