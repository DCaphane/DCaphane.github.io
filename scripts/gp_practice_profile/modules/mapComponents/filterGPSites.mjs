import { mapStore, mapsWithGPSites} from "../../aggregateModules.mjs"

export function refreshFilteredGPSitesOverlays() {
    // mapStore is an array of the maps that use the filtered GP Sites
    let refreshOverlay = false;
    for (let mapGPSites of mapStore) {
      if (mapsWithGPSites.has(mapGPSites.map)) {
        const arr = mapsWithGPSites.get(mapGPSites.map);
        if (arr.length > 2) {
          if (arr[2] !== null) {
            // if it's null then delete the overlay label
            refreshOverlay = true;
            mapGPSites.updateOverlay("gpSitesFiltered", arr[2]);
          } else {
            mapGPSites.updateOverlay(
              "gpSitesFiltered",
              "",
              true // option to delete overlay
            );
          }
        }
      } else {
        // console.log({gpSitesMap: 'update gpSites map array'})
      }
    }

    // Once the lsoa has been refreshed, update the overlay
    if (refreshOverlay) {
      // refreshMapOverlayControls();
    }
  }
