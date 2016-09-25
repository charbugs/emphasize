/** @module request */
var request = (function() {

	function MarkingResponse(responseText, numOfTokens) {
		
		var parseErrMsg = 'parsing marker response failed: ' 
		var response = JSON.parse(responseText);
		
		if (!Array.isArray(response.mask))
			throw new Error(parseErrMsg + 'response.mask is not an array');
		
		if (!response.mask.every(n => Number.isInteger(n)))
			throw new Error(parseErrMsg + 'not all items of response.mask are integers');
		
		var padding = numOfTokens - response.mask.length;
		if (padding > 0)
			response.mask = response.mask.concat(Array(padding).fill(0));

		this.mask = response.mask;
	}

	function SettingsResponse() {}

	function requestMarking(marker, webPageFeatures, userQueries, callback) {
		
		var data = {
			request: 'mark',
			tokens: webPageFeatures.words,
			url: webPageFeatures.url,
			queries: userQueries
		};
		
		request(marker.url, data, function(responseText) {
			callback(new MarkingResponse(
				responseText,
				webPageFeatures.words.length
			));
		});
	}

	function requestSettings() {}

	function request(url, data, callback) {
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			handleResponse(xhr, callback);
		};
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
	}

	function handleResponse(xhr, callback) {

		if (xhr.readyState === 4 && xhr.status === 200) {
			callback(xhr.responseText);
		}
	}

	/** interfaces of module */
	return {
		requestMarking: requestMarking
	};

}());
