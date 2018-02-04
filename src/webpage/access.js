(function(em) {

	'use strict';

	var currentMarker;
	var exectutionOrder = [ 
		'extractWebPageData', 
		'getWebPageDataForRemote',
		'annotate',
		'removeAnnotation'
	];

	function createMarker(markerId) {
		if (!currentMarker) {
			var marker = new em.marker.Marker(markerId);
			currentMarker = em.sequence.sequenceSyncMethodExecution(
				marker, exectutionOrder);
		}
		else {
			throw new em.errors.AccessError(
				'There already exists a marker instance');
		}
	}

	function deleteMarker(markerId) {
		if (!currentMarker)
			throw new em.errors.AccessError('No marker instance available.');
		else if (currentMarker.id !== markerId)
			throw new em.errors.AccessError('Marker id mismatch.');
		else
			currentMarker = undefined;
	}

	function extractWebPageData(markerId) {
		return _callMarkerMethod(markerId, "extractWebPageData");
	}

	function getWebPageDataForRemote(markerId) {
		return _callMarkerMethod(markerId, "getWebPageDataForRemote");
	}

	function annotate(markerId, remoteMarkup, styleClass) {
		return _callMarkerMethod(markerId, "annotate", [remoteMarkup, styleClass]);
	}

	function removeAnnotation(markerId) {
		return _callMarkerMethod(markerId, "removeAnnotation");
	}

	function _callMarkerMethod(markerId, method, args) {
		if (!currentMarker)
			throw new em.errors.AccessError('No marker instance available.');
		else if (currentMarker.id !== markerId)
			throw new em.errors.AccessError('Marker id mismatch.');
		else
			return currentMarker[method].apply(currentMarker, args);
	}

	function _getCurrentMarker() {
		return currentMarker;
	}

	function _setCurrentMarker(marker) {
		currentMarker = marker;
	}

	em.access = {
		createMarker,
		deleteMarker,
		extractWebPageData,
		getWebPageDataForRemote,
		annotate,
		removeAnnotation,
		_getCurrentMarker,
		_setCurrentMarker
	}

})(emphasize);