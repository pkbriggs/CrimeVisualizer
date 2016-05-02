$(function() {
	var $weekdays = $(".weekdays");
	$weekdays.click(function(event) {
		var $target = $(event.target);
		$target.toggleClass("active");
	});
});

