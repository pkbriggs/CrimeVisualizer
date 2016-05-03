
// Declaring constants
var width = $(window).width() - 300,
  height = width;
var PX_IN_MILE = 72.02; // thus, a radius of 144 would be 2.0mi

// customizable
var CRIME_CIRCLE_RADIUS = 2;
var CRIME_CIRCLE_RADIUS_SMALLER = 1;
var CRIME_CIRCLE_RADIUS_SMALLEST = 0.5;
var CRIME_CIRCLE_FILL_COLOR = "transparent";
var CRIME_CIRCLE_STROKE_COLOR = "#333";
var MARKER_A_FILL_COLOR = "#9A9A9A";
var MARKER_A_STROKE_COLOR = "transparent";
var MARKER_B_FILL_COLOR = "#565656";
var MARKER_B_STROKE_COLOR = "transparent";
var MARKER_A_IMAGE_FILE = "../img/markerB.png";
var MARKER_B_IMAGE_FILE = "../img/marker.png";


var CRIME_COLORS = ["#E94345", "#FE7B23", "#FEC037", "#8CBA19", "#58ADA6", "#3E97CF", "#783F68", "#AB4189", "#EB4E85"];
var CRIME_COLORS_MAP = {
  "ASSAULT": CRIME_COLORS[0],
  "MISSING PERSON": CRIME_COLORS[1],
  "WARRANTS": CRIME_COLORS[2],
  "SUSPICIOUS ACTIVITY": CRIME_COLORS[3],
  "NON-CRIMINAL": CRIME_COLORS[4],
  "THEFT": CRIME_COLORS[5],
  "DRUG/NARCOTIC": CRIME_COLORS[6],
  "VANDALISM": CRIME_COLORS[7],
  "OTHER": CRIME_COLORS[8]
}

var CRIME_CATEGORY_MAP = {
  "ARSON": "OTHER",
  "ASSAULT": "ASSAULT",
  "BRIBERY": "NON-CRIMINAL",
  "BURGLARY": "OTHER",
  "DISORDERLY CONDUCT": "SUSPICIOUS ACTIVITY",
  "DRIVING UNDER THE INFLUENCE": "OTHER",
  "DRUG/NARCOTIC": "DRUG/NARCOTIC",
  "DRUNKENNESS": "DRUG/NARCOTIC",
  "EMBEZZLEMENT": "THEFT",
  "EXTORTION": "THEFT",
  "FAMILY OFFENSES": "OTHER",
  "FORGERY/COUNTERFEITING": "THEFT",
  "FRAUD": "THEFT",
  "GAMBLING": "OTHER",
  "KIDNAPPING": "MISSING PERSON",
  "LARCENY/THEFT": "THEFT",
  "LIQUOR LAWS": "DRUG/NARCOTIC",
  "LOITERING": "NON-CRIMINAL",
  "MISSING PERSON": "MISSING PERSON",
  "NON-CRIMINAL": "NON-CRIMINAL",
  "OTHER OFFENSES": "OTHER",
  "PROSTITUTION": "OTHER",
  "ROBBERY": "THEFT",
  "RUNAWAY": "MISSING PERSON",
  "SECONDARY CODES": "OTHER",
  "SEX OFFENSES, FORCIBLE": "ASSAULT",
  "SEX OFFENSES, NON FORCIBLE": "ASSAULT",
  "STOLEN PROPERTY": "THEFT",
  "SUICIDE": "OTHER",
  "SUSPICIOUS OCC": "SUSPICIOUS ACTIVITY",
  "TRESPASS": "OTHER",
  "VANDALISM": "VANDALISM",
  "VEHICLE THEFT": "THEFT",
  "WARRANTS": "WARRANTS",
  "WEAPON LAWS": "OTHER"
}

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

var visible_crime_data = [];
var marker_images = [];
var active_crime_categories = {
  "ASSAULT": true,
  "MISSING PERSON": true,
  "WARRANTS": true,
  "SUSPICIOUS ACTIVITY": true,
  "NON-CRIMINAL": true,
  "THEFT": true,
  "DRUG/NARCOTIC": true,
  "VANDALISM": true,
  "OTHER": true
};

var active_crime_days = {
  "Su": true,
  "M": true,
  "T": true,
  "W": true,
  "Th": true,
  "F": true,
  "S": true
};
var active_crime_start_end_time = [0, 24];
var current_crime_circle_radius = CRIME_CIRCLE_RADIUS;
var zoom;



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

