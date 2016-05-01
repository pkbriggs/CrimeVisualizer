
// Declaring constants
var width = 750,
  height = width;
var circleRadius = 3;
// var AB_CIRCLE_RADIUS = 100;
// var INITIAL_A_POSITION = [-122.429494, 37.798033];
// var INITIAL_B_POSITION = [-122.413954, 37.780000];


// globals
var a_position = [-122.429494, 37.798033]; // arbitrary initial position
var b_position = [-122.413954, 37.780000]; // arbitrary initial position
var a_radius = 60;
var b_radius = 100;


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

function createCircle(svg, props) {
  var circle = svg.append("circle").attr(props);
  return circle;
}

function loadCrimeData(callback) {
  d3.json("../data/scpd_incidents.json", function(dataObject) {
    data = dataObject["data"];
    callback(data);
  });
}

function createAAndBMarkers(svg, projection) {
  var a_coords = projection(a_position);
  var b_coords = projection(b_position);

  var circle_a_props = {
    r: a_radius,
    cx: a_coords[0],
    cy: a_coords[1],
    fill: "red",
    opacity: 0.3
  };
  createCircle(svg, circle_a_props);

  var circle_b_props = {
    r: b_radius,
    cx: b_coords[0],
    cy: b_coords[1],
    fill: "green",
    opacity: 0.3
  };
  createCircle(svg, circle_b_props);

  // shows the overlap between the two circles
  // var interPoints = intersection(a_coords[0], a_coords[1], AB_CIRCLE_RADIUS, b_coords[0], b_coords[1], AB_CIRCLE_RADIUS);
  // // credit: http://stackoverflow.com/questions/33330074/d3-js-detect-intersection-area
  // svg.append("g")
  //   .append("path")
  //   .attr("d", function() {
  //     return "M" + interPoints[0] + "," + interPoints[2] + "A" + AB_CIRCLE_RADIUS + "," + AB_CIRCLE_RADIUS +
  //       " 0 0,1 " + interPoints[1] + "," + interPoints[3]+ "A" + AB_CIRCLE_RADIUS + "," + AB_CIRCLE_RADIUS +
  //       " 0 0,1 " + interPoints[0] + "," + interPoints[2];
  //   })
  //   .style('fill', 'purple');
}

function addAllCrimeDataToMap(data, svg, projection) {
  // var crime_circles = svg.selectAll("circle")
  //   .data(data)
  //   .enter()
  //   .append("circle")
  //   .attr("r", circleRadius)
  //   .attr("fill", "white")
  //   .attr("stroke", "black");

  // crime_circles.attr("cx", function(d) {
  //     projection(d["Location"])[0]
  //   }).attr("cy", function(d) {
  //     projection(d["Location"])[1]
  //   });


  // circle_props = {
  //   r: circleRadius,
  //   fill: "white",
  //   "stroke": "black"
  // };

  // $.each(data, function(index, entry) {
  //   var coords = projection(entry["Location"]);
  //   circle_props["cx"] = coords[0];
  //   circle_props["cy"] = coords[1];
  //   createCircle(svg, circle_props);
  // });
}

function updateMarkerARadius(radius) {

}

function crimeWithinMarkers(crime_coords, a_coords, b_coords, a_radius, b_radius) {
  // see if it is within marker A's radius
  var a_x_difference = Math.pow(crime_coords[0] - a_coords[0], 2); // (x2 - x1)^2
  var a_y_difference = Math.pow(crime_coords[1] - a_coords[1], 2); // (x2 - x1)^2
  var distance_from_a = Math.sqrt(a_x_difference + a_y_difference);

  if (distance_from_a > a_radius) // if the distance is larger than A's radius, it does not fall within A, so it is too far
    return false;

  var b_x_difference = Math.pow(crime_coords[0] - b_coords[0], 2); // (x2 - x1)^2
  var b_y_difference = Math.pow(crime_coords[1] - b_coords[1], 2); // (x2 - x1)^2
  var distance_from_b = Math.sqrt(b_x_difference + b_y_difference);

  if (distance_from_b > b_radius) // if the distance is larger than B's radius, it does not fall within B, so it is too far
    return false;

  // it is within the radius for both A and B, so it must fall in our intersection area!
  return true;
}


function addCrimeDataWithinMarkers(data, svg, projection) {
  var a_coords = projection(a_position);
  var b_coords = projection(b_position);

  var filtered_data = data.filter(function(entry) {
    var crime_coords = projection(entry["Location"]);
    return crimeWithinMarkers(crime_coords, a_coords, b_coords, a_radius, b_radius);
  });

  var crime_circles = svg.selectAll("circle")
    .data(filtered_data)
    .enter()
    .append("circle")
    .attr("r", circleRadius)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("opacity", 0.8);

  crime_circles.attr("cx", function(d) {
      return projection(d["Location"])[0];
    }).attr("cy", function(d) {
      return projection(d["Location"])[1];
    });

  // circle_props = {
  //   r: circleRadius,
  //   fill: "white",
  //   stroke: "black",
  //   opacity: 0.8
  // };
  // var a_coords = projection(a_position);
  // var b_coords = projection(b_position);

  // $.each(data, function(index, entry) {
  //   var crime_coords = projection(entry["Location"]);
  //   if (crimeWithinMarkers(crime_coords, a_coords, b_coords, a_radius, b_radius)) {
  //     circle_props["cx"] = crime_coords[0];
  //     circle_props["cy"] = crime_coords[1];
  //     createCircle(svg, circle_props);
  //   }
  // });
}


function createMap() {
  var projection = getMapProjection();
  var svg = createMapBaseImage();
  createAAndBMarkers(svg, projection);

  loadCrimeData(function(data) {
    //addAllCrimeDataToMap(data, svg, projection);
    addCrimeDataWithinMarkers(data, svg, projection);

    $(".vis_container").on("updated_markers", function() {
      d3.selectAll("circle").remove();
      addCrimeDataWithinMarkers(data, svg, projection);
      createAAndBMarkers(svg, projection);
    });
  });
}


$(document).ready(function() {
  createMap();
});






////////// UTILITY FUNCTIONS
// this intersection code source: http://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci/12221389#12221389
function intersection(x0, y0, r0, x1, y1, r1) {
  var a, dx, dy, d, h, rx, ry;
  var x2, y2;

  /* dx and dy are the vertical and horizontal distances between
   * the circle centers.
   */
  dx = x1 - x0;
  dy = y1 - y0;

  /* Determine the straight-line distance between the centers. */
  d = Math.sqrt((dy*dy) + (dx*dx));

  /* Check for solvability. */
  if (d > (r0 + r1)) {
      /* no solution. circles do not intersect. */
      return false;
  }
  if (d < Math.abs(r0 - r1)) {
      /* no solution. one circle is contained in the other */
      return false;
  }

  /* 'point 2' is the point where the line through the circle
   * intersection points crosses the line between the circle
   * centers.
   */

  /* Determine the distance from point 0 to point 2. */
  a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

  /* Determine the coordinates of point 2. */
  x2 = x0 + (dx * a/d);
  y2 = y0 + (dy * a/d);

  /* Determine the distance from point 2 to either of the
   * intersection points.
   */
  h = Math.sqrt((r0*r0) - (a*a));

  /* Now determine the offsets of the intersection points from
   * point 2.
   */
  rx = -dy * (h/d);
  ry = dx * (h/d);

  /* Determine the absolute intersection points. */
  var xi = x2 + rx;
  var xi_prime = x2 - rx;
  var yi = y2 + ry;
  var yi_prime = y2 - ry;

  return [xi, xi_prime, yi, yi_prime];
}


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
