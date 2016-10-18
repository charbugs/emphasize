
var menu = (function() {

	function MarkerListItem(marker) {
		
		this.marker = marker;
		this.panelView = false;
		this.readyView = true;
		this.progressView = false;
		this.resultView = false;
		this.errorView = false;

		this.togglePanel = function() {
			this.panelView = !this.panelView;
		};
	}

	function draw() {

		chrome.runtime.getBackgroundPage(function(bg) {
			bg.markerdb.get(null, function(markers) {

				var markerListItems = [];
				for (var marker of markers) {
					markerListItems.push(new MarkerListItem(marker));
				}

				var list = new Vue({
					el: '#list',
					data: {
						markerListItems: markerListItems
					}
				});

				// remove separator from last item
				var items = document.getElementsByClassName('item');
				var lastItem = items[items.length-1];
				lastItem.style.border = 'none';
			});
		});
	}

	return {
		draw: draw
	}
}());

document.addEventListener('DOMContentLoaded', function() {
	menu.draw();
});