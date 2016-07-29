
var extensionControl = (function() {

	/* content scripts to inject in given order*/
	const scripts = [

		'jquery.js', 
		'tokenize.js', 
		'extract.js',
		'request.js', 
		'highlight.js', 
		'content-control.js'
	]

	function applyMarker(markerId) {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

			var tab = tabs[0].id;
			var message = {command: 'isAlive'};

			chrome.tabs.sendMessage(tab, message, function (respond) {

				if (respond)
					passMarkerToContentControl(tab, markerId);

				else
					executeScripts(tab, function() {
						passMarkerToContentControl(tab, markerId);	
					});
			});
		});
	}

	function passMarkerToContentControl(tab, markerId) {

		markerdb.get(markerId, function (marker) {
			
			var message = {command: 'apply', marker: marker};
			chrome.tabs.sendMessage(tab, message);
		});
		
	}

	function executeScripts(tab, callback) {

    	function createCallback(tabId, script, callback) {
        	return function () {
            	chrome.tabs.executeScript(tabId, {file: script}, callback);
        	};
        }

    	for (var i = scripts.length - 1; i >= 0; --i)
        	callback = createCallback(tab, scripts[i], callback);

    	if (callback !== null)
        	callback();   // execute outermost function
	}

	return {
		applyMarker: applyMarker
	};

}());
