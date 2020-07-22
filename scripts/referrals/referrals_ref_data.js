const colourUnknown = "#bbbbbb",
	colourOldCode = "#7b615c";

console.time("importTime");

// Referrals Reference Tables (taken from cte in sql query)
let idCancerObj = {};

async function refIdCancer() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/idCancer.csv"
	);

	idCancerObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.cancer), obj),
		{}
	);
}
refIdCancer();

let idCCGObj = {};

async function refIdCCG() {
	const data = await d3.csv("Data/referrals/referral_ref_tables/idCCG.csv");

	idCCGObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.ccg), obj),
		{}
	);
}
refIdCCG();

let idGPPracticeObj = {};

async function refIdGPPractice() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/idGPPractice.csv"
	);

	idGPPracticeObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.gp_practice), obj),
		{}
	);
}
refIdGPPractice();

let idRefMethodObj = {};

async function refIdRefMethod() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/idRefMethod.csv"
	);

	idRefMethodObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.referral_method), obj),
		{}
	);
}
refIdRefMethod();

let idRefRoleTypeObj = {};

async function refIdRefRoleType() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/idRefRoleType.csv"
	);

	idRefRoleTypeObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.referring_role_type), obj),
		{}
	);
}
refIdRefRoleType();

let idRefTypeObj = {};

async function refIdRefType() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/idRefType.csv"
	);

	idRefTypeObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.referral_type), obj),
		{}
	);
}
refIdRefType();

let idRefUrgencyObj = {};

async function refIdRefUrgency() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/idRefUrgency.csv"
	);

	idRefUrgencyObj = data.reduce(
		(obj, item) => ((obj[item.RowNo] = item.referral_urgency), obj),
		{}
	);
}
refIdRefUrgency();


let refSpecCodesObj = {};

async function refIdRefSpecCodes() {
	const data = await d3.csv(
		"Data/referrals/referral_ref_tables/specCodes.csv"
	);

	refSpecCodesObj = data.reduce(
		(obj, item) => ((obj[item.specCode] = item.specDesc), obj),
		{}
	);
}
refIdRefSpecCodes();

// Bank Holidays
// https://medium.com/@nkhilv/how-to-use-the-javascript-fetch-api-to-get-uk-bank-holidays-step-by-step-dbb4357236ff

let bankHolidayMap = new Map();

fetch("https://www.gov.uk/bank-holidays.json")
	.then((response) => response.json())
	.then((data) => {
		// console.log(data)
		let england = data["england-and-wales"].events; // England bank holidays only

		england.forEach((d) => {
			const [year, month, date] = d.date.split("-");
			const bankHol = new Date(Date.UTC(year, month - 1, date));
			bankHolidayMap.set(+bankHol, d.title); // add bank holiday date to the map as an integer
		});
	});

	// Practice Look Up
let practiceObj = {},
  practiceArr = [];

async function uniquePractices() {
  const data = await d3.csv("Data/ref_gppractice.csv");

  // https://stackoverflow.com/questions/19874555/how-do-i-convert-array-of-objects-into-one-object-in-javascript
  // https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7
  // Convert an array of Objects into one Object
  practiceObj = data.reduce(
    (obj, item) => (
      (obj[item.PracticeCode_Mapped] = [
        +item.ID,
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
uniquePractices();
