/** @module markerdb */
var markerdb = (function() {

    /**
    * Represents a Marker.
    * 
    * @param {Number} id - unique id
    * @param {Object} settings
    *   @prop {String} url
    *   @prop {String} name
    *   @prop {String} description
    *   @prop {Array of Query} queries - user inputs provided my marker
    *   @prob {String} styleClass - class attribute to style highlightings
    */
    function Marker(id, settings) {

        this.id = id;
        this.url = settings.url;
        this.name = settings.name;
        this.description = settings.description;
        this.queries = settings.queries;
        this.styleClass = settings.styleClass;
    }

    /**
    * Represents a user input that a marker can provide for its purposes.
    * 
    * @param {Object} attributes
    *   @prop {String} id - a marker app can identify the query by this id
    *   @prop {String} label - to show in user interfaces
    *   @prop {String} hint - to show in user interfaces
    */
    function Query(attributes) {

        this.id = attributes.id;
        this.label = attributes.label;
        this.hint = attributes.hint;
    }

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
                    description: 'Highlights all upper case words.'
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
        });
    }

    /**
    * Returns one or all marker(s) from storage.
    * 
    * @param {Number | null} id - id of the marker to return (null if all)
    * @param {Function} - callback
    *     @param {Marker | Array of Marker} - requested marker(s)
    */
    function get(id, callback) {

        chrome.storage.local.get('markers', function(items) {
            if (id === null)
                callback(items.markers);
            else {
                for (key in items.markers) {
                    if (items.markers[key].id === id) {                        
                        callback(items.markers[key]);
                        break;
                    }
                }
            }
        });
    }

    /**
    * Add a new marker to the storage.
    * 
    * @param {object} settings - properties of the new marker:
    * @param {Function} callback
    *    @param {Marker} - added marker
    */
    function add(settings, callback) {

        chrome.storage.local.get('lastId', function(items) {

            var curId = ++items.lastId;
            var marker = new Marker(curId, settings);

            chrome.storage.local.get('markers', function(items) {

                items.markers.push(marker);
                chrome.storage.local.set(
                    {markers: items.markers, lastId: curId}, function() {
                        if (callback) 
                            callback(marker);
                });
            });
        });
    }

    /**
    * Remove a marker from storage.
    * 
    * @param {Number} id - the id of the marker to remove
    * @param {Function} callback - without params   
    */
    function remove(id, callback) {
        
        chrome.storage.local.get('markers', function(items) {

            var breakIt = false;
            var markers = items.markers;
            for (var key in markers) {
                if (markers[key].id === id) {
                    markers.splice(key, 1);
                    chrome.storage.local.set({markers: markers}, function() {
                        if (callback) callback();
                        breakIt = true;
                    });
                }
                if (breakIt) {
                    break;
                }
            }
        });
    }

    return {
        get: get,
        add: add,
        remove: remove,
        initStorage: initStorage,
    };
    
}());

document.addEventListener('DOMContentLoaded', function() {
    markerdb.initStorage();
});










