const colourUnknown = "#bbbbbb",
  colourOldCode = "#7b615c";

let diagnosisRefObj = {}; // Object that will contain snomed code (string) as key and groups as values
const map_diagnosis_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]), // map for looking up group codes to descriptions (could be object)
  // tried using map to use array as key but this doesn't appear to work, dificult to get values when key is an array...
  diagnosis_set = new Set(); // used to log any unmatched snomed codes that may need  eg. old codes that have since been dropped

Papa.parse("Data/ecds/ecds_ref_tables/ref_diagnosis.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    diagnosisRefObj = d.data.reduce(
      (obj, item) => (
        (obj[item.SNOMED_Code] = [item.Sort1, item.Sort2, item.Sort3]), obj
      ),
      {}
    );
    //test = Object.entries(d);
    /*
            Destructuring Assignment
            Unpack the original array of objects into objects with the SNOMED_Code as the key for lookup
            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        */

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2, s3; // variables to contain Sort1, Sort2 and Sort 3 only from full table
      ({ s1, s2, s3 } = {
        s1: d.Sort1,
        s2: d.Sort2,
        s3: d.Sort3
      }); // unpack the selected variables

      // Create a map key with the Sort descriptions for chart lookups

      const strS2 = "" + s1 + s2,
        strS3 = "" + s1 + s2 + s3;

      if (!map_diagnosis_groups.has(s1)) {
        map_diagnosis_groups.set(s1, [d.ECDS_Group1, sunburstColours(s1)]);
      } // eg. 11 (int format rather than string)

      if (!map_diagnosis_groups.has(+strS2)) {
        map_diagnosis_groups.set(+strS2, [
          d.ECDS_Group2,
          sunburstColours(strS2)
        ]);
      } // eg. 1112

      if (!map_diagnosis_groups.has(+strS3)) {
        map_diagnosis_groups.set(+strS3, [
          d.ECDS_Group3,
          sunburstColours(strS3)
        ]);
      } // eg. 111213
    });
  }
});

let acuityRefObj = {};
const acuity_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_acuity.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    acuityRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = item.ECDS_Description), obj),
      {}
    );
    acuityRefObj[0] = "0 - Unknown";
  }
});

let attdSourceRefObj = {};
const map_attdSource_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  attdSource_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_attd_source.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    attdSourceRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_attdSource_groups.has(s1)) {
        map_attdSource_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_attdSource_groups.has(+strS2)) {
        map_attdSource_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let complaintRefObj = {};
const map_complaint_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  complaint_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_complaint.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    complaintRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_complaint_groups.has(s1)) {
        map_complaint_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_complaint_groups.has(+strS2)) {
        map_complaint_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let dischdestRefObj = {};
const map_dischdest_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  dischdest_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_discharge_destination.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    dischdestRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_dischdest_groups.has(s1)) {
        map_dischdest_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_dischdest_groups.has(+strS2)) {
        map_dischdest_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let dischfupRefObj = {};
const map_dischfup_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  dischfup_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_discharge_followup.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    dischfupRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );
    dischfupRefObj[3780001] = [91];

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;

      // Create a map key with the Sort descriptions for chart lookups
      if (!map_dischfup_groups.has(s1)) {
        map_dischfup_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_dischfup_groups.has(+strS2)) {
        map_dischfup_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let dischstatusRefObj = {};
const map_dischstatus_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  dischstatus_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_discharge_status.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    dischstatusRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );
    dischstatusRefObj[182992009] = [11];

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;
      // Create a map key with the Sort descriptions for chart lookups
      if (!map_dischstatus_groups.has(s1)) {
        map_dischstatus_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_dischstatus_groups.has(+strS2)) {
        map_dischstatus_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

let injdrugRefObj = {};
const map_injdrug_groups = new Map([
    [0, ["Unknown", colourUnknown]],
    [999, ["Old Code", colourOldCode]]
  ]),
  injdrug_set = new Set(); // used to log any unmatched snomed codes that may need adding

Papa.parse("Data/ecds/ecds_ref_tables/ref_inj_drug.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    injdrugRefObj = d.data.reduce(
      (obj, item) => ((obj[item.SNOMED_Code] = [item.Sort1, item.Sort2]), obj),
      {}
    );

    d.data.forEach(d => {
      // return Sort values from original object as an array, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
      let s1, s2; // variables to contain Sort1, Sort2 only from full table
      ({ s1, s2 } = { s1: d.Sort1, s2: d.Sort2 }); // unpack the selected variables

      const strS2 = "" + s1 + s2;
      // Create a map key with the Sort descriptions for chart lookups
      if (!map_injdrug_groups.has(s1)) {
        map_injdrug_groups.set(s1, [d.ECDS_Group, sunburstColours(s1)]);
      }
      if (!map_injdrug_groups.has(+strS2)) {
        map_injdrug_groups.set(+strS2, [
          d.ECDS_Description,
          sunburstColours(strS2)
        ]);
      }
    });
  }
});

// Practice Look Up
let practiceObj = {},
  practiceArr = [];

Papa.parse("Data/ref_gppractice.csv", {
  download: true,
  header: true,
  delimiter: ",",
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: d => {
    // https://stackoverflow.com/questions/19874555/how-do-i-convert-array-of-objects-into-one-object-in-javascript
    // https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7
    practiceObj = d.data.reduce(
      (obj, item) => (
        (obj[item.PracticeCode_Mapped] = [
          item.ID, // PapaParse auto set to int
          item.Practice_Name,
          item.Locality
        ]),
        obj
      ),
      {}
    );

    // Returns the practice codes as an array for subsequent lookup
    practiceArr = Object.keys(practiceObj);
  }
});

// Bank Holidays
// https://medium.com/@nkhilv/how-to-use-the-javascript-fetch-api-to-get-uk-bank-holidays-step-by-step-dbb4357236ff

let bankHolidayMap = new Map();

fetch("https://www.gov.uk/bank-holidays.json")
  .then(response => response.json())
  .then(data => {
    // console.log(data)
    let england = data["england-and-wales"].events; // England bank holidays only

    england.forEach(d => {
      const [year, month, date] = d.date.split("-");
      const bankHol = new Date(Date.UTC(year, month - 1, date));
      bankHolidayMap.set(+bankHol, d.title); // add bank holiday date to the map as an integer
    });
  });
