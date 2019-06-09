// https://javascript.info/modifying-document#a-word-about-document-write
// https://plnkr.co/edit/LJbzzvqdwGaf2iojgymr?p=preview

// Object consisting of main headers and a subsequent array of nav link and subsequent links
const dataNavMain = {
	Home: ['index.html', {}],
	Navigation: [
		'#',
		{
			'Demos': [
				'#',
				{
					'ECDS': ['ecds.html', {}],
          'PCNs': ['primary_care_networks.html', {}],
          'GP Profiles': ['gp_practice_profile.html', {}]
				}
			],
			'Nav 2': ['#', {}],
			'Nav 3': [
				'#',
				{
					'Nav 3a': ['#', {}],
					'Nav 3b': ['#', {}],
					'Nav 3c': ['#', {}]
				}
			],
			'Nav 4': ['#', {}],
			'Nav 5': ['#', {}]
		}
	],
	FAQ: ['#', {}],
	Blog: [
		'#',
		{
			'Blog 1': [
				'#',
				{
					'Blog 1a': ['#', {}],
					'Blog 1b': ['#', {}]
				}
			]
		}
	],
	'About Us': ['about_us.html', { 'Sub Contact': ['#', {}] }]
};

// Tried using appendChild but this replaces existing nodes.
// Use insertAdjacentHTML instead. This requires element as text string.
// Down and Right arrows used to identify sub menus (Down for first level, right for all subsequent levels)
const spanArrowDown = document.createElement("span");
spanArrowDown.className = "fas fa-angle-down";
const textSpanArrowDown = spanArrowDown.outerHTML;

const spanArrowRight = document.createElement("span");
spanArrowRight.classList = "fas fa-angle-right";
const textSpanArrowRight = spanArrowRight.outerHTML;

let counter = 0;
const dataKeysCount = Object.keys(dataNavMain).length;

const container = document.getElementById("nav-main");

// The label and input will create our responsive button that becomes visible instead of the menu in small screen sizes
const label = document.createElement("label");
label.className = "responsive-button";
label.setAttribute("for", "responsive-button");

const new_i = document.createElement("i");
new_i.className = "fas fa-bars";

label.appendChild(new_i);
container.prepend(label);

const input = document.createElement("input");
input.setAttribute("type", "checkbox");
input.setAttribute("role", "button");
input.id = "responsive-button";
container.append(input);

createTree(container, dataNavMain);

// The below is used to highlight the active page
// elemActive is declared in the calling page
let elem = document.getElementById(elemActive);
elem.className += " " + "active";

container.addEventListener("click", function() {
  this.classList.toggle("active");
});

function createTree(container, obj) {
  container.append(createTreeDom(obj));
}

function createTreeDom(obj, subCounter) {
  // if there's no children, then the call returns undefined
  // and the <ul> won't be created
  if (!Object.keys(obj).length) return;

  const ul = document.createElement("ul");
  if (counter === 0) {
    ul.className = "nav-main";
  }

  if (typeof subCounter === "number") {
    // subCounter is used to identify recursion depth - ie. heading level
    subCounter++;
  } else {
    subCounter = 0; // initialise
  }

  for (let key in obj) {
    const li = document.createElement("li");

    // add an id to the main headings only - this can then be selected to highlight as class active
    if (subCounter === 0) {
      li.setAttribute("id", key.split(" ").join("-")); // remove any spaces and replace with
      if (counter === dataKeysCount) {
        // Used to identify the last main item which will have a class applied to align right
        // this was previously done is css but trickier with multi level headings
        li.className += " " + "last-item";
      }
    }

    const anchor = document.createElement("a");
    // <a href='#...'>key text</a>
    anchor.setAttribute("href", obj[key][0]);
    anchor.innerHTML = key;

    let childrenUl = createTreeDom(obj[key][1], subCounter);

    if (childrenUl) {
      // Does the menu heading have any sub-menus
      // if so, add a has-childnre class
      li.className += " " + "has-children";
      // then, add an arrow pointing down for sub menu off first level or pointing right for all subsequent levels.
      if (subCounter === 0) {
        // appendChild replaces any existing anchor so use insertAdjacentHTML
        anchor.insertAdjacentHTML("beforeend", textSpanArrowDown);
      } else {
        anchor.insertAdjacentHTML("beforeend", textSpanArrowRight);
      }
    }
    li.appendChild(anchor);

    if (childrenUl) {
      li.append(childrenUl);
    }

    ul.append(li);
  }

  // Used to identify first pass...
  counter++;
  return ul;
}
