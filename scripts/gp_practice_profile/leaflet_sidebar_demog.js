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
  const elem = (document.getElementById("pcnSpecific").innerHTML = defaultPCN);
};

const updateSidebarText = function(sidebarID, gpPracticeCode) {
  const elem = document.getElementById(sidebarID); // eg. 'pcnOverview'
  switch (gpPracticeCode) {
		case 'B81036':
			return (elem.innerHTML = B81036);
		case 'B82005':
			return (elem.innerHTML = B82005);
		case 'South Hambleton And Ryedale':
			return (elem.innerHTML = southHambRyePCN);
		case 'York City Centre PCN':
			return (elem.innerHTML = yorkCityPCN);
		case 'York Medical Group':
			return (elem.innerHTML = yorkMedicalGroup);
		case 'NIMBUSCARE LTD':
			return (elem.innerHTML = nimbusCareLtd);
		default:
			return (elem.innerHTML = defaultPCN);
  }
};

const B81036 = `<h1 class="leaflet-sidebar-header">Pocklington</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
</p>`;

const B82005 = `<h1 class="leaflet-sidebar-header">Priory Medical Group</h1>
<br>
<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum dolor sit amet.
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
