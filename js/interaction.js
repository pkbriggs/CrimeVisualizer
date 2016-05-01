
// Declaring constants
var width = 750,
  height = width;
var circleRadius = 3;


function getMapProjection() {
  // Set up projection that map is using
  return d3.geo.mercator()
    .center([-122.433701, 37.767683]) // San Francisco, roughly
    .scale(225000)
    .translate([width / 2, height / 2]);
  // This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
  // projection([lon, lat]) returns [x, y]
}

function createMapBaseImage() {
  // Add an svg element to the DOM
  var svg = d3.select(".vis_container").append("svg")
    .attr("width", width)
    .attr("height", height);

  // Add svg map at correct size, assumes map is saved in a subdirectory called "data"
  svg.append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("xlink:href", "../data/sf-map.svg");

  return svg;
}

function createCircleAtLocation(svg, coords) {
  var circle = svg.append("circle").attr({
      cx: coords[0],
      cy: coords[1],
      r: circleRadius,
      fill: "white",
      stroke: "black"
  });
  return circle;
}

function loadCrimeData(callback) {
  d3.json("../data/scpd_incidents.json", function(dataObject) {
    data = dataObject["data"];
    callback(data);
  });
}


function createMap() {
  var projection = getMapProjection();
  var svg = createMapBaseImage();

  loadCrimeData(function(data) {
    $.each(data, function(index, entry) {
      var coords = projection(entry["Location"]);
      createCircleAtLocation(svg, coords);
    });
  });
}


$(document).ready(function() {
  createMap();
});





// --- Playing with circles ---
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
