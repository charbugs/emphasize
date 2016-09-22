/** @module markerdb */
var markerdb = (function() {

    /**
    * Holds informations about a marker.
    * 
    * @param {Number} id - id of the marker
    * @param {String} name - name of the marker
    * @param {String} url - url of the marker programm
    */
    function Marker(id, name, url) {

        this.id = id;
        this.name = name;
        this.url = url;
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

                var infos1 = {
                    name: 'Upper Case',
                    url: 'http://mauser.pythonanywhere.com/upper-case/'
                };
                var infos2 = {
                    name: 'Proper Names',
                    url: 'http://mauser.pythonanywhere.com/proper-names/'
                };
                var infos3 = {
                    name: 'Local Test',
                    url: 'http://localhost/test/'
                };

                add(infos1, function() {
                    add(infos2, function() {
                        add(infos3);
                    });
                });
            }
        });
    }

    /**
    * Throws an error if an object misses one of the given properties.
    *
    * @param {Objekt} obj - object in question
    * @param {Array of String} props - list of properites
    */
    function checkProperties(obj, props) {

        for (var prop of props)
            if(!obj.hasOwnProperty(prop))
                throw new Error('object has no property: ' + prop);
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
    * @param {object} infos - infos about new marker: 
    *    @prob {String} name - name of marker
    *    @prob {String} url - url of marker programm
    * @param {Function} callback
    *    @param {Marker} - added marker
    */
    function add(infos, callback) {

        checkProperties(infos, ['name', 'url']);
        chrome.storage.local.get('lastId', function(items) {

            var curId = ++items.lastId;
            var marker = new Marker(
                curId,
                infos.name,
                infos.url
            );
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
    * Changes the infos of a marker. Ignores non existing marker IDs.
    * 
    * @param {Number} id - the id of the marker to change
    * @param {object} infos - new infos:  
    *    @prob {String} name - name of marker
    *    @prob {String} url - url of marker programm
    * @param {Function} callback
    *    @param {Marker} - changed marker
    */
    function edit(id, infos, callback) {

        chrome.storage.local.get('markers', function(items) {

            var breakIt = false;
            var markers = items.markers;
            for (var key in markers) {
                if (markers[key].id === id) {
                    var changedMarker = new Marker(
                        id,
                        infos.name || markers[key].name,
                        infos.url || markers[key].url
                    );
                    markers[key] = changedMarker;
                    chrome.storage.local.set({markers: markers}, function() {
                        if (callback) 
                            callback(changedMarker);
                        breakIt = true;
                    });                    
                }
                if (breakIt) {
                    break;
                }
            }
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
        edit: edit,
        remove: remove,
        initStorage: initStorage,
    };
    
}());













