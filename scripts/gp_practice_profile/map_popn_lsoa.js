// Open Street Map (osm)
// https://leaflet-extras.github.io/leaflet-providers/preview/

// Tile Baselayers (Backgrounds)

// Mapbox
/*
let tile_MB = L.tileLayer(
	'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
	{
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken:
			'addKeyHere'
	}
);
*/
const osm_bw2 = L.tileLayer(
    "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
    {
      minZoom: 0,
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  );

  const CartoDB_Voyager2 = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      minZoom: 0,
      maxZoom: 19
    }
  );

  // http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
  const Stamen_Toner2 = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      minZoom: 0,
      maxZoom: 20,
      ext: "png"
    }
  );

  // https://stackoverflow.com/questions/28094649/add-option-for-blank-tilelayer-in-leaflet-layergroup
  const emptyTile2 = L.tileLayer("", {
    zoom: 0,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const baseMaps2 = {
    "Black and White": osm_bw,
    Default: CartoDB_Voyager,
    Stamen_Toner: Stamen_Toner,
    "No Background": emptyTile
  };

  const mapPopn = L.map("mapPopnLSOA", {
    preferCanvas: true,
    // https://www.openstreetmap.org/#map=9/53.9684/-1.0827
    center: [53.9581, -1.0643], // centre on York Hospital
    zoom: 11,
    //
    minZoom: 6, // how far out eg. 0 = whole world
    maxZoom: 14, // how far in, eg. to the detail (max = 18)
    // https://leafletjs.com/reference-1.3.4.html#latlngbounds
    maxBounds: [
      [50.0, 1.6232], //south west
      [59.79, -10.239] //north east
    ],
    layers: Stamen_Toner, // default basemap that will appear first
    fullscreenControl: {
      // https://github.com/Leaflet/Leaflet.fullscreen
      pseudoFullscreen: true // if true, fullscreen to page width and height
    }
  });

  const layerControl2 = L.control.layers(baseMaps2, null, {
    collapsed: true, // Whether or not control options are displayed
    sortLayers: true
  });
  mapPopn.addControl(layerControl2);

  // Ward boundaries and ward groupings
  const subLayerControl2 = L.control.layers(null, null, {
    collapsed: true,
    sortLayers: true
  });
  mapPopn.addControl(subLayerControl2);

  const scaleBar2 = L.control.scale({
    // https://leafletjs.com/reference-1.4.0.html#control-scale-option
    position: "bottomleft",
    metric: true,
    imperial: true
  });
  scaleBar2.addTo(mapPopn);

  const sidebarPopn = sidebarLeft(mapPopn, "sidebar3");

  homeButton(mapPopn);
  yorkTrust(mapPopn);

  // Panes to control zIndex of geoJson layers
  mapPopn.createPane("wardBoundaryPane");
  mapPopn.getPane("wardBoundaryPane").style.zIndex = 375;

  mapPopn.createPane("ccg03QBoundaryPane");
  mapPopn.getPane("ccg03QBoundaryPane").style.zIndex = 374;

  // ccg boundary

ccgBoundary(mapPopn, subLayerControl2);
  // wardData(mapPopn, subLayerControl2);
  // addPracticeToMap(mapPopn, layerControl2);

  // const select = document.getElementById("selPractice");
  // select.addEventListener("change", function() {
  //   highlightFeature(select.value);
  // });

  // function highlightFeature(selPractice) {
  //   if (typeof highlightPractice !== "undefined") {
  //     mapPopn.removeLayer(highlightPractice);
  //   }

  //   highlightPractice = L.geoJSON(geoDataPractice, {
  //     pointToLayer: function(feature, latlng) {
  //       if (feature.properties.practice_code === selPractice) {
  //         return (markerLayer = L.marker(latlng, {
  //           icon: arrHighlightIcons[5],
  //           zIndexOffset: -5
  //         }));
  //       }
  //     }
  //   });

  //   mapPopn.addLayer(highlightPractice);
  // }
