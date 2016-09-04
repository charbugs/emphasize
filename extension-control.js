/** @module extensionControl */
var extensionControl = (function() {

	/* content scripts to inject in web page in given order*/
	const scripts = [
		'vink.css',
		'tokenize.js', 
		'extract.js',
		'highlight.js', 
		'content-control.js'
	];

	/**
	* Init the system on startup. This is every time the browser loads the extension.
	*
	*/
	function initExtension() {

		markerdb.initStorage();	
	}

	/**
	* Remove highlighting made by vink.
	*/
	function removeHighlighting() {

		connectWebPage(function(tabId) {
			var message = {command: 'removeHighlighting'};
			chrome.tabs.sendMessage(tabId, message);
		});
	}

	/**
	* Applys a marker to the current web page.
	*
	* @param {Number} markerId - ID of the marker stored in marker database.
	*/
	function applyMarker(markerId) {

		connectWebPage(function(tabId) {
			var message = {command: 'getPageWords'};
			chrome.tabs.sendMessage(tabId, message, function (pageTokens) {
				markerdb.get(markerId, function(marker) {
					request.callMarkerApp(marker, pageTokens, function(markerResponse) {
						var message = {command: 'highlight', mask: markerResponse.mask};
						chrome.tabs.sendMessage(tabId, message);
					});
				});
			});
		});					
	}

	/**
	* Finds out if the content scripts already injected in the current web page.
	* If not injects them.
	*
	* @param {Function} callback
	*	  @prop {Number} tabId - id of current tab
	*/
	function connectWebPage(callback) {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var tabId = tabs[0].id;
			var message = {command: 'isAlive'};
			chrome.tabs.sendMessage(tabId, message, function (response) {
				if (response)
					callback(tabId);
				else
					executeScripts(tabId, function() {
						callback(tabId);
					});
			});
		});
	}

	/**
	* Inject a list of content scripts in the current web page.
	*
	* With slightly changes taken from:
	* http://stackoverflow.com/questions/21535234
	*
	* @param {Number} tabId - id of current tab
	* @param {Function} callback
	*/
	function executeScripts(tabId, callback) {

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
        	callback = createCallback(tabId, scripts[i], callback);

    	if (callback !== null)
        	callback();   // execute outermost function
	}

	/** interfaces of module */
	return {
		initExtension: initExtension,
		applyMarker: applyMarker,
		removeHighlighting: removeHighlighting
	};

}());

extensionControl.initExtension();