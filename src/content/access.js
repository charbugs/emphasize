'use strict';

var { AccessError } = require('../common/errors.js');

class Access {

	constructor({ createPageMarker }) {
		this._createPageMarker = createPageMarker;
		this._currentMarker;
	}

	createPageMarker(jobId, markerSetup) {
		if (!this._currentMarker) {
			this._currentMarker = this._createPageMarker(jobId, markerSetup);
		} else {
			throw new AccessError('There already exists a marker instance');
		}
	}

	deletePageMarker(jobId) {
		if (!this._currentMarker)
			throw new AccessError('No marker instance available.');
		else if (this._currentMarker.jobId !== jobId)
			throw new AccessError('Job id mismatch.');
		else
			this._currentMarker = undefined;
	}

	extractWebPageData(jobId, ...args) {
		return this._callMarkerMethod(
			jobId, "extractWebPageData", args);
	}

	getWebPageDataForRemote(jobId, ...args) {
		return this._callMarkerMethod(
			jobId, "getWebPageDataForRemote", args);
	}

	annotate(jobId, ...args) {
		return this._callMarkerMethod(
			jobId, "annotate", args);
	}

	toggleAnnotation(jobId, ...args) {
		return this._callMarkerMethod(
			jobId, 'toggleAnnotation', args);
	}

	removeAnnotation(jobId, ...args) {
		return this._callMarkerMethod(
			jobId, "removeAnnotation", args);
	}

	_callMarkerMethod(jobId, method, args) {
		if (!this._currentMarker)
			throw new AccessError('No marker instance available.');
		else if (this._currentMarker.jobId !== jobId)
			throw new AccessError('Job id mismatch.');
		else
			return this._currentMarker[method]
				.apply(this._currentMarker, args);
	}
}

module.exports = { Access };