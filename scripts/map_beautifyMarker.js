// https://github.com/marslan390/BeautifyMarker

const objColours = {
  red: "#e41a1c",
  blue: "#377eb8",
  green: "#4daf4a",
  purple: "#984ea3",
  orange: "#ff7f00",
  yellow: "#ffff33",
  brown: "#a65628",
  pink: "#f781bf"
};

const leafRed = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.red,
    backgroundColor: 'white'
  }),
  leafBlue = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.blueull,
    backgroundColor: 'white'
  }),
  leafGreen = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.green,
    backgroundColor: 'white'
  }),
  leafPurple = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.purple,
    backgroundColor: 'white'
  }),
  leafOrange = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.orange,
    backgroundColor: 'white'
  }),
  leafYellow = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.yellow,
    backgroundColor: 'white'
  }),
  leafBrown = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.brown,
    backgroundColor: 'white'
  }),
  leafPink = L.BeautifyIcon.icon({
    iconShape: "marker",
    icon: null,
    borderColor: objColours.pink,
    backgroundColor: 'white'
  });

const arrIcons = [
  leafRed,
  leafBlue,
  leafGreen,
  leafPurple,
  leafOrange,
  leafYellow,
  leafBrown,
  leafPink
];
