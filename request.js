
var request = (function() {

	function MarkerResponse(mask) {

		this.mask;
	}

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

		var data = compileRequestData(marker, tokens);

		xhr.send(JSON.stringify(data));
	}

	function handleResponse(xhr, callback) {

		if (xhr.readyState === 4 && xhr.status === 200) {

			callback(JSON.parse(xhr.responseText));
		}
	}

	function compileRequestData(marker, tokens) {

		return {
			tokens: tokens,
		};
	}

	return {
		callMarkerApp: callMarkerApp
	};

}());
