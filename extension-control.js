
var extensionControl = {

	/* IDs of tabs that already injected with content scripts */
	injectedTabs: [],
	/* ID of active tab */
	activeTab: null,
	/* ID of chosen marker */
	markerId: null,

	applyMarker: function(id) {

		var that = this;
		that.markerId = id;

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

			that.activeTab = tabs[0].id

			if (that.injectedTabs.indexOf(that.activeTab) === -1) {

				that.injectedTabs.push(that.activeTab);
				
				chrome.tabs.executeScript(
					that.activeTab, 
					{ file:'content-control.js' }, 
					that.passToContentControl.bind(that)
				);	
			}
			else {
				
				that.passToContentControl();
			}
				
		});
	},

	passToContentControl: function() {

		var that = this;

		markerdb.get(that.markerId, function (marker) {
			
			var message = {command: 'apply', data: marker};

			chrome.tabs.sendMessage(that.activeTab, message);
		});
		
	}	
};