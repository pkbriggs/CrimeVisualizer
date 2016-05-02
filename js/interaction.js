
// Declaring constants
var width = 750,
  height = width;
var PX_IN_MILE = 72.02; // thus, a radius of 144 would be 2.0mi

// customizable
var CRIME_CIRCLE_RADIUS = 3;
var CRIME_CIRCLE_FILL_COLOR = "white";
var CRIME_CIRCLE_STROKE_COLOR = "black";
var MARKER_A_FILL_COLOR = "red";
var MARKER_A_STROKE_COLOR = "transparent";
var MARKER_B_FILL_COLOR = "green";
var MARKER_B_STROKE_COLOR = "transparent";
var MARKER_A_IMAGE_FILE = "../img/marker.png";
var MARKER_B_IMAGE_FILE = "../img/marker.svg";


var markers = [
  { // a
    "latlong_pos": [-122.429494, 37.798033], // arbitrary initial position in [long, lat] format
    "radius": PX_IN_MILE * 1.0, // initial size is a 1 mi radius
    "fill_color": MARKER_A_FILL_COLOR,
    "stroke_color": MARKER_A_STROKE_COLOR,
    "image_file": MARKER_A_IMAGE_FILE
    // "xy_pos" // initially not set. is set from looking at the projection later
  },
  { // b
    "latlong_pos": [-122.413954, 37.780000], // arbitrary initial position in [long, lat] format
    "radius": PX_IN_MILE * 1.0, // initial size is a 1 mi radius
    "fill_color": MARKER_B_FILL_COLOR,
    "stroke_color": MARKER_B_STROKE_COLOR,
    "image_file": MARKER_B_IMAGE_FILE
    // "xy_pos" // initially not set. is set from looking at the projection later
  }
];

var data_within_intersection = [];
var marker_images = [];



