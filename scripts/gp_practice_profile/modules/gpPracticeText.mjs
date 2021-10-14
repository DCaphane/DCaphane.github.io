const sidebarContent = sidebarDefaults();
export {sidebarContent}

function sidebarDefaults() {
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
      tab: '<span class="fa-solid fa-bars"></span>', // content can be passed as HTML string,
      pane: defaultText,
      title: "Overview", // an optional pane header
      position: "top", // optional vertical alignment, defaults to 'top'
      disabled: false,
    };

    const panelSpecific = {
      id: "pcnSpecific", // UID, used to access the panel
      tab: '<span class="fa-solid fa-info"></span>', // content can be passed as HTML string,
      pane: "<br><p>Select a PCN for further details</p>",
      title: "PCN Specific", // an optional pane header
      position: "top", // optional vertical alignment, defaults to 'top'
      disabled: false,
    };

    /* add a dummy messages panel */
    const panelMail = {
      id: "mail",
      tab: '<span class="fa-solid fa-envelope"></span>',
      pane: "<br><h1>Send a message..., add a button here?<p/>",
      title: "Messages",
      position: "top",
      disabled: false,
    };

    /* add a dummy messages panel */
    const panelDummy = {
      id: "dummy",
      tab: '<span class="fa-solid fa-user"></span>',
      pane: "<br><p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>",
      title: "Testing",
      position: "top",
      disabled: true,
    };

    /* add a Settings messages panel */
    // sidebarContent.resetSidebarText is set at run time
    const panelSettings = {
      id: "settings",
      tab: '<span class="fa-solid fa-gear"></span>',
      pane: `<br><p><button onclick="sidebarMapMain.enablePanel(\'dummy\')">enable dummy panel</button>
      <button onclick="sidebarMapMain.disablePanel(\'dummy\')">disable dummy panel</button></p>
      <br><h1><button onclick="sidebarContent.resetSidebarText()">Reset Text</button>`,
      title: "Settings",
      position: "bottom",
      disabled: false,
    };

    const panelIMDSpecific = {
      id: "pcnSpecific", // UID, used to access the panel
      tab: '<span class="fa-solid fa-info"></span>', // content can be passed as HTML string,
      pane: "<br><p>For further details around IMD, see <a href='https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019' target='_blank' rel='noopener noreferrer'>link</a></a></p>",
      title: "IMD Details", // an optional pane header
      position: "top", // optional vertical alignment, defaults to 'top'
      disabled: false,
    };

    function resetSidebarText() {
      document.getElementById("pcnSpecific").innerHTML =
        mapDescriptions.get(defaultPCN);
    }

    const updateSidebarText = function (sidebarID, gpPracticeCode) {
      const elem = document.getElementById(sidebarID); // eg. 'pcnOverview'

      if (mapDescriptions.has(gpPracticeCode)) {
        elem.innerHTML = mapDescriptions.get(gpPracticeCode);
      } else {
        console.log(`missing description ${gpPracticeCode}`);
        elem.innerHTML = mapDescriptions.get("defaultPCN");
      }
    };

    const mapDescriptions = new Map();

    mapDescriptions.set(
      "B81036",
      `<h1 class="leaflet-sidebar-header">Pocklington</h1>
    <br>
    <p>Visit their website <a href="https://www.pocklingtongps.nhs.uk/"  target="_blank" rel="noopener noreferrer">here</a></p>
    <p>Or this site <a href="https://www.nhs.uk/Services/gp/Overview/DefaultView.aspx?id=42889 target="_blank" rel="noopener noreferrer">here</a></p>
    <p>consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
    dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
    Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
    consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
    sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>`
    );

    mapDescriptions.set(
      "B82002",
      `<h1 class="leaflet-sidebar-header">Millfield Surgery</h1>
  <br>
  <p>Visit their website <a href="https://www.millfieldsurgery.co.uk/" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Services/gp/Overview/DefaultView.aspx?id=39948 target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82005",
      `<h1 class="leaflet-sidebar-header">Priory Medical Group</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82018",
      `<h1 class="leaflet-sidebar-header">Escrick Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82021",
      `<h1 class="leaflet-sidebar-header">Dalton Terrace Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82026",
      `<h1 class="leaflet-sidebar-header">Haxby Group Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82031",
      `<h1 class="leaflet-sidebar-header">Sherburn Group Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82033",
      `<h1 class="leaflet-sidebar-header">Pickering Medical Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82041",
      `<h1 class="leaflet-sidebar-header">Beech Tree Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82047",
      `<h1 class="leaflet-sidebar-header">Unity</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82064",
      `<h1 class="leaflet-sidebar-header">Tollerton Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82068",
      `<h1 class="leaflet-sidebar-header">Helmsley Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82071",
      `<h1 class="leaflet-sidebar-header">The Old School Medical Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82073",
      `<h1 class="leaflet-sidebar-header">South Milford Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82074",
      `<h1 class="leaflet-sidebar-header">Posterngate Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82077",
      `<h1 class="leaflet-sidebar-header">Kirkbymoorside Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82079",
      `<h1 class="leaflet-sidebar-header">Stillington Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82080",
      `<h1 class="leaflet-sidebar-header">MyHealth</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82081",
      `<h1 class="leaflet-sidebar-header">Elvington Medical Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82083",
      `<h1 class="leaflet-sidebar-header">York Medical Group</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82097",
      `<h1 class="leaflet-sidebar-header">Scott Road Medical Centre</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82098",
      `<h1 class="leaflet-sidebar-header">Jorvik Gillygate Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82100",
      `<h1 class="leaflet-sidebar-header">Front Street Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82103",
      `<h1 class="leaflet-sidebar-header">East Parade Medical Practice</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82105",
      `<h1 class="leaflet-sidebar-header">Tadcaster Medical Centre</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "B82619",
      `<h1 class="leaflet-sidebar-header">Terrington Surgery</h1>
  <br>
  <p>Visit their website <a href="#" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>Or this site <a href="https://www.nhs.uk/Service-Search" target="_blank" rel="noopener noreferrer">here</a></p>
  <p>
  Add some other text here. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua.
  </p>`
    );

    mapDescriptions.set(
      "South Hambleton And Ryedale",
      `<h1 class="leaflet-sidebar-header">South Hambleton And Ryedale</h1>
  <br>
  <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
  consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
  no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>`
    );

    mapDescriptions.set(
      "York City Centre PCN",
      `<h1 class="leaflet-sidebar-header">York City Centre PCN</h1>
  <br>
  <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
  consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
  no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>`
    );

    mapDescriptions.set(
      "York Medical Group",
      `<h1 class="leaflet-sidebar-header">York Medical Group</h1>
  <br>
  <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
  consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
  no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>`
    );

    mapDescriptions.set(
      "NIMBUSCARE LTD",
      `<h1 class="leaflet-sidebar-header">NIMBUSCARE LTD</h1>
  <br>
  <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
  dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
  consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
  no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>`
    );

    mapDescriptions.set(
      "defaultPCN",
      `<h1 class="leaflet-sidebar-header">Practice Specific</h1>
      <br>
      <p>Select a specific Practice for further details</p>`
    );

    return {
      panelOverview: panelOverview,
      panelSpecific: panelSpecific,
      panelMail: panelMail,
      panelDummy: panelDummy,
      panelSettings: panelSettings,
      panelIMDSpecific: panelIMDSpecific,
      resetSidebarText: resetSidebarText,
      updateSidebarText: updateSidebarText,
    };
  }
