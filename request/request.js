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
 * remote analyzer programms.
 */
class Request {

	constructor() {
		throw new Error("This class can not be instantiated.");
	}

	/**
	 * Requests an analyzer for setup.
	 *
	 * param: (Number) id - request id
	 * param: (String) url - of the analyzer.
	 * return: (Object) parsed setup response.
	 */
	static async requestSetup(id, url) {

		var data = { call: 'setup' };
		Parser.parseSetupRequest(data); // debug
		var response = await Request.post(id, url, data);
		return Parser.parseSetupResponse(response);
	}

	/**
	 * Requests an analyzer to perform an analysis on the given data.
	 *
	 * param: (Number) id - request id
	 * param: (String) url - of analyzer
	 * param: (Array of String) tokens - webpage tokens
	 * param: (Object) inputs - user inputs
	 * param: (String) webpage - url of the webpage to analyze.
	 * return: (Object) parsed analysis response.
	 */
	static async requestAnalysis(id, url, tokens, inputs, webpage) {

		var data = {
			call: 'analyze',
			tokens: tokens,
			inputs: inputs,
			webpage: webpage
		};
		Parser.parseAnalysisRequest(data) // debug
		var response = await Request.post(id, url, data);
		return Parser.parseAnalysisResponse(response);
	}

	/**
	 * Performs a POST request and handles some errors.
	 *
	 * param: (Number) id - request id
	 * param: (String) url
	 * param: (Jsonable) data
	 * return: (String) - the response body as text.
	 */
	static post(id, url, data) {

		return new Promise(function(resolve, reject) {

			var xhr = new XMLHttpRequest();
			Request.requestStorage[id] = xhr;
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(data));
			xhr.onreadystatechange = function() {
				Request.handleResponse(xhr, resolve, reject);
			}
		});
	}

	static handleResponse(xhr, resolve, reject) {
		
		if (xhr.readyState === xhr.DONE) {

			if (xhr.status === 0) {
				var msg = 'Something went wrong while requesting marker.';
				reject(new RequestError(msg));
			}
			else if (xhr.status === 200) {
				resolve(xhr.responseText);
			}
			else {
				var msg = 'Failed to receive data from marker. Server answers: ';
				msg = msg + xhr.status;
				reject(new RequestError(msg));
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
	static abortRequest(id) {
		Request.requestStorage[id].abort();
	}
}

Request.requestStorage = {};