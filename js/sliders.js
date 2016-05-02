var decimal_scaling = 10; // so that we can have miles to 1 decimal point

$(function() {
  $( ".slider" ).slider({
    range: false,
    min: 0,
    max: 100,
    value: 10.0,
    slide: function(event, ui) {
      var new_value = ui.value / decimal_scaling;
      $(this).prev().text(new_value);
      if ($(this).parent().attr("class") == "slider_a")
        setMarkerRadius("a", new_value);
      else
        setMarkerRadius("b", new_value);
      $(".vis_container").trigger("updated_markers");
    }
  });
    $(this).prev().text($(".slider").slider("value"));
});

$(function() {
  $( ".slider_range" ).slider({
    range: true,
    min: 0,
    max: 24,
    values: [0, 24],
    slide: function(event, ui) {
      var start_time = transformTime(ui.values[0]);
      var end_time = transformTime(ui.values[1]);
      
      $(this).prev().text(start_time + " - " + end_time);
    }
  });
  $(this).prev().text($(".slider_range").slider("values", 0) +
    ":00 - " + $(".slider_range").slider("values", 1) + ":00");
});

function transformTime(time) {
  if (time%12 == 0) {
    if (time == 0)
      return "12:00am"
    else if (time == 24)
      return "11:59pm";
    else 
      return "12:00pm";
  } else if (time/12 > 1) {
    return time%12 + ":00pm";
  } else {
    return time%12 + ":00am";
  }
  return "error";
}