/** 
* @module satuslog
*/
var statuslog = (function (){

	// <meta    name="vink-status-log" 
    //          markerid="4" 
    //          inprogress="0" 
    //          message="foobarbazbam"
    //          face="3">

	/** Value for the name attribute of meta elements */
	const META_NAME = 'vink-status-log';

	/** 
	* The module's error object
	*
	* @param {String} message - error message
	*/
	function StatusLogError(message) {

		this.message = message;
		this.stack = (new Error()).stack;
	}
	StatusLogError.prototype = Object.create(Error.prototype);
	StatusLogError.prototype.name = 'StatusLogError';

	/**
	* Respresents the status of a marker in a web page.
	*
	* @param {Number} markerId
	* @param {Number} inprogress - greater then 0 if the marker was called but the highlighting process is not done so far.
	* @param {String} message - message of marker app.
	*/
	function Status(markerId, inprogress, message) {
		
		this.markerId = markerId;
		this.inprogress = inprogress;
		this.message = message;
	}

	/**
	* Returns the status for a specific marker.
	* 
	* @param {Number} markerId
	* @param {Function} callback - ({jsonisable} err, {Status} status)
	*/
    function getStatus(markerId, callback) {
        
        var meta = document.querySelector('meta[markerid="'+markerId+'"]');

        if (meta) {

			var status = new Status (
				markerId,
				parseInt(meta.getAttribute('inprogress')),
				meta.getAttribute('message')
			);

            if (callback) {
                callback(null, status);
            }
        } 
        else if(callback){
            callback(null, null);
        }
    }

    /**
	* Returns all statuses.
	* 
	* @param {Function} callback - ({jsonisable} err, {Array of Status} status)
	*/
    function getAllStatuses(callback) {
        
        var metas = document.querySelectorAll('meta[markerid]');
    
        if(metas.length > 0) {

            var statuses = [];
            for (var meta of metas) {

                statuses.push(new Status(
                    meta.getAttribute('markerid'),
    				parseInt(meta.getAttribute('inprogress')),
    				meta.getAttribute('message')
                ));
            }
            
            if (callback) {
                callback(null, statuses);
            }
        }
        else if(callback) {
            callback(null, null);
        }
    }

	/**
	* Set the status for a specific marker.
	*
	* @param {Object (Status like)} status
	* @param {Function} callback - ({jsonisable} err, {jsonsisable} data)
	*/ 
	function setStatus(status, callback) {

		if (!status.markerId) {
			throw new StatusLogError(
				'Can not set the status. No marker id given.');
		}

		if (!document.querySelector('meta[markerid="' + status.markerId + '"]')) {
			
			var meta = document.createElement('meta');

			meta.setAttribute('name', META_NAME);
			meta.setAttribute('markerid', status.markerId);
			meta.setAttribute('inprogress', status.inprogress || '');
			meta.setAttribute('message', status.message || '');

			document.querySelector('head').appendChild(meta);

			if (callback) {
				callback(null, null);
			}

		} else {
			throw new StatusLogError(
				'Can not set the status for that marker. Status already exists.');
		}
	}

	/**
	* Change the status of a specific marker.
	* 
	* @param {Object (Status like)} status
	* @param {Function} callback - ({jsonisable} err, {jsonsisable} data)
	*/
	function changeStatus(status, callback) {

		var meta = document.querySelector('meta[markerid="' + status.markerId + '"]');

		if (meta) {

			// only the following attributes can be changed
			if (status.hasOwnProperty('inprogress'))
				meta.setAttribute('inprogress', status.inprogress);
			if (status.hasOwnProperty('message'))
				meta.setAttribute('message', status.message);

			if (callback) {
				callback(null, null);
			}

		} else {
			throw new StatusLogError(
				'Can not change the status for that marker. Status does not exist.');
		}
	}

	/**
	* Remove the status for a specific marker.
	*
	* @param {Number} markerId
	* @param {Function} callback - ({jsonisable} err, {jsonisable} data)
	*/
	function removeStatus(markerId, callback) {

		var meta = document.querySelector('meta[markerid="' + markerId + '"]');

		if (meta) {
			meta.parentElement.removeChild(meta);
        }
      	if (callback) {
		    callback(null, null);
		}


	}

	return {
		getStatus: getStatus,
        getAllStatuses: getAllStatuses,
		setStatus: setStatus,
		changeStatus: changeStatus,
		removeStatus: removeStatus
	};

}());
