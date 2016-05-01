$(function() {
  $( ".slider" ).slider({
    range: false,
    min: 0,
    max: 10,
    value: 5,
    slide: function(event, ui) {
      $(this).prev().text(ui.value);
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