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

	constructor({ setup, tabId, jobId, createStateManager, messaging, request }) {

		Object.assign(this, createStateManager([
			'READY', 'WORKING', 'ERROR', 'MARKED']));
		
		this.jobId = jobId;
		this.setup = setup;
		this.tabId = tabId;
		this._messaging = messaging;
		this._request = request;
		
		this.reset(false, false);
	}

	///////////////////////////////////////////////////////
	// API
	///////////////////////////////////////////////////////

	async reset(keepUserInput, fire) {
		// do we have annotations in web page?
		if (this.state === this.MARKED) {
			await this._startAnnotationJob();
			await this._removeAnnotation();
			await this._stopAnnotationJob();
		}

		this.error = null;
		this.output = null;
		this.input = null;
		this.annotationHidden = false;

		if (!keepUserInput)
			this.userInputs = this._createInputContainer();
		
		this.changeState(this.READY, fire);
	}

	async apply() {

		try {
			this.changeState(this.WORKING);
			await this._startAnnotationJob();
			await this._collectInput();
			await this._analyze();
			await this._annotate();
			await this._stopAnnotationJob();
			this.changeState(this.MARKED);
		} 
		catch(err) {
			if (err.name === 'RequestError' ||
				err.name === 'ProtocolError' ||
				err.name === 'MarkerError') {
				this.error = err;
				await this._stopAnnotationJob();
				this.changeState(this.ERROR);
			} 
			else {
				throw err;
			}
		}
	}

	async toggleAnnotation() {
		await this._startAnnotationJob();
		await this._toggleAnnotation();
		await this._stopAnnotationJob();
		this.annotationHidden = !this.annotationHidden;
	}

	abortAnalysis() {
		this._request.abortRequest();
	}

	///////////////////////////////////////////////////////
	// privats
	///////////////////////////////////////////////////////

	_createInputContainer() {
		var container = {};
		if (this.setup.inputs) {
			this.setup.inputs.forEach(input => {
				container[input.id] = '';
			});
		}
		return container;
	}

	/**
	 * Requests content scripts for webpage tokens etc.
	 *
	 * User input from form elements should already be present
	 * in `this.input.inputs`.
	 */
	async _collectInput() {
		this.input = {};
		this.input.tokens = await this._getTokens();
		this.input.url = await this._getUrl();
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

	///////////////////////////////////////////////////////
	// web page side delegators
	///////////////////////////////////////////////////////

	async _startAnnotationJob() {
		await this._messaging.invoke(
			this.tabId, 'startAnnotationJob', this.jobId, this.setup);
	}

	async _stopAnnotationJob() {
		await this._messaging.invoke(
			this.tabId, 'stopAnnotationJob', this.jobId);
	}

	async _getTokens() {
		return await this._messaging.invoke(
			this.tabId, 'getTokens', this.jobId);
	}

	async _getUrl() {
		return await this._messaging.invoke(
			this.tabId, 'getUrl', this.jobId);
	}	

	async _annotate() {
		await this._messaging.invoke(
			this.tabId, 'annotate',	this.jobId, this.output.markup);
	}

	async _toggleAnnotation() {
		await this._messaging.invoke(
			this.tabId, 'toggleAnnotation', this.jobId);
	}

	async _removeAnnotation() {
		await this._messaging.invoke(
			this.tabId, 'removeAnnotation', this.jobId);
	}
}

module.exports = { Marker };