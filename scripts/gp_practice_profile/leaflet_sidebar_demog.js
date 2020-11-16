/* Text area
Considering separting long text for clarity
*/
const defaultText = `<br>
                    <h1>Primary Care Demographics...
                    <p/>
                    <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                     dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                     Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
                     consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                     sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
                     no sea takimata sanctus est Lorem ipsum dolor sit amet.
                     </p>
                     <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                     dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                     Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
                     consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                     sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
                     no sea takimata sanctus est Lorem ipsum dolor sit amet.
                     </p>
`;

/* add an overview panel */
const panelOverview = {
	id: "pcnOverview", // UID, used to access the panel
	tab: '<span class="fa fa-bars"></sp>', // content can be passed as HTML string,
	pane: defaultText,
	title: "Overview", // an optional pane header
	position: "top", // optional vertical alignment, defaults to 'top'
	disabled: false
};
sidebarPCN.addPanel(panelOverview);
sidebarSites.addPanel(panelOverview);
sidebarPopn.addPanel(panelOverview);
sidebarIMD.addPanel(panelOverview);

const panelSpecific = {
	id: "pcnSpecific", // UID, used to access the panel
	tab: '<span class="fa fa-info-circle"></span>', // content can be passed as HTML string,
	pane: "<br><p>Select a PCN for further details</p>",
	title: "PCN Specific", // an optional pane header
	position: "top", // optional vertical alignment, defaults to 'top'
	disabled: false
};
sidebarPCN.addPanel(panelSpecific);

/* add a dummy messages panel */
const panelMail = {
	id: "mail",
	tab: '<span class="fa fa-envelope"></span>',
	pane: "<br><h1>Send a message..., add a button here?<p/>",
	title: "Messages",
	position: "top",
	disabled: false
};
sidebarPCN.addPanel(panelMail);

/* add a dummy messages panel */
const panelDummy = {
	id: "dummy",
	tab: '<span class="fa fa-user"></span>',
	pane:
		"<br><p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>",
	title: "Testing",
	position: "top",
	disabled: true
};
sidebarPCN.addPanel(panelDummy);

/* add a Settings messages panel */
const panelSettings = {
	id: "settings",
	tab: '<span class="fa fa-cog"></span>',
	pane: `<br><p><button onclick="sidebarPCN.enablePanel(\'dummy\')">enable dummy panel</button>
    <button onclick="sidebarPCN.disablePanel(\'dummy\')">disable dummy panel</button></p>
    <br><h1><button onclick="resetSidebarText()">Reset Text</button>`,
	title: "Settings",
	position: "bottom",
	disabled: false
};
sidebarPCN.addPanel(panelSettings);

const resetSidebarText = function() {
	const elem = (document.getElementById(
		"pcnSpecific"
	).innerHTML = defaultPCN);
};

const updateSidebarText = function(sidebarID, gpPracticeCode) {
	const elem = document.getElementById(sidebarID); // eg. 'pcnOverview'
	switch (gpPracticeCode) {
		case "B81036":
			return (elem.innerHTML = B81036);
		case "B82002":
			return (elem.innerHTML = B82002);
		case "B82005":
			return (elem.innerHTML = B82005);
		case "B82018":
			return (elem.innerHTML = B82018);
		case "B82021":
			return (elem.innerHTML = B82021);
		case "B82026":
			return (elem.innerHTML = B82026);
		case "B82031":
			return (elem.innerHTML = B82031);
		case "B82033":
			return (elem.innerHTML = B82033);
		case "B82041":
			return (elem.innerHTML = B82041);
		case "B82047":
			return (elem.innerHTML = B82047);
		case "B82064":
			return (elem.innerHTML = B82064);
		case "B82068":
			return (elem.innerHTML = B82068);
		case "B82071":
			return (elem.innerHTML = B82071);
		case "B82073":
			return (elem.innerHTML = B82073);
		case "B82074":
			return (elem.innerHTML = B82074);
		case "B82077":
			return (elem.innerHTML = B82077);
		case "B82079":
			return (elem.innerHTML = B82079);
		case "B82080":
			return (elem.innerHTML = B82080);
		case "B82081":
			return (elem.innerHTML = B82081);
		case "B82083":
			return (elem.innerHTML = B82083);
		case "B82097":
			return (elem.innerHTML = B82097);
		case "B82098":
			return (elem.innerHTML = B82098);
		case "B82100":
			return (elem.innerHTML = B82100);
		case "B82103":
			return (elem.innerHTML = B82103);
		case "B82105":
			return (elem.innerHTML = B82105);
		case "B82619":
			return (elem.innerHTML = B82619);
		case "South Hambleton And Ryedale":
			return (elem.innerHTML = southHambRyePCN);
		case "York City Centre PCN":
			return (elem.innerHTML = yorkCityPCN);
		case "York Medical Group":
			return (elem.innerHTML = yorkMedicalGroup);
		case "NIMBUSCARE LTD":
			return (elem.innerHTML = nimbusCareLtd);
		default:
			return (elem.innerHTML = defaultPCN);
	}
};

