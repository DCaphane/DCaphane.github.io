// default details
const person = {
	name: 'tbc',
	imageUrl: 'img/org_structure/default.jpg',
	telephone: '01904 555 870',
	eMail: 'valeofyork.contactus@nhs.net', // http =//example.com/employee/profile
	office: 'West Offices',
	profile: 'http://example.com/employee/profile',
	// tags: null,
	// unit: {
	// 	type: 'business',
	// 	value: 'Business first'
	// },
	positionName: null, // eg. CFO
	children: null,
	website: 'www.valeofyorkccg.nhs.uk',
	backgroundColor: { red: 105, green: 105, blue: 105, alpha: 1 }, // dimgrey
	borderColor: { red: 15, green: 140, blue: 121, alpha: 1 }
};

const personFinance = Object.create(person);
personFinance.area = 'Finance';
personFinance.tags = 'finance,contracting';
personFinance.backgroundColor = { red: 51, green: 182, blue: 208, alpha: 1 };

const personContracting = Object.create(person);
personContracting.area = 'Contracting';
personContracting.tags = 'contracting';
personContracting.backgroundColor = { red: 47, green: 79, blue: 79, alpha: 1 }; // darkslategrey

const personBI = Object.create(person);
personBI.area = 'Business Intelligence';
personBI.backgroundColor = { red: 70, green: 130, blue: 180, alpha: 1 }; // steelblue
personBI.tags = 'bi';

// const defaultPerson = Object.create(person); // dummy object to show default values only

// ********************** Finance ******************************

const accountableOfficer = Object.create(person);
accountableOfficer.positionName = 'Accountable Officer'
accountableOfficer.name = 'Phil Mettam'
accountableOfficer.imageUrl = 'img/org_structure/mettamPhil.jpg'


const chiefFinanceOfficer = Object.create(personFinance);
chiefFinanceOfficer.positionName = 'Chief Finance Officer';
chiefFinanceOfficer.name = 'Simon Bell';
chiefFinanceOfficer.imageUrl = 'img/org_structure/bellSimon.jpg';
chiefFinanceOfficer.tags += ',Business Intelligence';

const deputyCFO = Object.create(personFinance);
deputyCFO.positionName = 'Deputy Chief Finance Officer';
deputyCFO.name = 'Michael Ash-McMahon';
deputyCFO.tags += ',Business Intelligence';

const headOfFinance = Object.create(personFinance);
headOfFinance.positionName = 'Head of Finance';
headOfFinance.name = 'Natalie Fletcher';
headOfFinance.telephone = '01904 555 927';
headOfFinance.eMail = 'natalie.fletcher3@nhs.net';
headOfFinance.imageUrl = 'img/org_structure/Natalie.jpg';

const deputyHeadOfFinance = Object.create(personFinance);
deputyHeadOfFinance.positionName = 'Deputy Head of Finance';
deputyHeadOfFinance.name = 'Caroline Goldsmith';
deputyHeadOfFinance.imageUrl = 'img/org_structure/Caroline.jpg';

const mgmtAccountant = Object.create(personFinance);
mgmtAccountant.positionName = 'Management Accountant';
mgmtAccountant.name = 'tbc';

const financialAccountant = Object.create(personFinance);
financialAccountant.positionName = 'Financial Accountant';
financialAccountant.name = 'tbc';

const financialAccountantPrimCare = Object.create(personFinance);
financialAccountantPrimCare.positionName =
	'Financial Accountant (Primary Care)';
financialAccountantPrimCare.name = 'tbc';

const financeApprentice = Object.create(personFinance);
financeApprentice.positionName = 'Finance Apprentice';
financeApprentice.name = 'tbc';

const chcFinanceTeamLeader = Object.create(personFinance);
chcFinanceTeamLeader.positionName = 'CHC Finance Team Leader';
chcFinanceTeamLeader.name = 'tbc';

const chcFinanceOfficer = Object.create(personFinance);
chcFinanceOfficer.positionName = 'CHC Finance Officers';
chcFinanceOfficer.name = 'tbc';
chcFinanceOfficer.tags += 'chc'; // test

const asstMgmtAccountant = Object.create(personFinance);
asstMgmtAccountant.positionName = 'Assistant Management Accountants';
asstMgmtAccountant.name = 'tbc';

const financeAssistant = Object.create(personFinance);
financeAssistant.name = 'tbc';
financeAssistant.positionName = 'Finance Assistants';

// ********************** Contracting ******************************
const headOfContracting = Object.create(personContracting);
headOfContracting.positionName = 'Head of Contracting & Analytics';
headOfContracting.name = 'Liza Smithson';
headOfContracting.eMail = 'liza.smithson@nhs.net';
headOfContracting.telephone = '01904 555922';
headOfContracting.tags += ',finance,Business Intelligence';
headOfContracting.imageUrl = 'img/org_structure/Liza.jpg';

