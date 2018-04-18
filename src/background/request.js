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

var { RequestError } = require('../common/errors.js');

'use strict';

/**
 * Implements http requests for the communication with 
 * remote marker programms.
 */
class Request {

	constructor({ parser, createXHR, urlJoin }) {
		this._parser = parser;
		this._createXHR = createXHR;
		this._urlJoin = urlJoin;
		this._xhr;
	}

	/**
	* Aborts the request.
	*
	* This triggers the response handler for this request and 
	* sets xhr.readyState == xhr.DONE and xhr.status == 0.
	*/
	abortRequest() {
		this._xhr.abort();
	}

	async requestSetup(markerUrl) {
		var url = this._urlJoin(markerUrl, '/setup');
		var response = await this._get(url);
		return this._parser.parseSetupResponse(response);
	}

	async requestMarkup(markerUrl, data) {
		data = this._parser.parseMarkupRequest(data) // debug
		var url = this._urlJoin(markerUrl, '/markup');
		var response = await this._post(url, data);
		return this._parser.parseMarkupResponse(response);
	}

	_get(url) {
		var that = this;
		return new Promise(function(resolve, reject) {

			that._xhr = that._createXHR();
			that._xhr.open('GET', url, true);
			that._xhr.send();
			that._xhr.onreadystatechange = function() {
				that._handleResponse(resolve, reject);
			}
		});
	}

	_post(url, data) {
		var that = this;
		return new Promise(function(resolve, reject) {

			that._xhr = that._createXHR();
			that._xhr.open('POST', url, true);
			that._xhr.setRequestHeader('Content-Type', 'application/json');
			that._xhr.send(JSON.stringify(data));
			that._xhr.onreadystatechange = function() {
				that._handleResponse(resolve, reject);
			}
		});
	}

	_handleResponse(resolve, reject) {
	
		if (this._xhr.readyState === this._xhr.DONE) {

			if (this._xhr.status === 0) {
				var msg = 'Something went wrong while requesting marker.';
				reject(new RequestError(msg));
			}
			else if (this._xhr.status === 200) {
				resolve(this._xhr.responseText);
			}
			else {
				var msg = 'Failed to receive data from marker. Server answers: ';
				msg = msg + this._xhr.status;
				reject(new RequestError(msg));
			}
		}
	}
}

module.exports = { Request };