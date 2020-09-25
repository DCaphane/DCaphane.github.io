function Tooltip(id) {
  const t = d3
    .select(id)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("offset", [10, -20])
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
    .style("color", "white"); // font colour

  return t;
}

// Tooltip Functions
// function that change the tooltip when user hover / move / leave a cell

function mouseover(item, tooltip) {
  tooltip.transition().duration(200).style("opacity", 1);
  // item.style("stroke", "black").style("opacity", 1);
}

function tooltipText(t, str, event) {
  t.html(str)
    .style("left", event.pageX + "px") // event.pageX + 'px' // d3.select(this).attr("cx") + "px"
    .style("top", event.pageY - 28 + "px"); // event.pageY - 28 + 'px'); // d3.select(this).attr("cy") + "px"
}

function mouseleave(item, tooltip) {
  tooltip.style("opacity", 0);
  // item.style("stroke", "none").style("opacity", 0.8);
}

function click(event, [, , i]) {
  console.log(i);
}

function mousedowned(event, [, , i]) {
  d3.select(this)
    .transition()
    .attr("fill", "black")
    .attr("r", radius * 2)
    .transition()
    .attr("fill", d3.interpolateRainbow(i / 360))
    .attr("r", radius);
}