function zoomed() {
  container.attr("transform",
    "translate(" + zoom.translate() + ")" +
    "scale(" + zoom.scale() + ")"
  );
  // container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  if (zoom.scale() > 4.5) {
    if (current_crime_circle_radius != CRIME_CIRCLE_RADIUS_SMALLEST) {
      current_crime_circle_radius = CRIME_CIRCLE_RADIUS_SMALLEST;
      $(".vis_container").trigger("updated_markers");
    }
  } else if (zoom.scale() > 2.2) {
    if (current_crime_circle_radius != CRIME_CIRCLE_RADIUS_SMALLER) {
      current_crime_circle_radius = CRIME_CIRCLE_RADIUS_SMALLER;
      $(".vis_container").trigger("updated_markers");
    }
  } else {
    if (current_crime_circle_radius != CRIME_CIRCLE_RADIUS) {
      current_crime_circle_radius = CRIME_CIRCLE_RADIUS;
      $(".vis_container").trigger("updated_markers");
    }
  }
}


// source: http://bl.ocks.org/linssen/7352810
function interpolateZoom (translate, scale) {
  return d3.transition().duration(350).tween("zoom", function () {
    var translate_interpolation = d3.interpolate(zoom.translate(), translate),
      scale_interpolation = d3.interpolate(zoom.scale(), scale);
    return function (t) {
      zoom
        .scale(scale_interpolation(t))
        .translate(translate_interpolation(t));
      zoomed();
    };
  });
}

// source: http://bl.ocks.org/linssen/7352810
function zoomClick() {
  var clicked = d3.event.target,
      direction = 1,
      factor = 0.2,
      target_zoom = 1,
      center = [width / 2, height / 2],
      extent = zoom.scaleExtent(),
      translate = zoom.translate(),
      translate0 = [],
      l = [],
      view = {x: translate[0], y: translate[1], k: zoom.scale()};

  d3.event.preventDefault();
  direction = (this.id === 'zoom_in') ? 1 : -1;
  target_zoom = zoom.scale() * (1 + factor * direction);

  if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

  translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
  view.k = target_zoom;
  l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

  view.x += center[0] - l[0];
  view.y += center[1] - l[1];

  interpolateZoom([view.x, view.y], view.k);
}

