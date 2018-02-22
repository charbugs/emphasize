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

		constructor(props = {}) {

			Object.assign(this, props.job);
			
			this.setup = props.setup;
			this.tabId = props.tabId;
			this._messaging = props.messaging;
			this._request = props.request;
			this._createRequestError = props.createRequestError;
			this._createProtocolError = props.createProtocolError;
			this._createMarkerError = props.createMarkerError;
			
			this._init();
			this.stateReady();
		}

		_init(keepUserInput) {
			this.error = null;
			this.output = null;
			this.input = {};
			if (!keepUserInput)
				this.userInputs = {};
		}

		async apply() {

			try {
				this.stateWorking();
				await this._createPageMarker();
				await this._collectInput();
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
					await this._deletePageMarker();
					this.stateError();
				} 
				else {
					throw err;
				}
			}
		}

		async reset(keepUserInput) {
			// do we have annotations in web page?
			if (this.state === this.DONE) {
				await this._createPageMarker();
				await this._removeAnnotation();
				await this._deletePageMarker();
			}

			this._init(keepUserInput);
			this.stateReady();
		}

		async toggleAnnotation() {
			await this._createPageMarker();
			await this._messaging.invoke(this.tabId, 
				'toggleAnnotation', this.jobId);
			await this._deletePageMarker();
		}

		/**
 	 	 * Aborts a pending markup request.
 	 	 *
  	 	 * Will cause the waiting analyze() method to proceed.
 	 	 */ 
		abortAnalysis() {
			this._request.abortRequest();
		}

		async _createPageMarker() {
			await this._messaging.invoke(
				this.tabId, 'createPageMarker', this.jobId, this.setup);
		}

		async _deletePageMarker() {
			await this._messaging.invoke(
				this.tabId, 'deletePageMarker', this.jobId);
		}

		/**
		 * Requests content scripts for webpage tokens etc.
		 *
		 * User input from form elements should already be present
		 * in `this.input.inputs`.
		 */
		async _collectInput() {

			await this._messaging.invoke(
				this.tabId, 'extractWebPageData', this.jobId);

			var wpData = await this._messaging.invoke(
				this.tabId, 'getWebPageDataForRemote', this.jobId);

			this.input.tokens = wpData.tokens;
			this.input.url = wpData.url;
			this.input.inputs = this._createInputContainer();
			Object.assign(this.input.inputs, this.userInputs);
		}

		_createInputContainer() {
			var container = {};
			this.setup.inputs.forEach(input => {
				container[input.id] = null;
			});
			return container;
		}

		/**
		 * Requests the marker to analyze the input data.
		 */
		async _analyze() {

			this.output = await this._request.requestMarkup(
				this.setup.url, this.input);

			if (this.output.hasOwnProperty('error')) {
				throw this._createMarkerError(this.output.error); 
			}
		}

		/**
		 * Annotates the web page text according to the output
		 * of the analysis.
		 */
		async _annotate() {
			await this._messaging.invoke(
				this.tabId, 'annotate',	this.jobId, this.output.markup);
		}

		/**
		 * Removes annotation from web page.
		 */
		async _removeAnnotation() {
			await this._messaging.invoke(
				this.tabId, 'removeAnnotation', this.jobId);
		}
	}

	pool.Marker = Marker;

})(emphasize.pool);