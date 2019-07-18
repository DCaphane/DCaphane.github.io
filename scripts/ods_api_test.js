// https://github.com/AndersDJohnson/fetch-paginate/blob/master/README.md
// https://digital.nhs.uk/services/organisation-data-service/guidance-for-developers/http-headers

let resultsMap = new Map();
let url =
	'https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?NonPrimaryRoleId=RO76&OrgRecordClass=RC1&Status=Active';
// let url1 = "https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?NonPrimaryRoleId=RO76&OrgRecordClass=RC1&Status=Active&Limit=1000&Offset=1000"

// const output = document.getElementById("output");
const fragment = document.createDocumentFragment();
const dataListPractice = document.getElementById('practice-list');
const selectBox = document.getElementById('selPractice');
const readyDiv = document.getElementById('ready');
let selectedPractice;

let outputMap = new Map();
console.time('import');
const start = window.performance.now();

fetchPaginate
	.default(url, {
		items: (data) => data.Organisations,
		params: {
			limit: 'Limit',
			offset: 'Offset'
		},
		firstOffset: 0,
		limit: 1000,
		offset: 1000
	})
	.then((data) => {
		//console.log(data)
		console.timeEnd('import');
		const results = data.data;
		// console.log(data)
		// console.log(test)
		console.time('loop');

		results.forEach((d) => {
			const orgID = d.OrgId;
			const orgName = d.Name;
			let option = document.createElement('option');
			option.value = [orgID, orgName].join(': ');

			if (orgID.substring(0, 3) === 'B82') {
				outputMap.set(orgID, orgName); // add bank holiday date to the map as an integer
				fragment.appendChild(option);
			}

			dataListPractice.append(fragment);
		});
		console.timeEnd('loop');
		console.log('Ready!');
		const end = window.performance.now();
		const timeTaken = end - start;
		readyDiv.innerHTML =
			'Ready. Time taken to load: ' +
			+(timeTaken / 1000).toFixed(1) +
			'sec';
	});

/*
selectBox.addEventListener('input', function() {
	const strPractice = selectBox.value;
	const strCode = strPractice.substring(0, 6);
	if (outputMap.has(strCode) && strCode !== selectedPractice) {
		selectedPractice = strCode;
		console.log(selectBox.value);
	}
});
*/

/*
Datalist validation
https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation

https://css-tricks.com/form-validation-part-1-constraint-validation-html/
https://www.jotform.com/blog/html5-datalists-what-you-need-to-know-78024/
	https://github.com/cferdinandi/bouncer
*/

// Find all inputs on the DOM which are bound to a datalist via their list attribute.
const inputs = document.querySelectorAll('input[list]');
for (let i = 0; i < inputs.length; i++) {
	// When the value of the input changes...
	// inputs[i].setAttribute('novalidate', true);
	inputs[i].addEventListener('change', function() {
		let optionFound = false,
			datalist = this.list;
		// Determine whether an option exists with the current value of the input.
		for (let j = 0; j < datalist.options.length; j++) {
			if (this.value == datalist.options[j].value) {
				optionFound = true;
				break;
			}
		}
		// use the setCustomValidity function of the Validation API
		// to provide an user feedback if the value does not exist in the datalist
		if (optionFound) {
			this.setCustomValidity('');
			console.log('happy');
		} else {
			this.setCustomValidity('Please select a practice from the list.');
			console.log('sad');
		}
	});
}
