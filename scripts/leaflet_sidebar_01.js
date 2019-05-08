/* Add a sidebar
https://github.com/nickpeihl/leaflet-sidebar-v2
*/

const sidebar = L.control
  .sidebar({
    autopan: false, // whether to maintain the centered map point when opening the sidebar
    closeButton: true, // whether to add a close button to the panes
    container: "sidebar", // the DOM container or #ID of a predefined sidebar container that should be used
    position: "left" // left or right
  })
  .addTo(map02);

/* Text area
Considering separting long text for clarity
*/
const testText = `<br>
                    <p>Primary Care Networks...
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
  id: "overview", // UID, used to access the panel
  tab: '<i class="fa fa-bars"></i>', // content can be passed as HTML string,
  pane: testText,
  title: "Overview", // an optional pane header
  position: "top", // optional vertical alignment, defaults to 'top'
  disabled: false
};
sidebar.addPanel(panelOverview);

/* add a dummy messages panel */
const panelMail = {
  id: "mail",
  tab: '<i class="fa fa-envelope"></i>',
  pane: "<br><p>Send a message..., add a button here?<p/>",
  title: "Messages",
  position: "top",
  disabled: false
};
sidebar.addPanel(panelMail);

/* add a dummy messages panel */
const panelDummy = {
  id: "dummy",
  tab: '<i class="fa fa-user"></i>',
  pane:
    "<br><p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>",
  title: "Testing",
  position: "top",
  disabled: true
};
sidebar.addPanel(panelDummy);

/* add a Settings messages panel */
const panelSettings = {
  id: "settings",
  tab: '<i class="fa fa-cog"></i>',
  pane:
    "<br><p><button onclick=\"sidebar.enablePanel('dummy')\">enable dummy panel</button><button onclick=\"sidebar.disablePanel('dummy')\">disable dummy panel</button></p>",
  title: "Settings",
  position: "bottom",
  disabled: false
};
sidebar.addPanel(panelSettings);