function createMapBaseImage() {
  // var zoom = d3.behavior.zoom()
      // .scaleExtent([1, 10])
      // .on("zoom", zoomed);
  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  // Add an svg element to the DOM
  var svg = d3.select(".vis_container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

  var container = svg.append("g");

  // Add svg map at correct size, assumes map is saved in a subdirectory called "data"
  container.append("image")
    .attr("width", width)
    .attr("height", height)
    .attr("xlink:href", "../data/sf-map.svg");

  window.container = container;

  // register zoom button behaviors
  d3.selectAll('button').on('click', zoomClick);

  return container;
}

// type is one of the types at the top of the file, visible is a boolean
function updateCrimeCategoryVisible(category, visible) {
  active_crime_categories[category] = visible;
  $(".vis_container").trigger("updated_markers");
}

function updateStartEndTimeVisible(start_time, end_time) {
  active_crime_start_end_time = [start_time, end_time];
  $(".vis_container").trigger("updated_markers");
}

function updateDayOfWeekVisible(day_str, visible) {
  active_crime_days[day_str] = visible;
  $(".vis_container").trigger("updated_markers");
}

function isCrimeDayOfWeekActive(day) {
  var day_str = "";
  if (day == 0)
    day_str = "M";
  else if (day == 1)
    day_str = "T";
  else if (day == 2)
    day_str = "W";
  else if (day == 3)
    day_str = "Th";
  else if (day == 4)
    day_str = "F";
  else if (day == 5)
    day_str = "S";
  else if (day == 6)
    day_str = "Su";

  return active_crime_days[day_str];
}

function isCrimeTimeActive(time) {
  // input format: HH:MM
  var time_hour = parseInt(time.substring(0, 2));
  if (time_hour >= active_crime_start_end_time[0] && time_hour <= active_crime_start_end_time[1])
    return true;
  return false;
}

function isCrimeTypeActive(type) {
  var crime_category = CRIME_CATEGORY_MAP[type];
  return active_crime_categories[crime_category];
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
    .on('dragstart', function() { d3.event.sourceEvent.stopPropagation() })
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
      // d3.event.stopPropagation();
      // d3.event.preventDefault();
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
    .attr("opacity", 0.2)
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
    .data(visible_crime_data, function(d, i) {
      return d["IncidentNumber"];
    });

  crime_circles.enter()
    .append("circle")
    .attr("class", "crime_circle")
    .attr("id", function(d, i) {
      return "crime-" + d["IncidentNumber"];
    })
    .attr("r", current_crime_circle_radius)
    .attr("fill", CRIME_CIRCLE_FILL_COLOR)
    // .attr("stroke", CRIME_CIRCLE_STROKE_COLOR)
    .attr("stroke", function(d, i) {
      var crime_category = CRIME_CATEGORY_MAP[d["Category"]];
      return CRIME_COLORS_MAP[crime_category];
    })
    .attr("opacity", 1)
    .attr("cx", function(d) {
      return projection(d["Location"])[0];
    }).attr("cy", function(d) {
      return projection(d["Location"])[1];
    });

  crime_circles.each(function(d, i) {
    $(this).hoverIntent(
      function(e) { // callback called on hover start (if mouse stays on this element for ~100ms)
        showTooltip(e.originalEvent, d);
    }, function() { // callback for hover end
        $(".tooltip").toggleClass("active");
    })
  });

  crime_circles.exit().remove();
}

function updateVisibleCrimes(all_data, projection) {
  visible_crime_data = all_data.filter(function(entry) {
    // make sure it is one of the visible types of crimes
    var crime_type = entry["Category"];
    if (!isCrimeTypeActive(crime_type)) {
      return false;
    }

    // make sure it is within the correct time of day
    var crime_time = entry["Time"];
    if (!isCrimeTimeActive(crime_time))
      return false;

    // make sure it is on one of the correct days of the week
    var crime_date = entry["Date"];
    var crime_day_of_week = new Date(crime_date).getDay();
    if (!isCrimeDayOfWeekActive(crime_day_of_week))
      return false;

    // make sure it is within the radius of the two markers
    var crime_coords = projection(entry["Location"]);
    if (!crimeWithinMarkers(crime_coords))
      return false;

    return true;
  });

  $(".matching_crimes_number").text(visible_crime_data.length);
}

// var updateVisibleCrimesDebounced = debounce(function(all_data, projection) {
//   updateVisibleCrimes(all_data, projection);
// }, 100);


function populateTooltip($target, $tooltip, crime_data) {
  // data we can use to populate the tooltip
  var crime_category = crime_data["Category"];
  var crime_date = crime_data["Date"];
  var crime_time = crime_data["Time"];
  var crime_day_of_week = crime_data["DayOfWeek"];
  var crime_description = crime_data["Description"];
  var crime_incident_number = crime_data["IncidentNumber"];
  var crime_resolution = crime_data["Resolution"];
  var crime_location_latlong = crime_data["Location"];
  //

  var crime_id = $target.attr("id");
  var $description = $($tooltip.children()[0]);
  $description.text(crime_description);
  var width = $description.outerWidth();
  $tooltip.css("width", width);
}

function positionTooltip($tooltip, position) {
  var leftOffset = $tooltip.outerWidth()/2;
  var left = position.left - leftOffset;
  $tooltip.css("top", position.top);
  $tooltip.css("left", left);
  $tooltip.toggleClass("active");
}

function showTooltip(event, crime_data) {
  var $target = $(event.target);
  var $tooltip = $(".tooltip");
  populateTooltip($target, $tooltip, crime_data);

  var position = $target.position();
  var radius = d3.select("#" + $target.attr("id")).node().getBoundingClientRect().width;
  position.top = position.top + radius;
  position.left = position.left + (radius/2);

  positionTooltip($tooltip, position);
}

// function crimeCircleTooltips() {
//   var $crimeCircles = $(".crime_circle");
//   // console.log($crimeCircles);
//   $crimeCircles.mouseover(function(event) {
//     showTooltip(event);
//     //setTimeout(showTooltip, 1000, event);
//   });

//   $crimeCircles.mouseout(function(event) {
//     var $tooltip = $(".tooltip");
//     $tooltip.toggleClass("active");
//   });
// }


function createMap() {
  var projection = getMapProjection();
  var svg = createMapBaseImage();
  updateAAndBMarkers(svg, projection);

  loadCrimeData(function(data) {
    updateVisibleCrimes(data, projection);

    addCrimeDataWithinMarkers(data, svg, projection);
    // crimeCircleTooltips();

    $(".vis_container").on("updated_markers", function() {
      updateVisibleCrimes(data, projection);
      // updateVisibleCrimesDebounced(data, projection);
      d3.selectAll("circle").remove();
      // d3.selectAll(".map_marker").remove();
      marker_images.remove();

      updateAAndBMarkers(svg, projection);
      addCrimeDataWithinMarkers(data, svg, projection);
      // crimeCircleTooltips();
    });
  });
}


$(document).ready(function() {
  createMap();
});


// utility functions

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// source: https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};