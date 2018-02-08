/**
 * Defines a registration class to register new markers.
 */
(function(pool) {

	'use strict';

	class Registration {

		constructor(props = {}) {

			Object.assign(this, props.job);

			this._request = props.request;
			this._setupStore = props.setupStore;
			this._createRequestError = props.createRequestError;
			this._createProtocolError = props.createProtocolError;
			this._createStorageError = props.createStorageError;
			this._createRegistrationError = props.createRegistrationError;
			
			this.report = "Marker successfully added.";
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
				throw this._createRegistrationError('Need a valid HTTP URL.');
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
	}

	pool.Registration = Registration;

})(emphasize.pool);