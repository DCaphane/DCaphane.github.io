// https://github.com/AndersDJohnson/fetch-paginate/blob/master/README.md
// https://digital.nhs.uk/services/organisation-data-service/guidance-for-developers/http-headers

let resultsMap = new Map();
let url =
  "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?NonPrimaryRoleId=RO76&OrgRecordClass=RC1&Status=Active";
//let url1 = "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?NonPrimaryRoleId=RO76&OrgRecordClass=RC1&Status=Active&Limit=1000&Offset=1000"
const output = document.getElementById("output");
const dataListPractice = document.getElementById("practice-list");
const selectBox = document.getElementById("selPractice");
let selectedPractice;

let outputMap = new Map();
console.time("import");
fetchPaginate
  .default(url, {
    items: data => data.Organisations,
    params: {
      limit: "Limit",
      offset: "Offset"
    },
    firstOffset: 0,
    limit: 1000,
    offset: 1000
  })
  .then(data => {
    //console.log(data)
    console.timeEnd("import");
    const results = data.data;
    // console.log(data)
    // console.log(test)
    console.time("loop");

    results.forEach(d => {
      const orgID = d.OrgId;
      const orgName = d.Name;
      let option = document.createElement("option");
      option.value = [orgID, orgName].join(": ");

      if (orgID.substring(0, 3) === "B82") {
        outputMap.set(orgID, orgName); // add bank holiday date to the map as an integer
        dataListPractice.appendChild(option);
      }
    });
    console.timeEnd("loop");
    console.log("Ready!");
  });

selectBox.addEventListener("input", function() {
  const strPractice = selectBox.value;
  const strCode = strPractice.substring(0, 6);
  if (outputMap.has(strCode) && strCode !== selectedPractice) {
    selectedPractice = strCode;
    console.log(selectBox.value);
  }
});
