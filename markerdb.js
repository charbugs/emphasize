/** @module markerdb */
var markerdb = (function() {

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
    * Events
    */
    var markerAdded = new event.Event();
    var markerRemoved = new event.Event();
    
    /**
    * If the storage is empty init it and set some default markers.
    */
    function initStorage() {

        chrome.storage.local.get(null, function(items) {
            if (Object.keys(items).length == 0) {
                chrome.storage.local.set({
                    lastId: 0,
                    markers: []
                });

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

                /*add(settings1, function() {
                    add(settings2, function() {
                        add(settings3);
                    });
                });*/
            }
        });
    }

    /**
    * Returns one or all marker(s) from storage.
    * 
    * @param {Number | null} id - id of the marker to return (null if all)
    * @param {Function} callback - fn({Marker} marker | {Array of Marker} markers).
    */
    function get(id, callback) {

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

    function urlExists(url, markers) {
        existing = markers.map(m => m.url);
        return (existing.indexOf(url) === -1) ? false : true;
    }

    /**
    * Add a new marker to the storage.
    *
    * Throws an error if a marker with the given url already exists.
    * Fires markerAdded on success.
    * 
    * @param {object} settings - Properties of the new marker.
    * @param {Function} [callback] - fn(err, added marker).
    */
    function add(settings, callback) {

        chrome.storage.local.get(null, function(items) {

            if (urlExists(settings.url, items.markers)) {
                var msg = 'A marker with this URL already exists.';
                callback(new DatabaseError(msg), null);
            }
            else {

                var marker = new Marker(++items.lastId, settings);    
                items.markers.push(marker);
                updated = {markers: items.markers, lastId: items.lastId};

                chrome.storage.local.set(updated, function() {

                    if (callback) { 
                        callback(null, marker);
                    }
                    markerAdded.dispatch(marker);
                });
            }
        });
    }

    /**
    * Remove a marker from storage.
    *
    * Fires markerRemoved on success.
    * 
    * @param {Number} id - Id of the marker to remove.
    * @param {Function} [callback] - fn(err, removed marker).   
    */
    function remove(id, callback) {
        
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
    function removeByUrl(url, callback) {
        
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
        get: get,
        add: add,
        remove: remove,
        removeByUrl: removeByUrl,
        initStorage: initStorage,
        markerAdded: markerAdded,
        markerRemoved: markerRemoved
    };
    
}());

document.addEventListener('DOMContentLoaded', function() {
    markerdb.initStorage();
});










