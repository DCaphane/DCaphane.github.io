// https://github.com/marslan390/BeautifyMarker
// https://fontawesome.com/start

const objColours = {
	red: '#e41a1c',
	blue: '#377eb8',
	green: '#4daf4a',
	purple: '#984ea3',
	orange: '#ff7f00',
	yellow: '#ffff33',
	brown: '#a65628',
	pink: '#f781bf'
};

const markerRed = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: 'circle', // 'user-md',
		borderColor: objColours.red,
		backgroundColor: 'rgba(255,0,0,0.5)',
  textColor: 'rgba(255,0,0,0.5)' // Text color of marker icon
	}),
	markerBlue = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.blueull,
		backgroundColor: 'white'
	}),
	markerGreen = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.green,
		backgroundColor: 'white'
	}),
	markerPurple = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.purple,
		backgroundColor: 'white'
	}),
	markerOrange = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.orange,
		backgroundColor: 'white'
	}),
	markerYellow = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.yellow,
		backgroundColor: 'white'
	}),
	markerBrown = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.brown,
		backgroundColor: 'white'
	}),
	markerPink = L.BeautifyIcon.icon({
		iconShape: 'marker',
		icon: null,
		borderColor: objColours.pink,
		backgroundColor: 'white'
	});

const arrIcons = [
	markerRed,
	markerBlue,
	markerGreen,
	markerPurple,
	markerOrange,
	markerYellow,
	markerBrown,
	markerPink
];
