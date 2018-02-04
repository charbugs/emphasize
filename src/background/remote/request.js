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
 * we only allow analyzers on http and https CORS is no problem.
 */

/**
 * Implements http requests for the communication with 
 * remote marker programms.
 */
(function(em) {

	'use strict';

	// stores xhr requests
	var requestStorage = {};

	/**
	 * Requests an marker for setup.
	 *
	 * param: (Number) id - request id
	 * param: (String) url - of the analyzer.
	 * return: (Object) parsed setup response.
	 */
	async function requestSetup(id, url) {

		var data = { call: 'setup' };
		em.parse.parseSetupRequest(data); // debug
		var response = await post(id, url, data);
		return em.parse.parseSetupResponse(response);
	}

	/**
	 * Requests an marker to perform an analysis on the given data.
	 *
	 * param: (Number) id - request id
	 * param: (String) url - of analyzer
	 * param: (Object) data - as defined in protocol
	 * return: (Object) parsed analysis response.
	 */
	async function requestMarkup(id, url, data) {

		data.call = 'markup',
		em.parse.parseMarkupRequest(data) // debug
		var response = await post(id, url, data);
		return em.parse.parseMarkupResponse(response);
	}

	/**
	 * Performs a POST request and handles some errors.
	 *
	 * param: (Number) id - request id
	 * param: (String) url
	 * param: (Jsonable) data
	 * return: (String) - the response body as text.
	 */
	function post(id, url, data) {

		return new Promise(function(resolve, reject) {

			var xhr = new XMLHttpRequest();
			requestStorage[id] = xhr;
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
			xhr.onreadystatechange = function() {
				handleResponse(xhr, resolve, reject);
			}
		});
	}

	function handleResponse(xhr, resolve, reject) {
		
		if (xhr.readyState === xhr.DONE) {

			if (xhr.status === 0) {
				var msg = 'Something went wrong while requesting marker.';
				reject(new em.errors.RequestError(msg));
			}
			else if (xhr.status === 200) {
				resolve(xhr.responseText);
			}
			else {
				var msg = 'Failed to receive data from marker. Server answers: ';
				msg = msg + xhr.status;
				reject(new em.errors.RequestError(msg));
			}
		}
	}

	/**
	* Aborts a request by id.
	*
	* This triggers the response handler for this request and 
	* sets xhr.readyState == xhr.DONE and xhr.status == 0.
	*
	* param: (Number) id - request id.
	*/
	function abortRequest(id) {
		requestStorage[id].abort();
	}

	// exports
	em.request = {
		requestSetup,
		requestMarkup,
		abortRequest
	};

})(emphasize);