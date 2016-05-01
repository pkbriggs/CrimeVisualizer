
// Declaring constants
var width = 750,
  height = width;


function createMap() {
  // Set up projection that map is using
  var projection = d3.geo.mercator()
    .center([-122.433701, 37.767683]) // San Francisco, roughly
    .scale(225000)
    .translate([width / 2, height / 2]);
  // This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
  // projection([lon, lat]) returns [x, y]

  // Add an svg element to the DOM
  var svg = d3.select(".vis_container").append("svg")
    .attr("width", width)
    .attr("height", height);

  // Add svg map at correct size, assumes map is saved in a subdirectory called "data"
  svg.append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("xlink:href", "../data/sf-map.svg");
}







// --- Playing with circles ---
// var originX = 200;
// var originY = 200;
// var circleRadius = 100;
// var circle = svg.append("circle").attr({
//     cx: originX,
//     cy: originY,
//     r: circleRadius,
//     fill: "white",
//     stroke: "black"
// });

// function updateRadius(nRadius) {
//   d3.select("#radiusSlider").property("value", nRadius);

//   // update the circle radius
//   svg.selectAll("circle")
//     .attr("r", nRadius);
// }

// d3.select("#radiusSlider").on("input", function() {
//   updateRadius(+this.value);
// });
