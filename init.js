
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
                        title: 'Upper Case', 
                        url: 'http://mauser.pythonanywhere.com/upper-case/', 
                        custom: ''
                    },

                    {
                        id: 2, 
                        title: 'Proper Names', 
                        url: 'http://mauser.pythonanywhere.com/proper-names/', 
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
