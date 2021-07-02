// https://javascript.info/modifying-document#a-word-about-document-write
// https://plnkr.co/edit/LJbzzvqdwGaf2iojgymr?p=preview

(function createNavBarMain() {
  // Object consisting of main headers and a subsequent array of nav link and subsequent links
  const dataNavMain = {
    Home: ["index.html", {}],
    Navigation: [
      "#",
      {
        "dc Demos": [
          "#",
          {
            ECDS: ["ecds.html", {}],
            Referrals: ["referrals.html", {}],
          },
        ],
        "Map Demos": [
          "#",
          {
            PCNs: ["primary_care_networks.html", {}],
            "GP Profiles": ["gp_practice_profile.html", {}],
          },
        ],
        "D3 Learning": [
          "#",
          {
            "Nav 3a": ["d3_learning_colours.html", {}],
            "Nav 3b": ["d3_learning_axis.html", {}],
            "Nav 3c": ["d3_learning_canvas.html", {}],
            "Nav 3d": ["#", {}],
          },
        ],
        "Nav 4": [
          "#",
          {
            "Nav 4a": ["#", {}],
            "Nav 4b": ["#", {}],
            "Nav 4c": ["#", {}],
          },
        ],
        "Nav 5": ["#", {}],
      },
    ],
    FAQ: ["#", {}],
    Blog: [
      "#",
      {
        "Blog 1": [
          "#",
          {
            "Blog 1a": ["#", {}],
            "Blog 1b": ["#", {}],
          },
        ],
      },
    ],
    "About Us": ["about_us.html", { "Sub Contact": ["#", {}] }],
  };

  // To keep track of recursion depth
  let counter = 0,
    itemNumber = 0,
    trackKey = 0,
    headingPosition = 0;

  const arrDataKeys = Object.keys(dataNavMain), // An array of the top level headings only
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

  createTree(container, dataNavMain);
  navMain.append(container);

  // The below is used to highlight the active page
  // elemActive is declared in the calling page
  let elem = document.getElementById(elemActive);
  elem.classList.add("active");

  container.addEventListener("click", function () {
    this.classList.toggle("active");
  });

  function createTree(container, obj) {
    container.append(createTreeDom(obj));
  }

  function createTreeDom(obj, depth) {
    // console.log({
    //   key: trackKey, // navbar text
    //   headingPosition: headingPosition, // This is the main heading order ie 1st, 2nd...
    //   depth: depth, // 0 is a main heading, 1 is sub heading. 2 is sub heading of 1 etc
    //   // itemNumber: itemNumber, // a counter of each item
    // });

    // if there are no children, then the call returns undefined and the <ul> won't be created
    if (!Object.keys(obj).length) return;

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

      // add an id to the main headings only - this can then be selected to highlight as class active
      if (depth === 0) {
        headingPosition++;
        li.setAttribute("id", key.split(" ").join("-")); // remove any spaces and replace with a hyphen

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
})();