function getMapProjection() {
  // Set up projection that map is using
  var projection = d3.geo.mercator()
    .center([-122.433701, 37.767683]) // San Francisco, roughly
    .scale(225000)
    .translate([width / 2, height / 2]);
  // This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
  // projection([lon, lat]) returns [x, y]

  markers[0]["xy_pos"] = projection(markers[0]["latlong_pos"]);
  markers[1]["xy_pos"] = projection(markers[1]["latlong_pos"]);

  return projection;
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

function setMarkerRadius(marker, radius_in_miles) {
  // given a radius in miles from the user, update the radius of the marker (in pixels)
  if (marker == "a")
    markers[0]["radius"] = radius_in_miles * PX_IN_MILE;
  else
    markers[1]["radius"] = radius_in_miles * PX_IN_MILE;
}

function loadCrimeData(callback) {
  d3.json("../data/scpd_incidents.json", function(dataObject) {
    data = dataObject["data"];
    callback(data);
  });
}

function updateAAndBMarkers(svg, projection) {
  // create drag behavior so we can attach it to the markers
  var drag = d3.behavior.drag()
    // .on('dragstart', function() { circle.style('fill', 'red'); })
    // .on('drag', function(d, i) { circle.attr('cx', d3.event.x)
                                  // .attr('cy', d3.event.y); })
    // .on('dragend', function() { circle.style('fill', 'black'); });
    .on("drag", function(d, marker_num) {
      var new_x = markers[marker_num]["xy_pos"][0] + d3.event.dx;
      var new_y = markers[marker_num]["xy_pos"][1] + d3.event.dy;

      markers[marker_num]["xy_pos"] = [new_x, new_y];

      d3.select(this).attr("cx", new_x);
      d3.select(this).attr("cy", new_y);

      $(".vis_container").trigger("updated_markers");
    });


  var marker_elems = svg.selectAll(".map_marker")
    .data(markers);

  // create the parent element
  var markers_enter = marker_elems.enter().append("g").call(drag); // have the drag call on this (the parent) element so both the circle and image get it


  // create the circle element
  var circles = markers_enter.append("circle")
    .attr("r", function(d, i) {
      return d["radius"];
    })
    .attr("fill", function(d, i) {
      return d["fill_color"];
    })
    .attr("stroke", function(d, i) {
      return d["stroke_color"];
    })
    .attr("opacity", 0.25)
    // .attr("stroke", "#333")
    .attr("class", "map_marker");

  circles.attr("cx", function(d, i) {
      return d["xy_pos"][0];
    })
    .attr("cy", function(d, i) {
      return d["xy_pos"][1];
    });


  // create the marker image
  marker_images = markers_enter.append("image")
    .attr("xlink:href", function(d, i) {
      return d["image_file"];
    })
    .attr("x", function(d, i) {
      return d["xy_pos"][0] - 32/2;
    })
    .attr("y", function(d, i) {
      return d["xy_pos"][1] - 32/2;
    })
    .attr("height", 32)
    .attr("width", 32)
    .attr("class", "map_marker_image");

  // ensure the marker is properly removed at the end of its life
  marker_elems.exit().remove();
}

function crimeWithinMarkers(crime_coords) {
  var a_coords = markers[0]["xy_pos"];
  var b_coords = markers[1]["xy_pos"];

  // see if it is within marker A's radius
  var a_x_difference = Math.pow(crime_coords[0] - a_coords[0], 2); // (x2 - x1)^2
  var a_y_difference = Math.pow(crime_coords[1] - a_coords[1], 2); // (x2 - x1)^2
  var distance_from_a = Math.sqrt(a_x_difference + a_y_difference);

  if (distance_from_a > markers[0]["radius"]) // if the distance is larger than A's radius, it does not fall within A, so it is too far
    return false;

  var b_x_difference = Math.pow(crime_coords[0] - b_coords[0], 2); // (x2 - x1)^2
  var b_y_difference = Math.pow(crime_coords[1] - b_coords[1], 2); // (x2 - x1)^2
  var distance_from_b = Math.sqrt(b_x_difference + b_y_difference);

  if (distance_from_b > markers[1]["radius"]) // if the distance is larger than B's radius, it does not fall within B, so it is too far
    return false;

  // it is within the radius for both A and B, so it must fall in our intersection area!
  return true;
}


function addCrimeDataWithinMarkers(data, svg, projection) {
  var crime_circles = svg.selectAll(".crime_circle")
    .data(window.data_within_intersection, function(d, i) {
      return d["IncidentNumber"];
    });

  crime_circles.enter()
    .append("circle")
    .attr("r", CRIME_CIRCLE_RADIUS)
    .attr("fill", CRIME_CIRCLE_FILL_COLOR)
    .attr("stroke", CRIME_CIRCLE_STROKE_COLOR)
    .attr("opacity", 0.8)
    .attr("cx", function(d) {
      return projection(d["Location"])[0];
    }).attr("cy", function(d) {
      return projection(d["Location"])[1];
    });

  crime_circles.exit().remove();
}


function createMap() {
  var projection = getMapProjection();
  var svg = createMapBaseImage();
  updateAAndBMarkers(svg, projection);

  loadCrimeData(function(data) {
    //addAllCrimeDataToMap(data, svg, projection);
    data_within_intersection = data.filter(function(entry) {
      var crime_coords = projection(entry["Location"]);
      return crimeWithinMarkers(crime_coords);
    });

    addCrimeDataWithinMarkers(data, svg, projection);

    $(".vis_container").on("updated_markers", function() {
      window.data_within_intersection = data.filter(function(entry) {
        var crime_coords = projection(entry["Location"]);
        return crimeWithinMarkers(crime_coords);
      });
      console.log("new len of data: " + data_within_intersection.length);
      d3.selectAll("circle").remove();
      // d3.selectAll(".map_marker").remove();
      marker_images.remove();

      addCrimeDataWithinMarkers(data, svg, projection);
      updateAAndBMarkers(svg, projection);
    });
  });
}


$(document).ready(function() {
  createMap();
});
