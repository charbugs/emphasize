
var markerdb = (function() {

    /**
    * Respresents a Marker
    *
    * So far there is no need to instantiate this type, since it can and will
    * be created with simple object notation. It rather serves as a reference
    * of what a full-fledged marker is made of. Markers in the storage are of 
    * this type.    
    * 
    * @param {Number} id - id of the marker
    * @param {String} title - title of the marker
    * @param {String} url - url of the marker programm
    * @param {JSON String} custom - customizing string
    */
    function Marker(id, title, url, custom) {
        
        this.id = id;
        this.title = title;
        this.url = url;
    }

    /**
    * Return one or all marker(s) from storage.
    * 
    * @param {Number | null} id - id of the marker to return (null if all)
    * @param {Function} - callback
    *    @param {Marker | Array of Marker} marker - requested marker(s)
    */
    function get(id, callback) {
    
        chrome.storage.local.get('markers', function(items) {

            if (id === null) {
   
                callback(items.markers);
            }
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
    *    @prob {String} title - title of marker
    *    @prob {String} url - url of marker programm
    *    @prob {String} custom - custom json string
    */
    function add(infos) {

        chrome.storage.local.get('lastId', function(items) {

            var curId = ++items.lastId;

            var marker = {
                id: curId,
                title: infos.title,
                url: infos.url,
                custom: infos.custom
            };

            chrome.storage.local.get('markers', function(items) {

                items.markers.push(marker);
                chrome.storage.local.set({markers: items.markers});
                chrome.storage.local.set({lastId: curId});
            });
        });
    }


    /** 
    * Change the infos of a marker.
    * 
    * @param {Number} id - the id of the marker to change
    * @param {object} infos - infos about new marker:  
    *    @prob {String} title - title of marker
    *    @prob {String} url - url of marker programm
    *    @prob {String} custom - custom json string
    */
    function edit(id, infos) {

        var marker = {
            id: id,
            title: infos.title,
            url: infos.url,
            custom: infos.custom
        };

        chrome.storage.local.get('markers', function(items) {

            for (key in items.markers) {
            
                if (items.markers[key].id === id) {
            
                    items.markers[key] = marker;
                    chrome.storage.local.set({markers: items.markers});                    
                }
            }
        });
    }

    /**
    * Remove a marker from storage.
    * 
    * @param {Number} id - the id of the marker to remove    
    */
    function remove(id) {
        
        chrome.storage.local.get('markers', function(items) {

            for (key in items.markers) {
        
                if (items.markers[key].id === id) {
            
                    items.markers.splice(key, 1);
                    chrome.storage.local.set({markers: items.markers});
                }
            }
        });
    }

    /**
    * If the storage is empty set some default markers.
    */
    function setDefaultMarkers() {
        
        chrome.storage.local.get(null, function(items) {
            
            if (Object.keys(items).length == 0) {

                var markers = [
                    {
                        id: 1, 
                        title: 'Upper Case', 
                        url: 'http://mauser.pythonanywhere.com/upper-case/', 
                    },

                    {
                        id: 2, 
                        title: 'Proper Names', 
                        url: 'http://mauser.pythonanywhere.com/proper-names/', 
                    }
                ];

                chrome.storage.local.set({markers: markers});
                chrome.storage.local.set({lastId: markers.length});
            }
        });
    }

    return {
        get: get,
        add: add,
        edit: edit,
        remove: remove,
        setDefaultMarkers: setDefaultMarkers
    };
    
}());

markerdb.setDefaultMarkers();