const deputyHeadContracting = Object.create(personContracting);
deputyHeadContracting.positionName = 'Deputy Head of Contracting';
deputyHeadContracting.name = 'Angie Walker';
deputyHeadContracting.tags += ',finance';

const contractManagerPrimaryCare = Object.create(personContracting);
contractManagerPrimaryCare.positionName = 'Contract Manager Primary Care';
contractManagerPrimaryCare.name = 'tbc';
contractManagerPrimaryCare.tags += ',finance';

const contractManagerMH = Object.create(personContracting);
contractManagerMH.positionName = 'Contract Manager Mental Health'; // Community and Complex Care
contractManagerMH.name = 'tbc';
contractManagerMH.tags += ',finance';

const asstContractManager1 = Object.create(personContracting);
asstContractManager1.name = 'tbc';
asstContractManager1.positionName = 'Assistant Contracts Manager';

const asstContractManager2 = Object.create(personContracting);
asstContractManager2.positionName = 'Assistant Contracts Manager';
asstContractManager2.name = 'tbc';

// ********************** BI ******************************
const deputyHeadOfAnalytics = Object.create(personBI);
deputyHeadOfAnalytics.positionName = 'Deputy Head of Analytics';
deputyHeadOfAnalytics.name = 'George Scott';
deputyHeadOfAnalytics.eMail = 'georgescott@nhs.net';
deputyHeadOfAnalytics.telephone = '01904 555795';
deputyHeadOfAnalytics.tags += ',contracting,mental health';

const principalAnalyst1 = Object.create(personBI);
principalAnalyst1.positionName = 'Principal Analyst';
principalAnalyst1.name = 'Sheena White';
principalAnalyst1.tags += ',performance';

const principalAnalyst2 = Object.create(personBI);
principalAnalyst2.positionName = 'Principal Analyst';
principalAnalyst2.name = 'Gordon Masson';
principalAnalyst2.tags += ',finance,chc,performance';

const principalAnalyst3 = Object.create(personBI);
principalAnalyst3.positionName = 'Principal Analyst';
principalAnalyst3.name = 'David Caphane';
principalAnalyst3.tags += ',secondary care';
principalAnalyst3.telephone = '01904 555 775';
principalAnalyst3.eMail = 'davidcaphane@nhs.net';
principalAnalyst3.backgroundColor = { red: 51, green: 0, blue: 0, alpha: 1 };

const embedBIManager = Object.create(personBI);
embedBIManager.positionName = 'eMBED BI Manager';
embedBIManager.name = 'Paula';
embedBIManager.tags += ',embed,contracting,Business Intelligence';

const embedAnalyst = Object.create(personBI);
embedAnalyst.positionName = 'eMBED BI Principal Analyst';
embedAnalyst.name = 'Davinder';
embedAnalyst.tags += ',embed,Business Intelligence';

// ********************** Parent / Child ******************************

accountableOfficer.children = [chiefFinanceOfficer];

// ********************** Finance ******************************
chiefFinanceOfficer.children = [deputyCFO];

deputyCFO.children = [headOfFinance, headOfContracting];

headOfFinance.children = [deputyHeadOfFinance];

deputyHeadOfFinance.children = [
	mgmtAccountant,
	financialAccountant,
	financialAccountantPrimCare,
	asstMgmtAccountant,
	financeAssistant
];

financialAccountant.children = [financeApprentice];

mgmtAccountant.children = [chcFinanceTeamLeader];

chcFinanceTeamLeader.children = [chcFinanceOfficer];

// ********************** Contracting / BI ******************************
headOfContracting.children = [
	deputyHeadContracting,
	asstContractManager1,
	deputyHeadOfAnalytics,
	embedBIManager
];

embedBIManager.children = [embedAnalyst];

deputyHeadContracting.children = [
	contractManagerPrimaryCare,
	contractManagerMH
];

contractManagerPrimaryCare.children = [asstContractManager2];

deputyHeadOfAnalytics.children = [
	principalAnalyst1,
	principalAnalyst2,
	principalAnalyst3
];

/*
// Use this if wanting to export json as string to file
const orgStructureJson = JSON.stringify(chiefFinanceOfficer, [
	'name',
	'imageUrl',
	'telephone',
	'eMail',
	'office',
	// 'tags',
	// 'isLoggedUser',
	// 'unit',
	// 'type',
	// 'value',
	'positionName',
	'children'
]);
*/
// console.log(orgStructureJson)
