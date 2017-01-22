/** @module db */
var db = (function() {

    'use strict';

    /**
    * Events
    */
    var markerAdded = new event.Event();
    var markerRemoved = new event.Event();
    var menuSizeChanged = new event.Event();

    /**
    * Supported style classes for markers
    */
    var styleClasses = [
        'vink-face-1',
        'vink-face-2',
        'vink-face-3',
        'vink-face-4',
        'vink-face-5',
        'vink-face-6',
        'vink-face-7',
        'vink-face-8',
        'vink-face-9'
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
    *   @prop {Array of Input} inputs - user inputs provided my marker
    *   @prob {String} styleClass - class attribute to style highlightings
    */
    function Marker(id, settings) {

        this.id = id;
        this.url = settings.url;
        this.name = settings.name;
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
                    markers: [],
                    currentMenuSize: 2,
                    menuSizeClasses: [
                        'vink-menu-size-xsmall',   // 0
                        'vink-menu-size-small',    // 1
                        'vink-menu-size-medium',   // 2
                        'vink-menu-size-large',    // 3
                        'vink-menu-size-xlarge'    // 4
                    ]
                });
            }
        });
    }

    /**
    * Set some default markers.
    */
    function setDefaultMarkers() {

        var settings1 = {
            name: 'Upper Case',
            url: 'http://mauser.pythonanywhere.com/upper-case/',
            description: 'Highlights all upper case words.',
        };
        var settings2 = {
            name: 'Proper Names',
            url: 'http://mauser.pythonanywhere.com/proper-names/',
            description: 'Highlights all proper names.'
        };
        var settings3 = {
            name: 'Local Test',
            url: 'http://localhost/test/',
            description: 'Test runs on localhost.'
        };

        add(settings1, function() {
            add(settings2, function() {
                add(settings3);
            });
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

            url = normalizeUrl(url);

            if(!checkUrl(url)) {
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
    * Normalizes an URL by removing the trailing slash (if exists).
    *
    * param {String} url
    * param {String} - normalized url
    */
    function normalizeUrl(url) {
        return url.replace(/\/*$/, '');
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
    * Return the current menu size class.
    *
    * @param {Function} callback - ({String} class)
    */
    function getMenuSize(callback) {
        var keys = ['menuSizeClasses', 'currentMenuSize']
        chrome.storage.local.get(keys, function(items) {
            callback(items.menuSizeClasses[items.currentMenuSize]);
        });
    }

    /**
    * Increases the stored menu size and fires menuSizeChanged.
    * If the current size level is max, then don't increase and
    * don't fire.
    */
    function increaseMenuSize() {
        var keys = ['menuSizeClasses', 'currentMenuSize']
        chrome.storage.local.get(keys, function(items) {
            if (items.currentMenuSize < items.menuSizeClasses.length - 1) {
                ++items.currentMenuSize;
                chrome.storage.local.set(items, function() {
                    menuSizeChanged.dispatch()
                });
            }
        });
    }

    /**
    * Decreases the stored menu size and fires menuSizeChanged.
    * If the current size level is min, then don't decrease and
    * don't fire.
    */
    function decreaseMenuSize() {
        chrome.storage.local.get('currentMenuSize', function(items) {
            if (items.currentMenuSize > 0) {
                --items.currentMenuSize;
                chrome.storage.local.set(items, function() {
                    menuSizeChanged.dispatch()
                });
            }
        });
    }

    /**
    * public
    */
    return {
        getMarker: getMarker,
        registerMarker: registerMarker,
        removeMarker: removeMarker,
        removeMarkerByUrl: removeMarkerByUrl,
        initStorage: initStorage,
        markerAdded: markerAdded,
        markerRemoved: markerRemoved,
        getMenuSize: getMenuSize,
        increaseMenuSize: increaseMenuSize,
        decreaseMenuSize: decreaseMenuSize,
        menuSizeChanged: menuSizeChanged
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    db.initStorage();
});
