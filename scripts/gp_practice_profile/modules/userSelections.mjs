import { practiceLookup, titleCase, arrayGPLsoaDates} from "../aggregateModules.mjs"

export const userSelections = {
    selectedPractice: "All Practices",
    selectedPracticeName() {
      return practiceLookup.has(this.selectedPractice)
        ? titleCase(practiceLookup.get(this.selectedPractice))
        : "";
    },
    selectedPracticeCompare: "None",
    selectedPracticeCompareName() {
      return practiceLookup.has(this.selectedPracticeCompare)
        ? titleCase(practiceLookup.get(this.selectedPracticeCompare))
        : "";
    },
    selectedDate: null,
    nearestDate() {
      // Align the selected period to the nearest quarterly period
      // arrayGPLsoaDates is result of promise promDataGPPopnLsoa
      return (
        arrayGPLsoaDates.reduce(
          (p, n) =>
            Math.abs(p) > Math.abs(n - this.selectedDate)
              ? n - this.selectedDate
              : p,
          Infinity
        ) + this.selectedDate
      );
    },
  };
