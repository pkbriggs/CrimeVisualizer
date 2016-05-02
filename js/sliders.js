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
      $(this).prev().text(ui.values[0] + ":00 - " + ui.values[1] + ":00");
    }
  });
  $(this).prev().text($(".slider_range").slider("values", 0) +
    ":00 - " + $(".slider_range").slider("values", 1) + ":00");
});