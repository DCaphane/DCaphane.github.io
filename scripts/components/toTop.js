(function () {
  // Add an anchor (for to top) at end of document, after footer
  const anchor = document.createElement("a");
  // <a href='#...'>key text</a>
  anchor.setAttribute("href", "#");
  anchor.id = "btn-to-top";
  anchor.className = "cd-top js-cd-top";
  anchor.innerHTML = "Top";

  const refNode = document.getElementById("footer");
  refNode.insertAdjacentElement("afterend", anchor);

  // https://codyhouse.co/gem/back-to-top/
  const backTop = document.getElementsByClassName("js-cd-top")[0],
    // browser window scroll (in pixels) after which the "back to top" link is shown
    offset = 300,
    //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
    offsetOpacity = 1200,
    scrollDuration = 700;
  scrolling = false;
  if (backTop) {
    //update back to top visibility on scrolling
    window.addEventListener("scroll", function (event) {
      if (!scrolling) {
        scrolling = true;
        !window.requestAnimationFrame
          ? setTimeout(checkBackToTop, 250)
          : window.requestAnimationFrame(checkBackToTop);
      }
    });
    //smooth scroll to top
    backTop.addEventListener("click", function (event) {
      event.preventDefault();
      !window.requestAnimationFrame
        ? window.scrollTo(0, 0)
        : scrollTop(scrollDuration);
    });
  }

  function checkBackToTop() {
    const windowTop = window.scrollY || document.documentElement.scrollTop;
    windowTop > offset
      ? addClass(backTop, "cd-top--show")
      : removeClass(backTop, "cd-top--show", "cd-top--fade-out");
    windowTop > offsetOpacity && addClass(backTop, "cd-top--fade-out");
    scrolling = false;
  }

  function scrollTop(duration) {
    const start = window.scrollY || document.documentElement.scrollTop,
      currentTime = null;

    const animateScroll = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      const progress = timestamp - currentTime;
      const val = Math.max(
        Math.easeInOutQuad(progress, start, -start, duration),
        0
      );
      window.scrollTo(0, val);
      if (progress < duration) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  }

  Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  //class manipulations - needed if classList is not supported
  function hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);
    else
      return !!el.className.match(
        new RegExp("(\\s|^)" + className + "(\\s|$)")
      );
  }
  function addClass(el, className) {
    const classList = className.split(" ");
    if (el.classList) el.classList.add(classList[0]);
    else if (!hasClass(el, classList[0])) el.className += " " + classList[0];
    if (classList.length > 1) addClass(el, classList.slice(1).join(" "));
  }
  function removeClass(el, className) {
    const classList = className.split(" ");
    if (el.classList) el.classList.remove(classList[0]);
    else if (hasClass(el, classList[0])) {
      const reg = new RegExp("(\\s|^)" + classList[0] + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
    if (classList.length > 1) removeClass(el, classList.slice(1).join(" "));
  }
})();
