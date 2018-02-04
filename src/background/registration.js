/**
 * Defines a registration class to register new markers.
 */
(function(em) {

	'use strict';

	function Registration() {

		return (Object.assign({}, em.job.Job(), {

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
					var setup = await em.request.requestSetup(this.id, this.inputUrl);
					setup.url = this.inputUrl;
					setup.face = await em.facestore.determineFaceClass();
					await em.setupstore.addSetup(setup);
					this.stateDone();
				}
				catch (err) {
					if (err instanceof em.errors.RequestError ||
						err instanceof em.errors.ProtocolError ||
						err instanceof em.errors.StorageError) {
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
				em.request.abortRequest(this.id);
			}

		})).init();
	}

	// exports 
	em.registration = {
		Registration
	}

})(emphasize);