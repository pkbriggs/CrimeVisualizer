$(function() {
  $( ".slider" ).slider({
    range: false,
    min: 0,
    max: 10,
    value: 5,
    slide: function(event, ui) {
      $(this).prev().text(ui.value);
      console.log(ui.value);
      console.log($(this).prev());
    }
  });
    $(this).prev().text($(".slider").slider("value"));
});

$(function() {
  $( "#slider-range" ).slider({
    range: true,
    min: 0,
    max: 24,
    values: [8, 15],
    slide: function(event, ui) {
      $("#amount").val(ui.values[0] + ":00 - " + ui.values[1] + ":00");
    }
  });
  $( "#amount" ).val($("#slider-range").slider("values", 0) +
    ":00 - " + $("#slider-range").slider("values", 1) + ":00");
});