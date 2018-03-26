/**
 * Defines a registration class to register new markers.
 */

var { RegistrationError } = require('../common/errors.js');

'use strict';

class Registration {

	constructor({ job, request, setupStore }) {
		Object.assign(this, job);
		this._request = request;
		this._setupStore = setupStore;
		this.successMessage = "Marker successfully added.";
		this._init();
	}

	_init() {
		this.error = null;
		this.inputUrl = null; // bound to an html input element
		this.stateReady();
	}

	reset(keepUserInput) {
		if (keepUserInput) {
			var userInput = this.inputUrl;
			this._init();
			this.inputUrl = userInput;
		} else {
			this._init();
		}
	}

	/**
 	* Registers an marker to the system.
 	*/
	async registerMarker() {

		this.stateWorking();

		try {
			await this._checkUrl(this.inputUrl);
			var setup = await this._request.requestSetup(this.inputUrl);
			setup.url = this.inputUrl;
			await this._setupStore.addSetup(setup);
			this.stateDone();
		}
		catch (err) {
			if (err.name === 'RequestError' ||
				err.name === 'ProtocolError' ||
				err.name === 'StorageError' ||
				err.name === 'RegistrationError') {
				this.error = err;
				this.stateError();
			} 
			else {
				throw err;
			}
		}
	}

	/**
	* Checks if a url is valid.
	*
	* param: (String) url
	*/
	_checkUrl(url) {
		var re = /^(http:\/\/|https:\/\/)\S+/;
		if (!url || url.search(re) === -1) {
			throw new RegistrationError('Need a valid HTTP URL.');
		}
	}

	/**
	 * Aborts a pending registration process.
	 *
	 * Will cause the waiting registerMarker() method to proceed.
	 */ 
	abortRegistration() {
		this._request.abortRequest();
	}

	async removeMarkerFromSystem(url) {
		await this._setupStore.removeSetup(url);
	}
}

module.exports = { Registration };