
var extensionControl = {

	/* IDs of tabs that already injected with content scripts */
	injectedTabs: [],

	/* ID of active tab */
	activeTab: null,

	/* ID of chosen marker */
	markerId: null,
	
	/* content scripts to inject in given order*/
	scripts: ['jquery.js', 'tokenize.js', 'extract.js', 'highlight.js', 'content-control.js'],

	applyMarker: function(id) {

		var that = this;
		that.markerId = id;

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

			that.activeTab = tabs[0].id;
			var message = {command: 'alive'};

			chrome.tabs.sendMessage(that.activeTab, message, function (respond) {

				if (respond)
					that._passMarkerToContentControl();
				else
					that._executeScripts();
			});
		});
	},

	_passMarkerToContentControl: function() {

		var that = this;

		markerdb.get(that.markerId, function (marker) {
			
			var message = {command: 'apply', data: marker};
			chrome.tabs.sendMessage(that.activeTab, message);
		});
		
	},

	_executeScripts: function() {

		var that = this;

    	function createCallback(tabId, script, callback) {
        	return function () {
            	chrome.tabs.executeScript(tabId, {file: script}, callback);
        	};
        }

    	var callback = that._passMarkerToContentControl.bind(that);

    	for (var i = that.scripts.length - 1; i >= 0; --i)
        	callback = createCallback(that.activeTab, that.scripts[i], callback);

    	if (callback !== null)
        	callback();   // execute outermost function
	}	
};