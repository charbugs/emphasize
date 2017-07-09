/** @module db */
var db = (function() {

    'use strict';

    /**
    * Events
    */
    var markerAdded = new event.Event();
    var markerRemoved = new event.Event();

    /**
    * Supported style classes for markers
    */
    var styleClasses = [
        'emphasize-face-1',
        'emphasize-face-2',
        'emphasize-face-3',
        'emphasize-face-4',
        'emphasize-face-5',
        'emphasize-face-6',
        'emphasize-face-7',
        'emphasize-face-8',
        'emphasize-face-9'
    ];

    /**
	* An Error that will be thrown if something went wrong while changing database.
	*/
	function DatabaseError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	DatabaseError.prototype = Object.create(Error.prototype);
	DatabaseError.prototype.name = 'DatabaseError';

    /**
    * Represents a Marker.
    *
    * @param {Number} id - unique id
    * @param {Object} settings
    *   @prop {String} url
    *   @prop {String} name
    *   @prop {String} description
    *   @prop {String} a short description
    *   @prop {Array of Input} inputs - user inputs provided my marker
    *   @prob {String} styleClass - class attribute to style highlightings
    */
    function Marker(id, settings) {

        this.id = id;
        this.url = settings.url;
        this.title = settings.title;
        this.subtitle = settings.subtitle;
        this.description = settings.description;
        this.inputs = settings.inputs;
        this.styleClass = settings.styleClass;
    }

    /**
    * If the storage is empty init it.
    */
    function initStorage() {
        chrome.storage.local.get(null, function(items) {
            if (Object.keys(items).length == 0) {
                chrome.storage.local.set({
                    lastId: 0,
                    markers: []
                });
            }
        });
    }

    /**
    * Returns one or all marker(s) from storage.
    *
    * @param {Number | null} id - id of the marker to return (null if all)
    * @param {Function} callback - fn({Marker} marker | {Array of Marker} markers).
    */
    function getMarker(id, callback) {

        chrome.storage.local.get('markers', function(items) {
            if (id === null)
                callback(items.markers);
            else {
                for (var key in items.markers) {
                    if (items.markers[key].id === id) {
                        callback(items.markers[key]);
                        break;
                    }
                }
            }
        });
    }

    /**
    * Registers a new marker to the database.
    *
    * Fires markerAdded on success.
    *
    * @param {String} requestId - Id for the http request.
    * @param {String} url - Url of marker to register.
    * @param {Function} [callback] - fn(err, new marker).
    */
    function registerMarker(requestId, url, callback) {

        chrome.storage.local.get(null, function(items) {

            var markers = items.markers;

            if(url === undefined || !checkUrl(url)) {
                var msg = 'Need a valid HTTP URL';
                if (callback)
                    callback(new DatabaseError(msg), null);
                return;
            }

            if(urlExists(url, markers)) {
                var msg = 'A marker of this URL already exists.';
                if (callback)
                    callback(new DatabaseError(msg), null);
                return;
            }

            request.requestSetup(requestId, url, function(err, setup) {

                if (err) {
                    if (callback)
                        callback(err, null);
                    return;
                }

                setup.url = url;
                setup.styleClass = determineStyleClass(markers);
                var newMarker = new Marker(++items.lastId, setup);
                markers.push(newMarker);
                var updated = {markers: markers, lastId: items.lastId};

                chrome.storage.local.set(updated, function() {

                    if (callback)
                        callback(null, newMarker);

                    markerAdded.dispatch(newMarker);
                });

            });
        });
    }

    /**
    * Checks if a url is valid in terms of the database.
    *
    * @param {String} url
    * @return {Boolean} - True if valid.
    */
    function checkUrl (url) {
        return url.search(/^(http:\/\/|https:\/\/)/) === -1 ? false : true;
    }

    /**
    * Checks if a marker with the given url already exists in database.
    *
    *
    * @param {String} url
    * @param {Array of Marker} markers - Existing markers.
    * @return {Boolean} - True if exists.
    */
    function urlExists(url, markers) {
        var existing = markers.map(m => m.url);
        return (existing.indexOf(url) === -1) ? false : true;
    }

    /**
    * Returns a class attribute that determines the face of the marker.
    *
    * @param {Array of Markers} markers - Existing markers.
    * @return {String} - class attribute
    */
    function determineStyleClass(markers) {

        var exist = markers.map(marker => marker.styleClass);
        var nonExist = styleClasses.filter(c => exist.indexOf(c) === -1);
        var rand = Math.random();

        if (nonExist.length === 0) {
            var i = Math.floor(rand * styleClasses.length);
            return styleClasses[i];
        }
        else  {
            var i = Math.floor(rand * nonExist.length);
            return nonExist[i];
        }
    }

    /**
    * Remove a marker from storage.
    *
    * Fires markerRemoved on success.
    *
    * @param {Number} id - Id of the marker to remove.
    * @param {Function} [callback] - fn(err, removed marker).
    */
    function removeMarker(id, callback) {

        chrome.storage.local.get('markers', function(items) {

            var markers = items.markers;
            for (var i=0; i < markers.length; i++) {

                if (markers[i].id === id) {

                    let marker = markers.splice(i, 1)[0];
                    chrome.storage.local.set({markers: markers}, function() {

                        if (callback) {
                            callback(null, marker);
                        }

                        markerRemoved.dispatch(marker);
                    });
                }
            }
        });
    }

    /**
    * Remove a marker from storage.
    *
    * Fires markerRemoved on success.
    *
    * @param {String} url - Url of the marker to remove.
    * @param {Function} [callback] - fn(err, removed marker).
    */
    function removeMarkerByUrl(url, callback) {

        chrome.storage.local.get('markers', function(items) {

            var markers = items.markers;
            for (var i=0; i < markers.length; i++) {

                if (markers[i].url === url) {

                    let marker = markers.splice(i, 1)[0];
                    chrome.storage.local.set({markers: markers}, function() {

                        if (callback) {
                            callback(null, marker);
                        }

                        markerRemoved.dispatch(marker);
                    });
                }
            }
        });
    }

    /**
    * public
    */
    return {
        // methods
        getMarker: getMarker,
        registerMarker: registerMarker,
        removeMarker: removeMarker,
        removeMarkerByUrl: removeMarkerByUrl,
        initStorage: initStorage,
        // events
        markerAdded: markerAdded,
        markerRemoved: markerRemoved,
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    db.initStorage();
});
