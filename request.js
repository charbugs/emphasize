/** @module request */
var request = (function() {

	/**
	* An Error that will be thrown if the response of a marker app
	* does not match the communication protocol of marker and extension.
	*/
	function ResponseParserError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	ResponseParserError.prototype = Object.create(Error.prototype);
	ResponseParserError.prototype.name = 'ResponseParserError';

	/**
	* Requests a marker app to mark the tokens of the web page.
	*
	* @param {markerdb.Marker} marker
	* @param {Array of String} words - the web page words.
	* @param {String} url - url of the web page.
	* @param {Object} userQueries - user inputs for queries provided by the marker.
	*	Keys are query ids, values are user inputs.
	* @param {Function} callback - ({Error} err, {Object} response)
	*/
	function requestMarking(marker, words, url, userQueries, callback) {
		
		var data = {
			request: 'mark',
			tokens: words,
			url: url,
			queries: userQueries
		};
		
		request(marker.url, data, function(responseText) {
			try {
				var response = parseMarkingResponse(responseText, words.length);
				callback(null, response);
			} catch (err) {
				if (err instanceof ResponseParserError)
					callback(err, null);
				else
					throw err;
			}
		});
	}

	/**
	* Requests a marker app to submit its settings.
	*
	* @param {String} url - url of marker.
	* @param {Function} callback
	*	@param {Error}
	*	@param {response} - response of marker
	*/
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

	/** 
	* Performs a http request.
	*
	* @param {String} url
	* @param {Any able to stringify by JSON} data
	* @param {Function} callback
	* 	@param {String} - response to request
	*/
	function request(url, data, callback) {
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			handleResponse(xhr, callback);
		};
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
	}

	/**
	* Handles a http response.
	*
	* @param {XMLHttpRequest} xhr
	* @param {Function} callback
	* 	@param {String} - response to request 
	*/
	function handleResponse(xhr, callback) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			callback(xhr.responseText);
		}
	}

	/**
	* Checks if the response to a marking request matches the 
	* communication protocol of marker and extension.
	*
	* @param {String} responseText - response of marker
	* @param {Number} numOfTokens - number of web page tokens
	* @return {Object} - object valid to the communication protocol
	*/
	function parseMarkingResponse(responseText, numOfTokens) {

		var supported = ['mask', 'result'];
		var needed = ['mask'];
		var typeMap = { mask: 'Array', result: 'String'};

		var key;
		var response = JSON.parse(responseText);
		
		if (!response || !isObject(response))
			throw new ResponseParserError('Marker response must be an JSON object.');

		if (key = firstUnsupportedProperty(response, supported))
			throw new ResponseParserError('Unknown property "' + key + '" in marker response.');

		if (key = firstMissingProperty(response, needed))
			throw new ResponseParserError('Missing property "' + key + '" in marker response.');

		if (key = firstMistypedProperty(response, typeMap))
			throw new ResponseParserError('Property "' + key + '" of marker response has wrong type.');
		
		if (!response.mask.every(n => Number.isInteger(n)))
			throw new ResponseParserError('All items of mask must be integers.');
		
		var padding = numOfTokens - response.mask.length;
		if (padding > 0)
			response.mask = response.mask.concat(Array(padding).fill(0));

		return response;
	}

	/**
	* Checks if the response to a settings request matches the 
	* communication protocol of marker and extension.
	*
	* @param {String} responseText - response of marker
	* @return {Object} - object valid to the communication protocol
	*/
	function parseSettingsResponse(responseText) {

		var supported = ['name', 'description', 'queries'];
		var needed = ['name', 'description'];
		var typeMap = { name: 'String', description: 'String', queries: 'Array' };

		var supportedOfQuery = ['id', 'label', 'hint'];
		var neededOfQuery = ['id'];
		var typeMapOfQuery = { id: 'String', label: 'String', hint: 'String'};

		var key;
		var response = JSON.parse(responseText);
		
		if (!response || !isObject(response))
			throw new ResponseParserError('Marker settings must be an JSON object.');

		if (key = firstUnsupportedProperty(response, supported))
			throw new ResponseParserError('Unknown property "' + key + '" in marker settings.');

		if (key = firstMissingProperty(response, needed))
			throw new ResponseParserError('Missing property "' + key + '" in marker settings.');

		if (key = firstMistypedProperty(response, typeMap))
			throw new ResponseParserError('Property "' + key + '" of marker settings has wrong type.');

		if (response.hasOwnProperty('queries')) {
			for (var query of response.queries) {
				
				if (!isObject(query))
					throw new ResponseParserError('Items of "queries" must be JSON objects');

				if (key = firstUnsupportedProperty(query, supportedOfQuery))
					throw new ResponseParserError('Unknown property "' + key + '" in query object.');

				if (key = firstMissingProperty(query, neededOfQuery))
					throw new ResponseParserError('Missing property "' + key + '" in query object.');

				if (key = firstMistypedProperty(query, typeMapOfQuery))
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

	/**
	* Returns the name of the first missing property 
	* relative to a list of needed properties.
	*
	* @param {Object} object - object to test.
	* @param {Array of String} needed - names of properties that should be present in object.
	* @return {String or Boolean} - eighter the name of a missing property or false.
	*/
	function firstMissingProperty(object, needed) {
		for (var key of needed) {
			if (!object.hasOwnProperty(key))
				return key;
		}
		return false;
	}

	/**
	* Returns the name of the first property that has a unexpected type.
	*
	* @param {Object} object - object to test.
	* @param {Object} typeMap - keys are prop names, values are types.
	* @return {String or Boolean} - eighter the name of a wrong typed prop or false. 
	*/
	function firstMistypedProperty(object, typeMap) {
		for (var key in object) {
			if (object[key].constructor.name !== typeMap[key])
				return key;
		}
		return false;
	}

	/**
	* Returns the name of the first property that is not supported.
	*
	* @param {Object} object - object to test.
	* @param {Array of String} supported - names of properties that are supported.
	*/
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
