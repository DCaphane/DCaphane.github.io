/*
https://codepen.io/billdwhite/pen/rgEbc
https://www.fabiofranchino.com/blog/efficient-tooltip-positioning-in-d3js-chart/
  https://github.com/fabiofranchino/efficient-element-positioning/blob/master/app/script.js

https://stackoverflow.com/questions/16256454/d3-js-position-tooltips-using-element-position-not-mouse-position
*/

function createTooltip() {
  function tooltip(id) {
    const t = d3
      .select(id)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      // .style("offset", [10, -20])
      .style("width", "100px")
      .style("height", "50px")
      .style("padding", "2px")
      .style("background", "rgba(0,0,0,.8)")
      .style("border", "2px solid black")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("text-align", "center")
      .style("font", "12px sans-serif")
      .style("color", "white") // font colour
      .style("z-index", "999"); // bring tooltip to front

    return t;
  }

  // Tooltip Functions
  // function that change the tooltip when user hover / move / leave a cell

  function mouseover(tooltip, str, event, pos, x = 0, y = 0) {
    /*
    event can be used to position tooltip when mouse enters but this can be variable
    Use const pos = this.getBoundingClientRect() to put tooltip in a constant (y) position
    https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

    Separate x and y variables can be passed to adjust if it suits appropriate chart (-x shift left, -y shift up)

    Any transition here and tooltip can get stuck.
    Tried auto-incrementing counter variable (counter++) and passing this as name to transition parameter but no effect
    */
    const tooltipWidth = parseInt(tooltip.style("width")),
      tooltipHeight = parseInt(tooltip.style("height"));
    // console.log({w: tooltipWidth, h: tooltipHeight})

    tooltip.style("opacity", 0.9); // .transition().duration(50)
    tooltip
      .html(str)
      .style("left", `${event.pageX - tooltipWidth / 2 + x}px`) // d3 but tooltip appears where the mouse enters
      // .style("top", `${event.pageY}px`) // d3 but tooltip appears where the mouse enters
      // .style(
      //   "left",
      //   `${window.scrollY + pos.left + pos.width / 2 - tooltipWidth / 2 + x}px`
      // )
      .style("top", `${window.scrollY + pos.y - tooltipHeight - 5 + y}px`); // scrollY is how far down page scrolled, pos.Y is relative to viewport
  }

  function mousemoveH(tooltip, str, event, pos, x = 0, y = 0) {
    /*
    moving tooltip for horizontal bars
    */
    const tooltipWidth = parseInt(tooltip.style("width")),
      tooltipHeight = parseInt(tooltip.style("height"));
    // console.log({w: tooltipWidth, h: tooltipHeight})

    tooltip.style("opacity", 0.9); // .transition().duration(50)
    tooltip
      .html(str)
      .style("left", `${event.pageX - tooltipWidth / 2 + x}px`) // d3 but tooltip appears where the mouse enters
      // .style("top", `${event.pageY - tooltipHeight - 5 + y}px`) // d3 but tooltip appears where the mouse enters
      // .style(
      //   "left",
      //   `${window.scrollY + pos.left + pos.width / 2 - tooltipWidth / 2 + x}px`
      // )
      .style("top", `${window.scrollY + pos.y - tooltipHeight - 5 + y}px`); // scrollY is how far down page scrolled, pos.Y is relative to viewport
  }

  function mousemoveV(tooltip, str, event, pos, x = 0, y = 0) {
    /*
    moving tooltip for vertical bars
    */
    const tooltipWidth = parseInt(tooltip.style("width")),
      tooltipHeight = parseInt(tooltip.style("height"));
    // console.log({w: tooltipWidth, h: tooltipHeight})

    tooltip.style("opacity", 0.9); // .transition().duration(50)
    tooltip
      .html(str)
      .style("left", `${event.pageX - tooltipWidth / 2 + x}px`) // d3 but tooltip appears where the mouse enters
      .style("top", `${event.pageY - tooltipHeight - 5 + y}px`); // d3 but tooltip appears where the mouse enters
    // .style(
    //   "left",
    //   `${window.scrollY + pos.left + pos.width / 2 - tooltipWidth / 2 + x}px`
    // )
    // .style("top", `${window.scrollY + pos.y - tooltipHeight - 5 + y}px`); // scrollY is how far down page scrolled, pos.Y is relative to viewport
  }

  function mouseout(tooltip) {
    tooltip.style("opacity", 0);
    // tooltip just fades away if transition set
    // tooltip.transition().duration(500).style("opacity", 0);
  }

  function click(event, [, , i]) {
    console.log(i);
  }

  // function mousedowned(event, [, , i]) {
  //   d3.select(this)
  //     .transition()
  //     .attr("fill", "black")
  //     .attr("r", radius * 2)
  //     .transition()
  //     .attr("fill", d3.interpolateRainbow(i / 360))
  //     .attr("r", radius);
  // }

  return {
    tooltip: tooltip,
    mouseover: mouseover,
    mousemoveH: mousemoveH,
    mousemoveV: mousemoveV,
    // tooltipText: tooltipText,
    mouseout: mouseout,
    click: click,
    // mousedowned: mousedowned,
  };
}
