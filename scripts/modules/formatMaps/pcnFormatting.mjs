export default function pcnFormatting(feature, latlng, { addBounce = false } = {}) {
    let markerPCN;

    // Use different marker styles depending on eg. practice groupings
    switch (feature.properties.pcn_name) {
      case "Selby Town":
        markerPCN = arrMarkerIcons[0]; // standard red map marker
        markerPCN.options.text = "ST";
        markerPCN.options.innerIconStyle = "padding-left:7px;padding-bottom:5px;"; // centre text in icon
        // markerPCN.options.icon = "fa-solid fa-bahai" // to use font awesome icon
        break;

      case "Tadcaster & Selby Rural Area":
        markerPCN = arrMarkerIcons[1]; // standard blue map marker
        markerPCN.options.text = "TSRA";
        markerPCN.options.innerIconStyle = "font-size:9px;";
        break;
      case "South Hambleton And Ryedale":
        markerPCN = arrMarkerIcons[2]; // standard green map marker
        markerPCN.options.text = "SHaR";
        markerPCN.options.innerIconStyle = "font-size:9px;";
        break;
      case "York City Centre":
        markerPCN = arrMarkerIcons[3]; // standard purple map marker
        markerPCN.options.text = "YCC";
        markerPCN.options.innerIconStyle =
          "font-size:11px;margin-top:3px;margin-left:-2px;";
        break;
      case "York Medical Group":
        markerPCN = arrMarkerIcons[4]; // standard orange map marker
        markerPCN.options.text = "YMG";
        markerPCN.options.innerIconStyle =
          "font-size:11px;margin-top:3px;margin-left:-2px;";
        break;
      case "Priory Medical Group":
        markerPCN = arrCircleIcons[0]; // red circle
        markerPCN.options.text = "PMG";
        markerPCN.options.innerIconStyle = "margin-top:3px;";
        break;
      case "York East":
        markerPCN = arrCircleIcons[1]; // blue circle
        markerPCN.options.text = "YE";
        markerPCN.options.innerIconStyle = "margin-top:3px; margin-left:0px;";
        break;
      case "West, Outer and North East York":
        markerPCN = arrCircleIcons[3]; // purple
        markerPCN.options.text = "WONEY";
        markerPCN.options.innerIconStyle =
          "margin-top:6px; margin-left:0px;font-size:8px;padding-top:1px;";
        break;
      // case "NIMBUSCARE LTD":
      //   switch (feature.properties.sub_group) {
      //     case "1":
      //       markerPCN = arrCircleIcons[7];
      //       break;
      //     case "2":
      //       markerPCN = arrCircleDotIcons[7];
      //       break;
      //     case "3":
      //       markerPCN = arrRectangleIcons[7];
      //       break;
      //     default:
      //       markerPCN = arrDoughnutIcons[7];
      //       break;
      //   }

      default:
        console.log(`Missing PCN Marker: ${feature.properties.pcn_name}`);
        markerPCN = arrDoughnutIcons[0];
    }

    const finalMarker = L.marker(latlng, {
      icon: markerPCN,
      riseOnHover: true,
    });

    if (addBounce) {
      finalMarker.on("click", function () {
        this.toggleBouncing();
      });
    }
    return finalMarker;
  }
