/**
 *	Defines a marker class.
 */
(function(emphasize) {

	'use strict';

	// shortcuts
	var request = emphasize.communication.request;
	var setupstore = emphasize.storage.setupstore;
	var invoke = emphasize.common.bgchannel.invoke;
	var Job = emphasize.common.job.Job;
	var RequestError = emphasize.common.errors.RequestError;
	var ProtocolError = emphasize.common.errors.ProtocolError;
	var MarkerError = emphasize.common.errors.MarkerError;

	/**
 	 * Represents the local part of an marker.
 	 * It requests the remote programm for analysis.
 	 *
 	 * param: (Setup) setup - marker setup.
 	 * param: (Number) tabId - tab the marker should work on.
 	 */
	function Marker(setup, tabId) {

		return (Object.assign({}, Job(), {
			
			setup: setup,
			tabId: tabId,

			init() {			
				this.error = null;
				this.output = null;
				this.input = {
					tokens: null,
					// user inputs: is bound to some html input elements.
					inputs: {},
					webpageUrl: null
				}
				this.stateReady();
				return this;
			},

			async reset(keepUserInput) {
				if (this.state = this.DONE) {
					await this.removeAnnotation();
				}

				if (keepUserInput) {
					var userInput = this.input.inputs;
					this.init();
					this.input.inputs = userInput;
				} else {
					this.init();	
				}
			},

			async apply() {
				try {
					this.stateWorking();
					await this.getInput();
					await this.analyze();
					await this.annotate();
					this.stateDone();
				} catch(err) {
					if (err instanceof RequestError ||
						err instanceof ProtocolError ||
						err instanceof MarkerError) {
						this.error = err;
						this.stateError();
					} 
					else {
						throw err;
					}
				}
			},

			/**
			 * Requests content scripts for webpage tokens etc.
			 *
			 * User input from form elements should already be present
			 * in `this.input.inputs`.
			 */
			async getInput() {
				await invoke(this.tabId, 'extract.extractTextNodes');
				var tokens = await invoke(this.tabId, 'extract.getWords');
				var wpUrl = await invoke(this.tabId, 'extract.getUrl');
				this.input.tokens = tokens;
				this.input.webpageUrl = wpUrl;
			},

			/**
			 * Requests the marker to analyze the input data.
			 */
			async analyze() {
				this.output = await request.requestMarkup(
					this.id, this.setup.url, this.input);

				if (this.output.hasOwnProperty('error')) {
					throw new MarkerError(output.error); 
				}
			},

			/**
			 * Annotates the web page text according to the output
			 * of the analysis.
			 */
			async annotate() {
				await invoke(this.tabId, 'highlight.highlight',
					this.output.markup, 
					{ id: this.id, styleClass: this.setup.face });
			},

			/**
	 	 	 * Aborts a pending markup request.
	 	 	 *
	  	 	 * Will cause the waiting analyze() method to proceed.
	 	 	 */ 
			abortAnalysis() {
				request.abortRequest(this.id);
			},

			/**
			 * Removes annotation from web page.
			 */
			async removeAnnotation() {
				await invoke(this.tabId, 'highlight.remove', this.id);
			}

		})).init();
	}

	// exports 
	emphasize.annotation.marker = {
		Marker
	};

})(emphasize);