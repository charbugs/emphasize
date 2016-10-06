
var statuslog = (function(){

	// <meta name="vink-status-log" marker="id" inprogress="0" message="foobarbazbam">

	const META_NAME = 'vink-status-log';

	function StatusLogError(message) {

		this.message = message;
		this.stack = (new Error()).stack;
	}

	StatusLogError.prototype = Object.create(Error.prototype);
	StatusLogError.prototype.name = 'StatusLogError';

	function setStatus(attrs) {

		if (!document.querySelector('meta[marker="' + attrs.markerId + '"]')) {
			
			var meta = document.createElement('meta');

			meta.setAttribute('name', META_NAME);
			meta.setAttribute('marker', attrs.markerId || '');
			meta.setAttribute('inprogress', attrs.inprogress || '');
			meta.setAttribute('message', attrs.message || '');

			document.querySelector('head').appendChild(meta);
		}
		else {

			throw new StatusLogError(
				'Can not set the status for that marker. Status already exists');
		}
	}

	function changeStatus(attrs) {

		var meta = document.querySelector('meta[marker="' + attrs.markerId + '"]');

		if (meta) {

			// only the following attributes can be changed
			if (attrs.inprogress)
				meta.setAttribute('inprogress', attrs.inprogress);
			if (attrs.message)
				meta.setAttribute('message', attrs.message);
		}
		else {

			throw new StatusLogError(
				'Can not change the status for that marker. Status does not exist.');
		}
	}

	function removeStatus(attrs) {

		var meta = document.querySelector('meta[marker="' + attrs.markerId + '"]');
		if (meta) {
			meta.parentElement.removeChild(meta);
		}
		else {
			throw new StatusLogError(
				'Can nor remove status for that marker. Status does not exist.');
		}
	}

	return {
		setStatus: setStatus,
		changeStatus: changeStatus,
		removeStatus: removeStatus
	};

}());