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
			var crime_category = $target.next().text().trim();
			updateCrimeCategoryVisible(crime_category, true); // make it so this category is visible on the map
		} else {
			$target.toggleClass("inactive");
			var crime_category = $target.next().text().trim();
			updateCrimeCategoryVisible(crime_category, false); // make it so this category is no longer visible on the map
		}
	});
});
