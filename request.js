/** @module request */
var request = (function() {

	var parseErrMsg = 'parsing marker response failed: '; 

	function ResponseParserError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	ResponseParserError.prototype = Object.create(Error.prototype);
	ResponseParserError.prototype.name = 'ResponseParserError';

	function requestMarking(marker, webPageFeatures, userQueries, callback) {
		
		var data = {
			request: 'mark',
			tokens: webPageFeatures.words,
			url: webPageFeatures.url,
			queries: userQueries
		};
		
		request(marker.url, data, function(responseText) {
			try {
				var response = parseMarkingResponse(responseText, webPageFeatures.length);
				callback(null, response);
			} catch (err) {
				if (err instanceof ResponseParserError)
					callback(err, null);
				else
					throw err;
			}
		});
	}

	function requestSettings(url, callback) {

		var data = { request: 'settings' };

		request(url, data, function(responseText) {
			try {
				var response = parseSettingsResponse(responseText);
				callback(null, response);
			} catch (err) {
				if (err instanceof ResponseParserError)
					callback(err, null);
				else
					throw err;
			}
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

		var key;
		var response = JSON.parse(responseText);
		
		if (!response || !isObject(response))
			throw new ResponseParserError('Marker response must be an JSON object.');

		if (key = firstUnsupportedProperty(response, ['mask']))
			throw new ResponseParserError('Unknown property "' + key + '" in marker response.');

		if (key = firstMissingProperty(response, ['mask']))
			throw new ResponseParserError('Missing property "' + key + '" in marker response.');

		if (key = firstMistypedProperty(response, { mask: 'Array' }))
			throw new ResponseParserError('Property "' + key + '" of marker response has wrong type.');
		
		if (!response.mask.every(n => Number.isInteger(n)))
			throw new ResponseParserError('All items of mask must be integers.');
		
		var padding = numOfTokens - response.mask.length;
		if (padding > 0)
			response.mask = response.mask.concat(Array(padding).fill(0));

		return response;
	}

	function parseSettingsResponse(responseText) {

		var key;
		var response = JSON.parse(responseText);
		
		if (!response || !isObject(response))
			throw new ResponseParserError('Marker settings must be an JSON object.');

		if (key = firstUnsupportedProperty(response, ['name', 'description', 'queries']))
			throw new ResponseParserError('Unknown property "' + key + '" in marker settings.');

		if (key = firstMissingProperty(response, ['name', 'description']))
			throw new ResponseParserError('Missing property "' + key + '" in marker settings.');

		if (key = firstMistypedProperty(response, { name: 'String', description: 'String', queries: 'Array' }))
			throw new ResponseParserError('Property "' + key + '" of marker settings has wrong type.');

		if (response.queries) {
			for (var query of response.queries) {
				
				if (!isObject(query))
					throw new ResponseParserError('Items of "queries" must be JSON objects');

				if (key = firstUnsupportedProperty(query, ['id', 'label', 'hint']))
					throw new ResponseParserError('Unknown property "' + key + '" in query object.');

				if (key = firstMissingProperty(query, ['id']))
					throw new ResponseParserError('Missing property "' + key + '" in query object.');

				if (key = firstMistypedProperty(query, { id: 'String', label: 'String', hint: 'String'}))
					throw new ResponseParserError('Property "' + key + '" of query object has wrong type.');
			}
		}
		return response
	}

	function isObject(object) {
		if (object.constructor.name === 'Object')
			return true;
		else
			return false;
	}

	function firstMissingProperty(object, needed) {
		for (var key of needed) {
			if (!object.hasOwnProperty(key))
				return key;
		}
		return false;
	}

	function firstMistypedProperty(object, typeMap) {
		for (var key in object) {
			if (object[key].constructor.name !== typeMap[key])
				return key;
		}
		return false;
	}

	function firstUnsupportedProperty(object, supported) {
		for (var key in object) {
			if (supported.indexOf(key) === -1)
				return key; 
		}
		return false;
	}

	/** interfaces of module */
	return {
		requestMarking: requestMarking,
		requestSettings: requestSettings,
		request: request
	};
}());
