
var init = {

    /**
    * If the storage is empty set some default markers.
    */
    setDefaultMarkers: function() {
        
        chrome.storage.local.get(null, function(items) {
            
            if (Object.keys(items).length == 0) {

                var markers = [
                    {
                        id: 1, 
                        title: 'Verben', 
                        url: 'http://markers.com/verben', 
                        custom: ''
                    },

                    {
                        id: 2, 
                        title: 'Nomen', 
                        url: 'http://markers.com/nomen', 
                        custom: ''
                    }
                ];

                chrome.storage.local.set({markers: markers});
                chrome.storage.local.set({lastId: markers.length});
            }
        });
    }
};


init.setDefaultMarkers();
