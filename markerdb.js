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
    * @param {Function} - callback
    *     @param {Marker | Array of Marker} - requested marker(s)
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

    /**
    * Add a new marker to the storage.
    * 
    * @param {object} settings - properties of the new marker.
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

                        if (callback) { 
                            callback(marker);
                        }
                        markerAdded.dispatch(marker);
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
            for (var i=0; i < markers.length; i++) {

                if (markers[i].id === id) {

                    marker = markers.splice(i, 1);
                    chrome.storage.local.set({markers: markers}, function() {

                        if (callback) { 
                            callback(marker);
                        }
                        markerRemoved.dispatch(marker);
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
        markerAdded: markerAdded,
        markerRemoved: markerRemoved
    };
    
}());

document.addEventListener('DOMContentLoaded', function() {
    markerdb.initStorage();
});










