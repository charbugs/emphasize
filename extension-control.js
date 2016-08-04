
var extensionControl = (function() {

	/* content scripts to inject in given order*/
	const scripts = [

		'vink.css',
		'jquery.js', 
		'tokenize.js', 
		'extract.js',
		'highlight.js', 
		'content-control.js'
	]

	function removeHighlighting() {

		connectWebPage(function(tab) {
			var message = {command: 'removeHighlighting'};
			chrome.tabs.sendMessage(tab, message);
		});
	}

	function applyMarker(markerId) {

		connectWebPage(function(tab) {
			
			var message = {command: 'getTokens'};
			chrome.tabs.sendMessage(tab, message, function (tokens) {
				markerdb.get(markerId, function(marker) {
					request.callMarkerApp(marker, tokens, function(mask) {
						var message = {command: 'highlight', mask: mask};
						chrome.tabs.sendMessage(tab, message);
					});
				});
			});
		});					
	}

	function connectWebPage(callback) {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			
			var tab = tabs[0].id;
			var message = {command: 'isAlive'};
			
			chrome.tabs.sendMessage(tab, message, function (respond) {
				
				if (respond)
					callback(tab);
				else
					executeScripts(tab, function() {
						callback(tab);
					});
			});
		});
	}

	function executeScripts(tab, callback) {

    	function createCallback(tabId, script, callback) {
    		if (script.endsWith('.js'))
        		return function () {
        			chrome.tabs.executeScript(tabId, {file: script}, callback);
        		};
        	else if(script.endsWith('.css'))
        		return function () {
        			chrome.tabs.insertCSS(tabId, {file: script}, callback);
        		};
        }

		for (var i = scripts.length - 1; i >= 0; --i)
        	callback = createCallback(tab, scripts[i], callback);

    	if (callback !== null)
        	callback();   // execute outermost function
	}

	return {
		applyMarker: applyMarker,
		removeHighlighting: removeHighlighting
	};

}());
