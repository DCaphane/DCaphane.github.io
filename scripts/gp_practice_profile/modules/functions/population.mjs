import {
  userSelections,
  dataPopulationGPLsoa,
} from "../../aggregateModules.mjs";

export function maxPopulation() {
  return userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
    ? d3.max(
        dataPopulationGPLsoa
          .get(userSelections.nearestDate())
          .get(userSelections.selectedPractice)
          .values()
      )
    : d3.max(
        dataPopulationGPLsoa
          .get(userSelections.nearestDate())
          .get("All")
          .values()
      );
}

export function actualPopulation(lsoa) {
  return userSelections.selectedPractice !== undefined &&
    userSelections.selectedPractice !== "All Practices"
    ? dataPopulationGPLsoa
        .get(userSelections.nearestDate())
        .get(userSelections.selectedPractice)
        .get(lsoa)
    : dataPopulationGPLsoa
        .get(userSelections.nearestDate())
        .get("All")
        .get(lsoa);
}
