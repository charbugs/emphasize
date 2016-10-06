/** @module extensionControl */
var extensionControl = (function() {

	/* content scripts to inject in web page in given order */
	const scripts = [
		'vink.css',
		'statuslog.js',
		'tokenize.js', 
		'extract.js',
		'highlight.js', 
		'content-control.js'
	];

	/**
	* Init the system on startup. This is every time the browser loads the extension.
	*/
	function initExtension() {

		markerdb.initStorage();	
	}

	/**
	* Remove highlighting made by a specific marker.
	* 
	* @param {Number} markerId
	* @param {Function} callback - no params
	*/
	function removeHighlighting(markerId, callback) {

		connectWebPage(function(tabId) {
			var message = {command: 'removeHighlighting', markerId: markerId};
			chrome.tabs.sendMessage(tabId, message, function() {
				if (callback) callback();
			});
		});
	}

	/**
	* Applys a marker to the current web page.
	*
	* @param {markerdb.Query} marker
	* @param {Object} userQueries - keys are query ids, values are user inputs.
	* @param {Function} callback - (err, data)
	*/
	function applyMarker(marker, userQueries, callback) {

		connectWebPage(function(tabId) {
			var message = {command: 'getWebPageFeatures'};
			chrome.tabs.sendMessage(tabId, message, function (features) {
				request.requestMarking(marker, features, userQueries, function(err, response) {
					if (err) {
						if (callback) callback(err);
						else throw err;
					}
					else {
						var message = {command: 'highlight', mask: response.mask, markerId: marker.id};
						chrome.tabs.sendMessage(tabId, message, function() {
							if (callback) callback();
						});
					}
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
	* With slight changes taken from:
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