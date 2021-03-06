/*
For the practice selection dropdowns
Currently using unique practices as loaded in the data
This has to run after the data has been loaded - hence promise1, to get the unique practices
Consider separate approach to define unique practices eg. hardcode csv/ json

For restyling dropdowns, improved functionality:
  https://leaverou.github.io/awesomplete/
  https://github.com/LeaVerou/awesomplete

    To Consider:
      Currently, the sorting is done on the map.
      Consider something along the lines of the following:
        https://stackoverflow.com/questions/38448968/sorting-an-array-alphabetically-but-with-exceptions

      Change direction of dropdown at bottom of screen
        https://github.com/selectize/selectize.js/issues/29

  https://www.hongkiat.com/blog/search-select-using-datalist/
  https://codepen.io/rpsthecoder/embed/yJvRPE/?height=421&theme-id=12825&default-tab=result&embed-version=2
*/

const practiceLookup = new Map();

let urls = [
  "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03Q&RelStatus=active&Limit=1000",
  // "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?RelTypeId=RE3,RE4,RE5&TargetOrgId=03M&RelStatus=active&Limit=1000"
];

const gpDetails = d3.json(urls[0]).then((data) => {
  const organisations = data.Organisations;

  organisations.forEach((d) => {
    const orgID = d.OrgId;
    const orgName = d.Name;

    practiceLookup.set(orgID, orgName);
  });
});

Promise.all([gpDetails, promDataGPPopn]).then(() => {
  // requires unique list of practices (uniquePractices)
  const dropDowns = document.getElementsByClassName("dropdown practice"); // select all elements with these classes

  for (let i = 0; i < dropDowns.length; i++) {
    // https://stackoverflow.com/questions/14910196/how-to-add-multiple-divs-with-appendchild/36937070
    let docFrag = document.createDocumentFragment();
    docFrag.appendChild(createElem("option", "All Practices"));

    for (const pCode of uniquePractices) {
      // value, key, map https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach

      if (practiceLookup.has(pCode)) {
        docFrag.appendChild(
          createElem(
            "option",
            `${pCode}: ${titleCase(practiceLookup.get(pCode))}`
          )
        ); // Note that this does NOT go to the DOM
      } else {
        createElem("option", pCode);
      }
    }

    dropDowns[i].append(docFrag);
  }

  // https://www.sitepoint.com/javascript-autocomplete-widget-awesomplete/

  const input1 = document.getElementById("selPractice");
  const comboplete1 = new Awesomplete(input1, {
    minChars: 0,
    maxItems: 30,
    sort: false,
  });
  Awesomplete.$("#btn-selPractice").addEventListener("click", function () {
    if (comboplete1.ul.childNodes.length === 0) {
      comboplete1.minChars = 0;
      comboplete1.evaluate();
    } else if (comboplete1.ul.hasAttribute("hidden")) {
      comboplete1.open();
    } else {
      comboplete1.close();
    }
  });

  // https://github.com/LeaVerou/awesomplete/issues/17034
  input1.addEventListener("awesomplete-select", function (event) {
    if (event.text.value !== "All Practices") {
      userSelections.selectedPractice = event.text.value.substring(0, 6);
    } else {
      userSelections.selectedPractice = event.text.value;
    }
    refreshChartsPostPracticeChange(userSelections.selectedPractice);
  });

  const input2 = document.getElementById("selPracticeCompare");
  const comboplete2 = new Awesomplete(input2, {
    minChars: 0,
    maxItems: 30,
    sort: false,
  });
  Awesomplete.$("#btn-selPracticeCompare").addEventListener(
    "click",
    function () {
      if (comboplete2.ul.childNodes.length === 0) {
        comboplete2.minChars = 0;
        comboplete2.evaluate();
      } else if (comboplete2.ul.hasAttribute("hidden")) {
        comboplete2.open();
      } else {
        comboplete2.close();
      }
    }
  );

  input2.addEventListener("awesomplete-select", function (event) {
    if (event.text.value !== "All Practices") {
      userSelections.selectedPracticeCompare = event.text.value.substring(0, 6);
    } else {
      userSelections.selectedPracticeCompare = event.text.value;
    }

    console.log("Compare: " + userSelections.selectedPracticeCompare);
    demographicChart.updateChtDemog(
      userSelections.selectedPractice,
      userSelections.selectedPracticeCompare
    );
  });
});

// Function to create a given element eg. option and in this case, the map key, k (practice code)
function createElem(elemType, text) {
  let elem = document.createElement(elemType);
  elem.appendChild(document.createTextNode(text));
  return elem;
}