const B81036 = `<h1 class="leaflet-sidebar-header">Pocklington</h1>
<br>
<p>Visit their website <a href="https://www.pocklingtongps.nhs.uk/"  target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Services/gp/Overview/DefaultView.aspx?id=42889 target="_blank" rel="noopener noreferrer">here</a></p>
<p>consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`;

const B82002 = `<h1 class="leaflet-sidebar-header">Millfield Surgery</h1>
<br>
<p>Visit their website <a href="https://www.millfieldsurgery.co.uk/" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Services/gp/Overview/DefaultView.aspx?id=39948 target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82005 = `<h1 class="leaflet-sidebar-header">Priory Medical Group</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82018 = `<h1 class="leaflet-sidebar-header">Escrick Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82021 = `<h1 class="leaflet-sidebar-header">Dalton Terrace Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82026 = `<h1 class="leaflet-sidebar-header">Haxby Group Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82031 = `<h1 class="leaflet-sidebar-header">Sherburn Group Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82033 = `<h1 class="leaflet-sidebar-header">Pickering Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82041 = `<h1 class="leaflet-sidebar-header">Beech Tree Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82047 = `<h1 class="leaflet-sidebar-header">Unity</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82064 = `<h1 class="leaflet-sidebar-header">Tollerton Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82068 = `<h1 class="leaflet-sidebar-header">Helmsley Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82071 = `<h1 class="leaflet-sidebar-header">The Old School Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82073 = `<h1 class="leaflet-sidebar-header">South Milford Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82074 = `<h1 class="leaflet-sidebar-header">Posterngate Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82077 = `<h1 class="leaflet-sidebar-header">Kirkbymoorside Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82079 = `<h1 class="leaflet-sidebar-header">Stillington Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82080 = `<h1 class="leaflet-sidebar-header">MyHealth</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82081 = `<h1 class="leaflet-sidebar-header">Elvington Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82083 = `<h1 class="leaflet-sidebar-header">York Medical Group</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82097 = `<h1 class="leaflet-sidebar-header">Scott Road Medical Centre</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82098 = `<h1 class="leaflet-sidebar-header">Jorvik Gillygate Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82100 = `<h1 class="leaflet-sidebar-header">Front Street Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82103 = `<h1 class="leaflet-sidebar-header">East Parade Medical Practice</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82105 = `<h1 class="leaflet-sidebar-header">Tadcaster Medical Centre</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const B82619 = `<h1 class="leaflet-sidebar-header">Terrington Surgery</h1>
<br>
<p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
<p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
<p>
Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua.
</p>`;

const southHambRyePCN = `<h1 class="leaflet-sidebar-header">South Hambleton And Ryedale</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`;

const yorkCityPCN = `<h1 class="leaflet-sidebar-header">York City Centre PCN</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`;

const yorkMedicalGroup = `<h1 class="leaflet-sidebar-header">York Medical Group</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`;

const nimbusCareLtd = `<h1 class="leaflet-sidebar-header">NIMBUSCARE LTD</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`;

const defaultPCN = `<h1 class="leaflet-sidebar-header">Practice Specific</h1>
	<br>
	<p>Select a specific Practice for further details</p>
`;
