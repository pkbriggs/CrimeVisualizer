$(function() {
	var $weekdays = $(".weekdays");
	$weekdays.click(function(event) {
		var $target = $(event.target);
		$target.toggleClass("active");
	});
});

$(function() {
	var $checkbox = $(".roundedOne label");
	$checkbox.click(function(event) {
		var $target = $(event.target);
		if ($target.hasClass("inactive")) {
			$target.removeClass("inactive");
			console.log("gotta re-find this shit: ", $target.next().text().toLowerCase());
		} else {
			$target.toggleClass("inactive");
			console.log("gotta remove this shit: ", $target.next().text().toLowerCase());
		}
	});
});
