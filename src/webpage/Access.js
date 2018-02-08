(function(pool) {

	'use strict';

	class Access {

		constructor(props = {}) {
			this._createPageMarker = props.createPageMarker;
			this._createAccessError = props.createAccessError;
			this._currentMarker;
		}

		createPageMarker(markerId, styleClass) {
			if (!this._currentMarker) {
				this._currentMarker = this._createPageMarker(markerId, styleClass);
			} else {
				throw this._createAccessError(
					'There already exists a marker instance');
			}
		}

		deletePageMarker(markerId) {
			if (!this._currentMarker)
				throw this._createAccessError('No marker instance available.');
			else if (this._currentMarker.id !== markerId)
				throw this._createAccessError('Marker id mismatch.');
			else
				this._currentMarker = undefined;
		}

		extractWebPageData(markerId, ...args) {
			return this._callMarkerMethod(
				markerId, "extractWebPageData", args);
		}

		getWebPageDataForRemote(markerId, ...args) {
			return this._callMarkerMethod(
				markerId, "getWebPageDataForRemote", args);
		}

		annotate(markerId, ...args) {
			return this._callMarkerMethod(
				markerId, "annotate", args);
		}

		removeAnnotation(markerId, ...args) {
			return this._callMarkerMethod(
				markerId, "removeAnnotation", args);
		}

		_callMarkerMethod(markerId, method, args) {
			if (!this._currentMarker)
				throw this._createAccessError('No marker instance available.');
			else if (this._currentMarker.id !== markerId)
				throw this._createAccessError('Marker id mismatch.');
			else
				return this._currentMarker[method]
					.apply(this._currentMarker, args);
		}
	}

	// export
	pool.Access = Access;

})(emphasize.pool);