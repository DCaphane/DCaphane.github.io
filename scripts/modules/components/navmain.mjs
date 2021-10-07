// https://javascript.info/modifying-document#a-word-about-document-write
// https://plnkr.co/edit/LJbzzvqdwGaf2iojgymr?p=preview

export default function createNavBarMain() {
  // Object consisting of main headers and page links
  const siteStructure = createSiteStructure();

  // To keep track of recursion depth
  let counter = 0,
    itemNumber = 0,
    trackKey = 0,
    headingPosition = 0;

  const arrDataKeys = Object.keys(siteStructure), // An array of the top level headings only
    dataKeysCount = arrDataKeys.length;
  // lastItemText = arrDataKeys[arrDataKeys.length - 1];

  // Tried using appendChild but this replaces existing nodes.
  // Use insertAdjacentHTML instead. This requires element as text string.
  // Down and Right arrows used to identify sub menus (Down for first level, right for all subsequent levels)
  const spanArrowDown = document.createElement("span");
  spanArrowDown.className = "fa-solid fa-angle-down";
  const textSpanArrowDown = spanArrowDown.outerHTML;

  const spanArrowRight = document.createElement("span");
  spanArrowRight.classList = "fa-solid fa-angle-right";
  const textSpanArrowRight = spanArrowRight.outerHTML;

  const navMain = document.getElementById("nav-main");
  const container = document.createDocumentFragment();

  // The label and input will create our responsive button that becomes visible instead of the menu in small screen sizes
  const label = document.createElement("label");
  label.className = "responsive-button";
  label.setAttribute("for", "responsive-button");

  const new_i = document.createElement("i");
  new_i.className = "fa-solid fa-bars";

  label.append(new_i);
  container.prepend(label);

  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.setAttribute("role", "button");
  input.setAttribute("id", "responsive-button");
  container.append(input);

  createTree(container, siteStructure);
  navMain.append(container);

  // The below is used to highlight the active page
  // elemActive is declared in the calling page. It is the key in the object site structure below
  let elem = document.getElementById(elemActive);

  // creates an array of self and parent headings in the menu bar
  const parentHeadings = getParentHeadings(elem);
  // console.log(parentHeadings);

  for (let heading of parentHeadings) {
    if (heading === elem) {
      heading.classList.add("active");
    } else {
      /*
      the sub-active class can be used like breadcrumbs to show the current page location
      ie. Navigation > Map Demos > GP Profiles
      The first two would be classed sub-active and the last active
      */
      heading.classList.add("sub-active");
    }
  }

  container.addEventListener("click", function () {
    this.classList.toggle("active");
  });

  function createTree(container, obj) {
    container.append(createTreeDom(obj));
  }

  function createTreeDom(obj, depth) {
    /*
    console.log({
      key: trackKey, // navbar text
      headingPosition: headingPosition, // This is the main (or parent) heading order ie 1st, 2nd...
      depth: depth, // 0 is a main heading, 1 is sub heading. 2 is sub heading of 1 etc
      // itemNumber: itemNumber, // a counter of each item
    });
  */
    // if there are no children, then the call returns undefined and the <ul> won't be created
    if (obj === undefined || !Object.keys(obj).length) return;

    const ul = document.createElement("ul");
    if (counter === 0) {
      counter++;
      ul.className = "nav-main";
    }

    if (typeof depth === "number") {
      // depth is used to identify recursion depth - ie. heading level
      depth++;
    } else {
      depth = 0; // initialise
    }

    for (let key in obj) {
      trackKey = key;
      itemNumber++;
      const li = document.createElement("li");
      // Give each item an id that will be the key (spaces removed) prefixed with 'nav-'
      li.setAttribute("id", `nav ${key}`.split(" ").join("-")); // remove any spaces and replace with a hyphen

      // add an id to the main headings only - this can then be selected to highlight as class active
      if (depth === 0) {
        headingPosition++;

        if (headingPosition === dataKeysCount) {
          // Used to identify the last main item which will have a class applied to align right
          // this was previously done is css but trickier with multi level headings
          li.classList.add("last-item");
        }
      }

      const anchor = document.createElement("a");
      // <a href='#...'>key text</a>
      anchor.setAttribute("href", obj[key][0]);
      anchor.innerHTML = key;

      let childrenUl = createTreeDom(obj[key][1], depth);

      if (childrenUl) {
        // Does the menu heading have any sub-menus
        // if so, add a has-children class
        li.classList.add("has-children");
        // then, add an arrow pointing down for sub menu off first level or pointing right for all subsequent levels.
        if (depth === 0) {
          // appendChild replaces any existing anchor so use insertAdjacentHTML
          anchor.insertAdjacentHTML("beforeend", textSpanArrowDown);
        } else {
          anchor.insertAdjacentHTML("beforeend", textSpanArrowRight);
        }
      }
      li.append(anchor);

      if (childrenUl) {
        li.append(childrenUl);
      }

      ul.append(li);
    }

    return ul;
  }
};

