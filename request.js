
var request = (function() {

	var numberOfTokens;

	function MarkerResponse(responseText) {

		var parseErrMsg = 'parsing marker response failed: ' 

		// is valid JSON string?
		try {
			var response = JSON.parse(responseText);
		} catch(e) {
			throw new Error(parseErrMsg + e.message);
		}
	
		// is Array?
		if (!Array.isArray(response))
			throw new Error(parseErrMsg + 'not an array');

		// if shorter then tokens fill with 0
		var padding = numberOfTokens - response.length;
		if (padding > 0)
			response = response.concat(Array(padding).fill(0));

		// all right!
		this.mask = response;
	}

	/*
	* @param {markerdb.Marker} - marker
	* @param {Array of String} - tokens
	*/
	function callMarkerApp(marker, tokens, callback) {

		numberOfTokens = tokens.length;

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

			callback(new MarkerResponse(xhr.responseText));
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
