/**
 *	Defines a marker class.
 */
(function(pool) {

	'use strict';
	
	/**
 	 * param: (Setup) setup - marker setup.
 	 * param: (Number) tabId - tab the marker should work on.
 	 */
	class Marker {

		constructor(setup, tabId, job, messaging, request, 
			RequestError, ProtocolError, MarkerError) {

			Object.assign(this, job);
			
			this.setup = setup;
			this.tabId = tabId;
			this.messaging = messaging;
			this.request = request;
			this.RequestError = RequestError;
			this.ProtocolError = ProtocolError;
			this.MarkerError = MarkerError;
			
			this._init();
			this.stateReady();
		}

		_init() {
			this.error = null;
			this.output = null;
			this.input = {
				tokens: null,
				// user inputs: is bound to some html input elements.
				inputs: {},
				webpageUrl: null
			}
		}

		async apply() {
			try {
				this.stateWorking();
				await this._createPageMarker();
				await this._getInput();
				await this._analyze();
				await this._annotate();
				await this._deletePageMarker();
				this.stateDone();
			} 
			catch(err) {
				if (err.name === 'RequestError' ||
					err.name === 'ProtocolError' ||
					err.name === 'MarkerError') {
					this.error = err;
					this.stateError();
				} 
				else {
					throw err;
				}
			}
		}

		async reset(keepUserInput) {
			if (keepUserInput)
				var userInput = this.input.inputs;

			this.stateWorking();
			await this._createPageMarker();
			await this._removeAnnotation();
			await this._deletePageMarker();
			this._init();
			this.stateReady();

			if (keepUserInput)
				this.input.inputs = userInput;
		}

		/**
 	 	 * Aborts a pending markup request.
 	 	 *
  	 	 * Will cause the waiting analyze() method to proceed.
 	 	 */ 
		abortAnalysis() {
			this.request.abortRequest();
		}

		async _createPageMarker() {
			await this.messaging.invoke(
				this.tabId, 'createPageMarker', this.id, this.setup.face);
		}

		async _deletePageMarker() {
			await this.messaging.invoke(
				this.tabId, 'deletePageMarker', this.id);
		}

		/**
		 * Requests content scripts for webpage tokens etc.
		 *
		 * User input from form elements should already be present
		 * in `this.input.inputs`.
		 */
		async _getInput() {

			await this.messaging.invoke(
				this.tabId, 'extractWebPageData', this.id);

			var wpData = await this.messaging.invoke(
				this.tabId, 'getWebPageDataForRemote', this.id);

			this.input.tokens = wpData.tokens;
			this.input.webpageUrl = wpData.url;
		}

		/**
		 * Requests the marker to analyze the input data.
		 */
		async _analyze() {

			this.output = await this.request.requestMarkup(
				this.setup.url, this.input);

			if (this.output.hasOwnProperty('error')) {
				throw this.MarkerError(output.error); 
			}
		}

		/**
		 * Annotates the web page text according to the output
		 * of the analysis.
		 */
		async _annotate() {
			await this.messaging.invoke(
				this.tabId, 'annotate',	this.id, this.output.markup);
		}

		/**
		 * Removes annotation from web page.
		 */
		async _removeAnnotation() {
			await this.messaging.invoke(
				this.tabId, 'removeAnnotation', this.id);
		}
	}

	pool.Marker = Marker;

})(emphasize.pool);