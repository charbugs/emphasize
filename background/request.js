/** @module request */
var request = (function() {

	'use strict';

	/**
	* On CORS:
	* 
	* "Chrome extensions can make cross-domain requests to any domain *if* the
	* domain is included in the "permissions" section of the manifest.json file.
	* The server doesn't need to include any additional CORS headers or do any
	* more work in order for the request to succeed." (see https://www.
	* html5rocks.com/en/tutorials/cors/#toc-cross-domain-from-chrome-extensions)
	*
	* CORS is only permitted for a few protocols including http and https. Since
	* we only allow markers on http and https CORS is no problem.
    */

	/**
	* An Error that will be thrown if somthing went wrong while
	* trying to get the response data from the marker app.
	*/
	function RequestError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	RequestError.prototype = Object.create(Error.prototype);
	RequestError.prototype.name = 'RequestError';

	/**
	* An Error that will be thrown if the marker answers with an
	* error message.
	*/
	function MarkerError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	MarkerError.prototype = Object.create(Error.prototype);
	MarkerError.prototype.name = 'MarkerError';

    /**
    * Stores requests.
    *
    * Keys are request ids {String}, values are requests {XMLHttpRequest}
    */
    var requestStorage = {};

	/**
	* Requests a marker app to analyze a list of tokens
    * and to submit the result of this analysis.
    *
	*
    * @param {String} id - id of request
	* @param {String} url - request url
	* @param {Array of String} tokens - tokens extracted from web page
	* @param {String} wpUrl - url of the current web page.
	* @param {Object} inputs - user inputs belonging to the marker.
	*	    Keys {String} are input ids, values {String} are user inputs.
	* @return {Promise.resolve(Object)} - parsed marker response.
	*/
	function requestMarkup(id, url, tokens, wpUrl, inputs) {

		var data = {
			call: 'markup',
			tokens: tokens,
			url: wpUrl,
			inputs: inputs
		};

		return request(id, url, data).then(function(responseText) {
			return parser.parseMarkupResponse(responseText);
		}).then(function(response) {
			return response.hasOwnProperty('error') 
				? Promise.reject(new MarkerError(response.error))
				: Promise.resolve(response);
		});
	}

	/**
	* Requests a marker app to submit its setup features.
	*
    * @param {String} id - id of request
	* @param {String} url - request url
	* @return {Promise.resolve(Object)} - parsed marker response.
	*/
	function requestSetup(id, url) {

		var data = { 
			call: 'setup' 
		};
		
		return request(id, url, data).then(responseText => 
			parser.parseSetupResponse(responseText));
	}

    /**
    * Aborts a request.
    *
    * This triggers the response handler for this request and obviously
	* sets xhr.status to 0.
    * (Although the documentation says it does not fire readystatechange:
    * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/abort)
    *
    * @param {String} id - id of request
    */
    function abortRequest(id) {

        requestStorage[id].abort();
    }

	/**
	* Performs a http request.
	*
    * @param {String} id - id of request
	* @param {String} url
	* @param {jsonable} data
	* @return {Promise.resolve(String)} - unparsed response text.
	*/
	function request(id, url, data) {

		return new Promise(function(resolve, reject) {

			var xhr = new XMLHttpRequest();
	        requestStorage[id] = xhr;
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));

			xhr.onload = () => resolve(handleResponse(xhr));
			xhr.onerror = () => reject(new RequestError(
				'Something went wrong while requesting marker.'));
		});
	}

	/**
	* Handles a http response.
	*
	* @param {XMLHttpRequest} xhr
	* @return {Promise(String)} - unparsed response text.
	*/
	function handleResponse(xhr) {
	
		if (xhr.status === 0) {
			var msg = 'Something went wrong while requesting marker.';
            return Promise.reject(new RequestError(msg));
        }
		else if (xhr.status === 200) {
			return Promise.resolve(xhr.responseText);
		}
		else {
            var msg = 'Failed to receive data from marker. Server answers: ';
            msg = msg + xhr.status;
			return Promise.reject(new RequestError(msg));
		}		
	}

	/** interfaces of module */
	return {
		request: request, //debug
		requestMarkup: requestMarkup,
		requestSetup: requestSetup,
		abortRequest: abortRequest
	};
}());
