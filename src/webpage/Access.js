(function(pool) {

	'use strict';

	class Access {

		constructor(props = {}) {
			this.Marker = props.Marker;
			this.AccessError = props.AccessError;
			this.currentMarker;
		}

		createMarker(markerId, styleClass) {
			if (!this.currentMarker) {
				this.currentMarker = this.Marker(markerId, styleClass);
			} else {
				throw this.AccessError('There already exists a marker instance');

			}
		}

		deleteMarker(markerId) {
			if (!this.currentMarker)
				throw this.AccessError('No marker instance available.');
			else if (this.currentMarker.id !== markerId)
				throw this.AccessError('Marker id mismatch.');
			else
				this.currentMarker = undefined;
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
			if (!this.currentMarker)
				throw this.AccessError('No marker instance available.');
			else if (this.currentMarker.id !== markerId)
				throw this.AccessError('Marker id mismatch.');
			else
				return this.currentMarker[method]
					.apply(this.currentMarker, args);
		}
	}

	// export
	pool.Access = Access;

})(emphasize.pool);