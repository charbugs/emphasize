(function(pool) {

	'use strict';

	class Access {

		constructor(props = {}) {
			this._createPageMarker = props.createPageMarker;
			this._createAccessError = props.createAccessError;
			this._currentMarker;
		}

		createPageMarker(jobId, styleClass) {
			if (!this._currentMarker) {
				this._currentMarker = this._createPageMarker(jobId, styleClass);
			} else {
				throw this._createAccessError(
					'There already exists a marker instance');
			}
		}

		deletePageMarker(jobId) {
			if (!this._currentMarker)
				throw this._createAccessError('No marker instance available.');
			else if (this._currentMarker.jobId !== jobId)
				throw this._createAccessError('Job id mismatch.');
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

		removeAnnotation(jobId, ...args) {
			return this._callMarkerMethod(
				jobId, "removeAnnotation", args);
		}

		_callMarkerMethod(jobId, method, args) {
			if (!this._currentMarker)
				throw this._createAccessError('No marker instance available.');
			else if (this._currentMarker.jobId !== jobId)
				throw this._createAccessError('Job id mismatch.');
			else
				return this._currentMarker[method]
					.apply(this._currentMarker, args);
		}
	}

	// export
	pool.Access = Access;

})(emphasize.pool);