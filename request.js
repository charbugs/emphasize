
var request = (function() {

	/*
	* @param {markerdb.Marker} - marker
	* @param {Array of String} - tokens
	*/
	function callMarkerApp(marker, tokens, callback) {

		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = handleResponse.bind(
			undefined, xhr, callback);

		xhr.open('POST', marker.url, true);
		
		xhr.setRequestHeader('Content-Type', 'application/json');

		var data = compileRequestData();

		xhr.send(JSON.stringify(data));
	}

	function handleResponse(xhr, callback) {

		if (xhr.readyState === 4 && xhr.status === 200) {

			callback(JSON.parse(xhr.responseText));
		}
	}

	function compileRequestData() {

		return {
			tokens: tokens,
			location: document.location.href,
			custom: marker.query
		};
	}

	return {
		callMarkerApp: callMarkerApp
	};

}());
