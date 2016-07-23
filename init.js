
var init = (function () {

    /**
    * If the storage is empty set some default markers.
    */
    function setDefaultMarkers() {
        
        chrome.storage.local.get(null, function(items) {
            
            if (Object.keys(items).length == 0) {

                var markers = [
                    {
                        id: 1, 
                        title: 'Keywords', 
                        url: 'http://myawswomemarkers.com/keywords', 
                        custom: ''
                    },

                    {
                        id: 2, 
                        title: 'Locations', 
                        url: 'http://myawesomemarkers.com/locations', 
                        custom: ''
                    }
                ];

                chrome.storage.local.set({markers: markers});
                chrome.storage.local.set({lastId: markers.length});
            }
        });
    }

    return {
        setDefaultMarkers: setDefaultMarkers
    };

}());

init.setDefaultMarkers();
