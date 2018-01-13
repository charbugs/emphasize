/**
 * Defines a registration class to register new markers.
 */
(function(emphasize) {

	'use strict';

	// shortcuts
	var request = emphasize.communication.request;
	var setupstore = emphasize.storage.setupstore;
	var facestore = emphasize.storage.facestore;
	var Job = emphasize.common.job.Job;
	var RequestError = emphasize.common.errors.RequestError;
	var ProtocolError = emphasize.common.errors.ProtocolError;
	var StorageError = emphasize.common.errors.StorageError;

	function Registration() {

		return (Object.assign({}, Job(), {

			report: "Marker successfully added.",

			init() {
				this.error = null;
				this.inputUrl = null; // bound to an html input element
				this.stateReady();
				return this;
			},

			reset(keepUserInput) {
				if (keepUserInput) {
					var userInput = this.inputUrl;
					this.init();
					this.inputUrl = userInput;
				} else {
					this.init();
				}
			},

			/**
		 	* Registers an marker to the system.
		 	*/
			async registerMarker() {

				this.stateWorking();

				try {
					var setup = await request.requestSetup(this.id, this.inputUrl);
					setup.url = this.inputUrl;
					setup.face = await facestore.determineFaceClass();
					await setupstore.addSetup(setup);
					this.stateDone();
				}
				catch (err) {
					if (err instanceof RequestError ||
						err instanceof ProtocolError ||
						err instanceof StorageError) {
						this.error = err;
						this.stateError();
					} 
					else {
						throw err;
					}
				}
			},

			/**
			 * Aborts a pending registration process.
			 *
			 * Will cause the waiting registerMarker() method to proceed.
			 */ 
			abortRegistration() {
				request.abortRequest(this.id);
			}

		})).init();
	}

	// exports 
	emphasize.administration.registration = {
		Registration
	}

})(emphasize);