
function getTabNumber(delay) {
	setTimeout(function() {
		chrome.tabs.query({ active: true, currentWindow: true },
			function(tabs) {
				console.log(tabs[0].id);
			}
		);
	}, delay);
}