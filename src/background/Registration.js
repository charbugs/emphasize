/**
 * Defines a registration class to register new markers.
 */
(function(pool) {

	'use strict';

	class Registration {

		constructor(job, request, setupStore,
			RequestError, ProtocolError, StorageError, RegistrationError) {

			Object.assign(this, job);
			this.request = request;
			this.setupStore = setupStore;
			this.RequestError = RequestError;
			this.ProtocolError = ProtocolError;
			this.StorageError = StorageError;
			this.RegistrationError = RegistrationError;
			this.report = "Marker successfully added.";
			this.init();
		}

		init() {
			this.error = null;
			this.inputUrl = null; // bound to an html input element
			this.stateReady();
		}

		reset(keepUserInput) {
			if (keepUserInput) {
				var userInput = this.inputUrl;
				this.init();
				this.inputUrl = userInput;
			} else {
				this.init();
			}
		}

		/**
	 	* Registers an marker to the system.
	 	*/
		async registerMarker() {

			this.stateWorking();

			try {
				await this._checkUrl(this.inputUrl);
				var setup = await this.request.requestSetup(this.inputUrl);
				setup.url = this.inputUrl;
				await this.setupStore.addSetup(setup);
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
				throw this.RegistrationError('Need a valid HTTP URL.');
			}
		}

		/**
		 * Aborts a pending registration process.
		 *
		 * Will cause the waiting registerMarker() method to proceed.
		 */ 
		abortRegistration() {
			this.request.abortRequest();
		}
	}

	pool.Registration = Registration;

})(emphasize.pool);