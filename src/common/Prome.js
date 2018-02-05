/**
 * Wraps chrome api methods to return promises.
 */
(function(pool) {

	'use strict';

	function Prome(chrome) {

		var self = {};

		self.tabs = {};

		self.tabs.sendMessage = function (tabId, message, options) {
			return new Promise(function(resolve, reject) {
				chrome.tabs.sendMessage(tabId, message, options, 
					function(response) {
						resolve(response);
					}
				);
			});
		};

		self.tabs.query = function(queryInfo) {
			return new Promise(function(resolve, reject) {
				chrome.tabs.query(queryInfo, function(tabs) {
					resolve(tabs);
				});
			});
		};
	
		self.storage = {};
		self.storage.local = {};

		self.storage.local.get = function(key) {
			return new Promise(function(resolve, reject) {
				chrome.storage.local.get(key, function(items) {
					resolve(items);
				});
			});
		};

		self.storage.local.set = function(items) {
			return new Promise(function(resolve, reject) {
				chrome.storage.local.set(items, function() {
					resolve();
				});
			});
		};

		return self;
	}

	pool.Prome = Prome;


})(emphasize.pool);

