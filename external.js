
var external = (function() {
    
    function handleMessage(message, sender, callback) {

        if (message.command === 'getMarkers') {
            getMarkers(callback);
        }

        if (message.command === 'addMarker') {
            addMarker(message.url, callback);
        }

        if (message.command === 'removeMarker') {
            removeMarker(message.url, callback);
        }

        // Return true here is important, see:
        // https://developer.chrome.com/extensions/runtime#event-onMessageExternal
        return true;
    }

    function handleConnect(port) {
        
        if (port.name === 'onMarkerAdded') {
            registerPortToEvent(port, markerdb.markerAdded);            
        }

        if (port.name === 'onMarkerRemoved') {
            registerPortToEvent(port, markerdb.markerRemoved);            
        }
    }

    function registerPortToEvent(port, event) {
        function deliverer(data) {
            port.postMessage(data);
        };
        event.register(deliverer);
        port.onDisconnect.addListener(function() {
            event.remove(deliverer);
        });
    }

    function getMarkers(callback) {
        markerdb.get(null, function(markers) {
            callback(markers);    
        });
    }

    function addMarker(url, callback) {
        markerdb.register('', url, function(err, marker) {
            callback({err: err, marker: marker})
        });
    }
    
    function removeMarker(url, callback) {
        markerdb.removeByUrl(url, function(err, marker) {
            callback({ err: err, marker: marker });
        });
    }    
    
    function init() {
        chrome.runtime.onMessageExternal.addListener(handleMessage);
        chrome.runtime.onConnectExternal.addListener(handleConnect);
    }

    return {

        init: init
    };

})();


document.addEventListener('DOMContentLoaded', function() {

    external.init();
});
