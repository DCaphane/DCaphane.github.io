(function createNavBarSide() {
  const containerNavSide = document.getElementById("article-left");

  const ul = document.createElement("ul");
  ul.className = "nav-side";
  ul.id = "side-nav";

  let sections = document.querySelectorAll("#article-right section");
  let i = 0;
  for (let section of sections) {
    const li = document.createElement("li");
    if (i === 0) {
      li.className = "active";
    }
    const anchor = document.createElement("a");

    anchor.setAttribute("href", "#" + section.id);
    let str = section.querySelectorAll("h2")[0].innerText;
    anchor.innerHTML = str; // .substring(0, 15); originally used to truncate long text

    li.appendChild(anchor);

    ul.appendChild(li);
    i += 1;
    /*
      // anchor
      console.log(section.id)
      // text to display
      console.log(section.querySelectorAll('h2')[0].innerText);
      */
  }

  containerNavSide.append(ul);
})();

// https://jsfiddle.net/mekwall/up4nu/
// Cache selectors

let mainElem = document.getElementById("article-right"),
  mainElemCoords,
  navItems = document.getElementById("side-nav"),
  itemsList = navItems.getElementsByTagName("li"),
  store = {}, // object to store id and top position within section
  mainItem;

// The click event is applied to the <li></li>, not the <a>
for (let item of itemsList) {
  item.addEventListener("click", function () {
    // https://javascript.info/styles-and-classes
    // toggle selected state on/ off
    let current = document.querySelector("#side-nav > li.active");

    if (current !== null) {
      // possible that there might not be an active class - returns null
      current.classList.remove("active");
    }
    // }
    this.classList.add("active");
  });
}

// Bind to scroll
// mainElem.addEventListener("scroll", function(e) {
// window.addEventListener("scroll", function(e) {
// testing only
//console.log("Yscroll: " + window.scrollY);
// let bottom = document.getElementById("nav-main");
//console.log("btm: " + bottom.getBoundingClientRect().bottom);
// });

// https://developer.mozilla.org/en-US/docs/Web/Events/scroll
// Reference: http://www.html5rocks.com/en/tutorials/speed/animations/

let last_known_scroll_position = 0,
  ticking = false;

function navHighlight(scroll_pos) {
  // do something with the scroll position
  for (let item of itemsList) {
    let str = item.children[0].getAttribute("href"), // the <a> element contains href attr
      coordsSection,
      topPosition,
      bottomPosition;

    const navMainHeight = 60,
      navMainTransitionAreaLower = navMainHeight * 2,
      navMainTransitionAreaUpper = navMainHeight * 3;

    // below was used when overscroll on separate element
    // mainElemCoords = 0; // 'mainElem.getBoundingClientRect(); //getCoords(mainElem);

    mainItem = mainElem.querySelector(str); //querySelectorAll
    coordsSection = mainItem.getBoundingClientRect();

    topPosition = coordsSection.top; // - mainElemCoords.top;
    bottomPosition = coordsSection.bottom; // - mainElemCoords.top;
    // console.log(str + ": " + topPosition + " - " + bottomPosition);

    if (
      topPosition <= navMainTransitionAreaUpper &&
      bottomPosition > navMainTransitionAreaUpper
    ) {
      item.classList.add("active");
      item.classList.remove("semi-active");
    } else if (
      topPosition > navMainHeight &&
      topPosition <= navMainTransitionAreaLower
    ) {
      item.classList.add("active");
    } else if (
      bottomPosition > navMainTransitionAreaLower &&
      bottomPosition <= navMainTransitionAreaUpper
    ) {
      item.classList.remove("active");
      item.classList.add("semi-active");
    } else {
      item.classList.remove("active", "semi-active");
    }
  }
}

window.addEventListener("scroll", function (e) {
  last_known_scroll_position = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function () {
      navHighlight(last_known_scroll_position);
      ticking = false;
    });

    ticking = true;
  }
});
