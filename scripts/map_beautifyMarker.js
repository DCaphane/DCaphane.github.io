// https://github.com/marslan390/BeautifyMarker
// https://fontawesome.com/start
// https://fontawesome.com/license/free

// default settings
const objColours = { // add a transparent option
	red: ['rgba(228,26,28,1)', 'rgba(228,26,28,0.5)'],
	blue: ['rgba(55,126,184,1)', 'rgba(55,126,184,0.7)'],
	green: ['rgba(77,175,74,1)', 'rgba(77,175,74,0.5)'],
	purple: ['rgba(152,78,163,1)','rgba(152,78,163,0.5)'],
	orange: ['rgba(255,127,0,1)', 'rgba(255,127,0,0.5)'],
	yellow: ['rgba(255,255,51,1)', 'rgba(255,255,51,0.5)'],
	brown: ['rgba(166,86,40,1)', 'rgba(166,86,40,0.5)'],
	pink: ['rgba(247,129,191,1)', 'rgba(247,129,191,0.5)'],
	white: ['hsla(360, 100%, 100%, 1)', 'hsla(360, 100%, 100%, 0.8)']
};

const objMarkers = {
	// icon, size, anchor
	mapMarker: ['marker', [22, 22]],
	circleMarker: ['circle', [22, 22]],
	circleDotMarker: ['circle-dot', [22, 22]],
	rectangleMarker: ['rectangle', [22, 22]],
	rectangleDotMarker: ['rectangle-dot', [22, 22]],
	doughnutMarker: ['doughnut', [22, 22]]
};

// map marker style
const markerRed = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle', // 'user-md',
		borderColor: objColours.red[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.red[1] // Text color of marker icon
	}),
	markerBlue = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
		borderColor: objColours.blue[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.blue[1]
	}),
	markerGreen = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
		borderColor: objColours.green[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.green[1]
	}),
	markerPurple = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
		borderColor: objColours.purple[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.purple[1]
	}),
	markerOrange = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
		borderColor: objColours.orange[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.orange[1]
	}),
	markerYellow = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
		borderColor: objColours.yellow[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.yellow[1]
	}),
	markerBrown = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
		borderColor: objColours.brown[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.brown[1]
	}),
	markerPink = L.BeautifyIcon.icon({
		iconShape: objMarkers.mapMarker[0],
		icon: 'circle',
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


// map marker style
const circleRed = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle', // 'user-md',
		borderColor: objColours.red[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.red[1] // Text color of marker icon
	}),
	circleBlue = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
		borderColor: objColours.blue[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.blue[1]
	}),
	circleGreen = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
		borderColor: objColours.green[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.green[1]
	}),
	circlePurple = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
		borderColor: objColours.purple[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.purple[1]
	}),
	circleOrange = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
		borderColor: objColours.orange[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.orange[1]
	}),
	circleYellow = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
		borderColor: objColours.yellow[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.yellow[1]
	}),
	circleBrown = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
		borderColor: objColours.brown[0],
		backgroundColor: objColours.white[0],
		textColor: objColours.brown[1]
	}),
	circlePink = L.BeautifyIcon.icon({
		iconShape: objMarkers.circleMarker[0],
		icon: 'circle',
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
