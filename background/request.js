/** @module request */
var request = (function() {

	'use strict';

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
	* @param {Function} callback - ({Error} err, {Object} parsed response)
	*/
	function requestMarkup(id, url, tokens, wpUrl, inputs, callback) {

		var data = {
			call: 'markup',
			tokens: tokens,
			url: wpUrl,
			inputs: inputs
		};

		request(id, url, data, function(err, responseText) {
			if (err) {
				callback(err, null);
			} else {
				parser.parseMarkupResponse(responseText, callback);
			}
		});
	}

	/**
	* Requests a marker app to submit its setup features.
	*
    * @param {String} id - id of request
	* @param {String} url - request url
	* @param {Function} callback - ({Error} err, {Object} parsed response)
	*/
	function requestSetup(id, url, callback) {

		var data = { call: 'setup' };

		request(id, url, data, function(err, responseText) {
			if (err) {
				callback(err, null);
			} else {
				parser.parseSetupResponse(responseText, callback);
			}
		});
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
	* @param {jsonisable} data
	* @param {Function} callback - ({String} response to request)
	*/
	function request(id, url, data, callback) {

		resolveRedirects(url, function(endpointUrl) {

			var xhr = new XMLHttpRequest();
	        requestStorage[id] = xhr;
			xhr.onreadystatechange = function() {
				handleResponse(xhr, callback);
			};
			xhr.open('POST', endpointUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
		});
	}

	/**
	* Get the endpoint url after resolving all redirects.
	*
	* XMLHttpRequest actually follows the redirects by its own. But doing this
	* with a POST request will end in a GET request, at least on
	* Chromium 53.0.2785.89 Built on 8.5.
	* So we resolve the redirects with a HEAD request.
	*
	* param {String} url - starting point url
	* param {Function} callback - (endpoint url)
	*/
	function resolveRedirects(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === xhr.DONE) {
				callback(xhr.responseURL);
			}
		}
		xhr.open('HEAD', url, true);
		xhr.send();
	}

	/**
	* Handles a http response.
	*
	* @param {XMLHttpRequest} xhr
	* @param {Function} callback
	* 	@param {String} - response to request
	*/
	function handleResponse(xhr, callback) {
		if (xhr.readyState === xhr.DONE) {
			if (xhr.status === 0) {
                var msg = 'Something went wrong while requesting marker.';
				var err = new RequestError(msg);
				callback(err, null);
			}
			else if (xhr.status === 200) {
				callback(null, xhr.responseText);
			}
			else {
                var msg = 'Failed to receive data from marker. Server answers: ';
                msg = msg + xhr.status;
				var err = new RequestError(msg);
				callback(err, null);
			}
		}
	}

	/** interfaces of module */
	return {
		requestMarkup: requestMarkup,
		requestSetup: requestSetup,
		abortRequest: abortRequest
	};
}());
