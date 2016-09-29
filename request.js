/** @module request */
var request = (function() {

	var parseErrMsg = 'parsing marker response failed: '; 

	function requestMarking(marker, webPageFeatures, userQueries, callback) {
		
		var data = {
			request: 'mark',
			tokens: webPageFeatures.words,
			url: webPageFeatures.url,
			queries: userQueries
		};
		
		request(marker.url, data, function(responseText) {
			callback(parseMarkingResponse(responseText, 
				webPageFeatures.words.length));
		});
	}

	function requestSettings(url, callback) {

		var data = { request: 'settings' };

		request(url, data, function(responseText) {
			callback(parseSettingsResponse(responseText));
		});
	}

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

	function parseMarkingResponse(responseText, numOfTokens) {

		var response = JSON.parse(responseText);
		
		testObject(response);
		testProperty(response, 'mask', 'Array', true);
		
		if (!response.mask.every(n => Number.isInteger(n)))
			throw new Error(parseErrMsg + 'not all items of response.mask are integers');
		
		var padding = numOfTokens - response.mask.length;
		if (padding > 0)
			response.mask = response.mask.concat(Array(padding).fill(0));

		return response;
	}

	function parseSettingsResponse(responseText) {

		var response = JSON.parse(responseText);
		
		testObject(response);
		testProperty(response, 'name', 'String', false);
		testProperty(response, 'description', 'String', false);
		testProperty(response, 'queries', 'Array', false);

		if (response.queries) {
			for (var query of response.queries) {
				testObject(query);
				testProperty(query, 'id', 'String', true);
				testProperty(query, 'label', 'String', false);
				testProperty(query, 'hint', 'String', false);
			}
		}

		return response;
	}

	function testObject(object) {
		if (object.constructor.name !== 'Object')
			throw new Error(parseErrMsg + 'testObject()');
		return true;
	}

	function testProperty(object, property, type, required) {
		if (object.hasOwnProperty(property)) {
			if (object[property].constructor.name !== type)
				throw new Error(parseErrMsg + 'testProperty()');
		}
		else {
			if (required)
				throw new Error(parseErrMsg + 'testProperty()');
		}
		return true;
	}

	/** interfaces of module */
	return {
		requestMarking: requestMarking,
		requestSettings: requestSettings
	};

}());
