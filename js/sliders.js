var scaling_factor = 10;

$(function() {
  $( ".slider" ).slider({
    range: false,
    min: 0,
    max: 100,
    value: 5.0,
    slide: function(event, ui) {
      var new_value = ui.value / 10;
      $(this).prev().text(new_value);
      if ($(this).parent().attr("class") == "slider_a")
        window.a_radius = new_value * scaling_factor;
      else
        window.b_radius = new_value * scaling_factor;
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