function createSiteStructure() {
  /*
Used to generate a nested object outlining the site structure
The object key is the name of the page, it's value is an array with a reference to its location
Demo uses an empty link, ["#"] for sub-headings that aren't a page
Subheadings are created by appending an additional object to the array using the same format

This structure is subsequently iterated over (using recursion so can be any depth) to generate the main and sub heading menus
*/

  // The is the main header
  const navMainTitles = {
    Home: ["index.html"],
    Navigation: ["#"],
    FAQ: ["#"],
    Blog: ["#"],
    "About Us": ["about_us.html"],
  };

  // Sub headings under 'Navigation'
  const subHeadingNavigation = {
    "dc Demos": ["#"],
    "Map Demos": ["#"],
    "D3 Learning": ["#"],
    "Testing": ["#"],
  };

  const subHeadingDCDemo = {
    ECDS: ["ecds.html"],
    Referrals: ["referrals.html"],
  };

  const subHeadingMapDemo = {
    PCNs: ["primary_care_networks.html"],
    "GP Profiles": ["gp_practice_profile.html"],
  };

  const subHeadingD3Learning = {
    Colours: ["d3_learning_colours.html"],
    // Axes: ["d3_learning_axis.html"],
    Canvas: ["d3_learning_canvas.html"],
    "Focus Chart": ["d3_learning_focus.html"],
  };

  const subHeadingTesting = {
    "GP api": ["gp_select_demo.html"],
    "Geo Projection": ["geo_projections.html"],
  };

  // Navigation
  // Add the subheadings to the appropriate section
  subHeadingNavigation["dc Demos"][1] = subHeadingDCDemo;
  subHeadingNavigation["Map Demos"][1] = subHeadingMapDemo;
  subHeadingNavigation["D3 Learning"][1] = subHeadingD3Learning;
  subHeadingNavigation["Testing"][1] = subHeadingTesting;
  // Update the section in the main heading
  navMainTitles.Navigation[1] = subHeadingNavigation;

  // Sub headings under 'Blog'
  const subHeadingBlog = {
    "Blog 1a": ["#"],
    "Blog 1b": ["#"],
  };
  navMainTitles.Blog[1] = subHeadingBlog;

  // Sub headings under 'About Us'
  const subHeadingAboutUs = { "Sub Contact": ["#"] };
  navMainTitles["About Us"][1] = subHeadingAboutUs;

  return navMainTitles;
}

function getParentHeadings(elem) {
  /*
const elem = document.getElementById('nav-Referrals');
const parents = getParentHeadings(elem);
*/

  // Set up a parent array
  const parents = [];

  // Push each parent element to the array
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.id.substring(0, 4) === "nav-") {
      parents.push(elem);
    }

    // Not interested in headings above this
    if (elem.parentNode.id === "nav-main") {
      break;
    }
  }

  // Return our parent array
  return parents;
}
