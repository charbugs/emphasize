const prome = {

	/*runtime: {

		getBackgroundPage: function() {
			return new Promise(function(resolve, reject) {
				chrome.runtime.getBackgroundPage(function(bg) {
					resolve(bg);
				});
			});
		}
	},*/

	storage : {

		local: {

			get: function(key) {
				return new Promise(function(resolve, reject) {
					chrome.storage.local.get(key, function(items) {
						resolve(items);
					});
				});
			},

			set: function(items) {
				return new Promise(function(resolve, reject) {
					chrome.storage.local.set(items, function() {
						resolve();
					});
				});
			}
		}
	},

	tabs: {

		sendMessage: function(tabId, message, options) {
			return new Promise(function(resolve, reject) {
				chrome.tabs.sendMessage(tabId, message, options, function(response) {
					resolve(response);
				});
			});
		},

		query: function(queryInfo) {
			return new Promise(function(resolve, reject) {
				chrome.tabs.query(queryInfo, function(tabs) {
					resolve(tabs);
				});
			});
		}
	}
};