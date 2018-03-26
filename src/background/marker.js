/**
 *	Defines a marker class.
 */

var { MarkerError } = require('../common/errors.js');

'use strict';

/**
 * param: (Setup) setup - marker setup.
 * param: (Number) tabId - tab the marker should work on.
 */
class Marker {

	constructor({ setup, tabId, job, messaging, request }) {

		Object.assign(this, job);
		
		this.setup = setup;
		this.tabId = tabId;
		this._messaging = messaging;
		this._request = request;
		
		this._init();
		this.stateReady();
	}

	_init(keepUserInput) {
		this.error = null;
		this.output = null;
		this.input = null;
		if (!keepUserInput)
			this.userInputs = this._createInputContainer();
		this.annotationHidden = false;
	}

	_createInputContainer() {
		var container = {};
		this.setup.inputs.forEach(input => {
			container[input.id] = '';
		});
		return container;
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

	async reset(keepUserInput = true , fire = true) {
		// do we have annotations in web page?
		if (this.state === this.DONE) {
			await this._createPageMarker();
			await this._removeAnnotation();
			await this._deletePageMarker();
		}

		this._init(keepUserInput);
		
		if (fire)
			this.stateReady();
	}

	async toggleAnnotation() {
		await this._createPageMarker();
		await this._messaging.invoke(this.tabId, 
			'toggleAnnotation', this.jobId);
		await this._deletePageMarker();
		this.annotationHidden = !this.annotationHidden;
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

		this.input = {};
		this.input.tokens = wpData.tokens;
		this.input.url = wpData.url;
		this.input.inputs = this.userInputs;
	}

	/**
	 * Requests the marker to analyze the input data.
	 */
	async _analyze() {

		this.output = await this._request.requestMarkup(
			this.setup.url, this.input);

		if (this.output.hasOwnProperty('error')) {
			throw new MarkerError(this.output.error); 
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

module.exports = { Marker };