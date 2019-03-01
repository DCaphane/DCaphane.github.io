// Various Markers

// https://leafletjs.com/reference-1.4.0.html#marker

// https://leafletjs.com/reference-1.0.0.html#icon

// https://github.com/pointhi/leaflet-color-markers/tree/master/img

var defaultIcon = L.Icon.extend({
    options: {
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      shadowSize: [41, 41],
      iconAnchor: [12, 41],
      shadowAnchor: [4, 41],
      popupAnchor: [1, -34]
    }
  });
  
  var greenIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
    }),
    blueIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
    }),
    redIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
    }),
    orangeIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
    }),
    yellowIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png"
    }),
    violetIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png"
    }),
    greyIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png"
    }),
    blackIcon = new defaultIcon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png"
    });
  
  const arrIcons = [greenIcon, blueIcon, redIcon, orangeIcon, yellowIcon, violetIcon, greyIcon, blackIcon];