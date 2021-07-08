(function createNavBarSide() {
  /*
  Create a side bar based on the content of the 'sections' in the #article-right

  */
  const containerNavSide = document.getElementById("article-left"),
    sections = document.querySelectorAll("#article-right section");

  const ul = document.createElement("ul");
  ul.className = "nav-side";
  ul.id = "side-nav";

  let firstPass = true;
  for (let section of sections) {
    const li = document.createElement("li");
    if (firstPass) {
      // The first item will be highlighted by default
      li.className = "active";
      firstPass = false;
    }
    const anchor = document.createElement("a");
    anchor.setAttribute("href", "#" + section.id);

    const str = section.querySelectorAll("h2")[0].innerText;
    anchor.innerHTML = str;

    li.appendChild(anchor);
    ul.appendChild(li);
  }

  containerNavSide.append(ul);

  // Add a hyperlink to jump to section
  const navItems = document.getElementById("side-nav"),
    itemsList = navItems.getElementsByTagName("li");

  // The click event is applied to the <li></li>, not the <a>
  for (let item of itemsList) {
    item.addEventListener("click", function () {
      // https://javascript.info/styles-and-classes
      // toggle selected state on/ off
      const current = document.querySelector("#side-nav > li.active");

      if (current !== null) {
        // possible that there might not be an active class - returns null
        current.classList.remove("active");
      }
      // }
      this.classList.add("active");
    });
  }

  function navHighlight() {
    const mainElem = document.getElementById("article-right"),
      navMainHeight = 60,
      navMainTransitionAreaLower = navMainHeight * 2,
      navMainTransitionAreaUpper = navMainHeight * 3;

    // do something with the scroll position
    for (let item of itemsList) {
      const str = item.children[0].getAttribute("href"); // the <a> element contains href attr

      const mainItem = mainElem.querySelector(str), //querySelectorAll
        coordsSection = mainItem.getBoundingClientRect(),
        topPosition = coordsSection.top,
        bottomPosition = coordsSection.bottom;
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
    // let last_known_scroll_position = window.scrollY;
    let ticking = false;
    if (!ticking) {
      window.requestAnimationFrame(function () {
        navHighlight();
        ticking = false;
      });

      ticking = true;
    }
  });
})();

// https://jsfiddle.net/mekwall/up4nu/

// https://developer.mozilla.org/en-US/docs/Web/Events/scroll
// Reference: http://www.html5rocks.com/en/tutorials/speed/animations/

// Bind to scroll
// mainElem.addEventListener("scroll", function(e) {
// window.addEventListener("scroll", function(e) {
// testing only
//console.log("Yscroll: " + window.scrollY);
// let bottom = document.getElementById("nav-main");
//console.log("btm: " + bottom.getBoundingClientRect().bottom);
// });
