/**
 * Defines a registration class to register new markers.
 */

var { RegistrationError } = require('../common/errors.js');

'use strict';

class Registration {

	constructor({ jobId, request, setupStore, createStateManager, validUrl }) {
		
		Object.assign(this, createStateManager([
			'READY', 'WORKING', 'ERROR', 'ADDED', 'REMOVED']));

		this.jobId = jobId;
		this._request = request;
		this._setupStore = setupStore;
		this._validUrl = validUrl;

		this.reset(false, false);
	}

	reset(keepUserInput, fire) {
		this.error = null;
		this.successMessage = null;
		if (!keepUserInput)
			this.inputUrl = null; // bound to an html input element
		this.changeState(this.READY, fire)
	}

	/**
 	* Registers an marker to the system.
 	*/
	async registerMarker() {

		this.changeState(this.WORKING);

		try {
			await this._checkUrl(this.inputUrl);
			var setup = await this._request.requestSetup(this.inputUrl);
			setup.url = this.inputUrl;
			await this._setupStore.addSetup(setup);
			this.successMessage = "Marker successfully added.";
			this.changeState(this.ADDED);
		}
		catch (err) {
			if (err.name === 'RequestError' ||
				err.name === 'ProtocolError' ||
				err.name === 'StorageError' ||
				err.name === 'RegistrationError') {
				this.error = err;
				this.changeState(this.ERROR);
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
		if (!this._validUrl.isWebUri(url)) {
			throw new RegistrationError('Need a valid HTTP or HTTPS URL.');
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
		this.changeState(this.REMOVED);
	}
}

module.exports = { Registration };