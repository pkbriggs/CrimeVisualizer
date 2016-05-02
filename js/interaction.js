
// Declaring constants
var width = 750,
  height = width;
var CRIME_CIRCLE_RADIUS = 3;
var PX_IN_MILE = 72.02; // thus, a radius of 144 would be 2.0mi


// globals
// var markers[0]["latlong_pos"] = [-122.429494, 37.798033]; // arbitrary initial position
// var markers[0]["latlong_pos"] = [-122.442380, 37.765325]; // arbitrary initial position
// var markers[1]["latlong_pos"] = [-122.413954, 37.780000]; // arbitrary initial position
// var markers[0]["radius"] = PX_IN_MILE * 1.0;
// var markers[1]["radius"] = PX_IN_MILE * 1.0;

var markers = [
  { // a
    "latlong_pos": [-122.429494, 37.798033], // arbitrary initial position in [long, lat] format
    "radius": PX_IN_MILE * 1.0, // initial size is a 1 mi radius
    "color": "red"
    // "xy_pos" // initially not set. is set from looking at the projection later
  },
  { // b
    "latlong_pos": [-122.413954, 37.780000], // arbitrary initial position in [long, lat] format
    "radius": PX_IN_MILE * 1.0, // initial size is a 1 mi radius
    "color": "green"
    // "xy_pos" // initially not set. is set from looking at the projection later
  }
];



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

function updateAAndBMarkers(svg, projection) {
  var drag = d3.behavior.drag()
    // .on('dragstart', function() { circle.style('fill', 'red'); })
    // .on('drag', function(d, i) { circle.attr('cx', d3.event.x)
                                  // .attr('cy', d3.event.y); })
    .on("drag", function(d, marker_num) {
      // d["xy_pos"][0] += d3.event.dx;
      // d["xy_pos"][1] += d3.event.dy;
      // updateAAndBMarkers(svg, projection);
      // d3.select(this).attr("transform", function(d,i) {
      //   console.log("in transform: d=");
      //   console.log(d);
      //   console.log(i);
      //   return "translate(" + [ d.x,d.y ] + ")"
      // });

      var marker = d3.select(this);
      var new_x = parseInt(marker.attr("cx")) + d3.event.dx;
      var new_y = parseInt(marker.attr("cy")) + d3.event.dy;

      markers[marker_num]["xy_pos"] = [new_x, new_y];

      d3.select(this).attr("cx", new_x);
      d3.select(this).attr("cy", new_y);

      $(".vis_container").trigger("updated_markers");
    });


    // .on('dragend', function() { circle.style('fill', 'black'); });


  // var a_coords = projection(markers[0]["latlong_pos"]);
  // var b_coords = projection(markers[1]["latlong_pos"]);


  // console.log("about to make markers");
  var markers_objs = svg.selectAll(".map_marker")
  // var markers_objs = svg.select(".map_marker")
    .data(markers)
    .enter()
    .append("circle")
    .attr("r", function(d, i) {
      return d["radius"];
    })
    .attr("fill", function(d, i) {
      return d["color"];
    })
    // .attr("stroke", "blue")
    .attr("opacity", 0.3)
    .attr("cx", function(d, i) {
      return d["xy_pos"][0];
    })
    .attr("cy", function(d, i) {
      return d["xy_pos"][1];
    })
    .call(drag);







  // var circle_a_props = {
  //   r: markers[0]["radius"],
  //   cx: markers[0]["xy_pos"][0],
  //   cy: markers[0]["xy_pos"][1],
  //   fill: "red",
  //   opacity: 0.3
  // };
  // // createCircle(svg, circle_a_props);
  // svg.append("circle").attr(circle_a_props).call(drag);

  // var circle_b_props = {
  //   r: markers[1]["radius"],
  //   cx: markers[1]["xy_pos"][0],
  //   cy: markers[0]["xy_pos"][1],
  //   fill: "green",
  //   opacity: 0.3
  // };
  // // createCircle(svg, circle_b_props);
  // svg.append("circle").attr(circle_b_props).call(drag);

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
  //   .attr("r", CRIME_CIRCLE_RADIUS)
  //   .attr("fill", "white")
  //   .attr("stroke", "black");

  // crime_circles.attr("cx", function(d) {
  //     projection(d["Location"])[0]
  //   }).attr("cy", function(d) {
  //     projection(d["Location"])[1]
  //   });


  // circle_props = {
  //   r: CRIME_CIRCLE_RADIUS,
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

  var filtered_data = data.filter(function(entry) {
    var crime_coords = projection(entry["Location"]);
    return crimeWithinMarkers(crime_coords);
  });

  var crime_circles = svg.selectAll("circle")
    .data(filtered_data)
    .enter()
    .append("circle")
    .attr("r", CRIME_CIRCLE_RADIUS)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("opacity", 0.8)
    .attr("cx", function(d) {
      return projection(d["Location"])[0];
    }).attr("cy", function(d) {
      return projection(d["Location"])[1];
    });

  // crime_circles.attr("cx", function(d) {
  //     return projection(d["Location"])[0];
  //   }).attr("cy", function(d) {
  //     return projection(d["Location"])[1];
  //   });

  // circle_props = {
  //   r: CRIME_CIRCLE_RADIUS,
  //   fill: "white",
  //   stroke: "black",
  //   opacity: 0.8
  // };
  // var a_coords = projection(markers[0]["latlong_pos"]);
  // var b_coords = projection(markers[1]["latlong_pos"]);

  // $.each(data, function(index, entry) {
  //   var crime_coords = projection(entry["Location"]);
  //   if (crimeWithinMarkers(crime_coords, a_coords, b_coords)) {
  //     circle_props["cx"] = crime_coords[0];
  //     circle_props["cy"] = crime_coords[1];
  //     createCircle(svg, circle_props);
  //   }
  // });
}


function createMap() {
  var projection = getMapProjection();
  var svg = createMapBaseImage();
  updateAAndBMarkers(svg, projection);

  loadCrimeData(function(data) {
    //addAllCrimeDataToMap(data, svg, projection);
    addCrimeDataWithinMarkers(data, svg, projection);

    $(".vis_container").on("updated_markers", function() {
      d3.selectAll("circle").remove();
      addCrimeDataWithinMarkers(data, svg, projection);
      updateAAndBMarkers(svg, projection);
    });
  });
}


$(document).ready(function() {
  createMap();
});
