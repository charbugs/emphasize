/**
 * Wraps chrome api methods to return promises.
 */

'use strict';

function Prome({ chrome }) {

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

	self.tabs.create = function(createProperties) {
		return new Promise(function(resolve, reject) {
			chrome.tabs.create(createProperties, function(tab) {
				resolve(tab);
			})
		});
	};

	self.tabs.executeScript = function(tabId, details) {
		return new Promise(function(resolve, reject) {
			chrome.tabs.executeScript(tabId, details, function(result) {
				resolve(result);
			})
		});
	};

	self.tabs.insertCSS = function(tabId, details) {
		return new Promise(function(resolve, reject) {
			chrome.tabs.insertCSS(tabId, details, function() {
				resolve();
			})
		});
	};

	self.tabs.onUpdated = chrome.tabs.onUpdated;

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

	self.runtime = {};
	self.runtime.lastError = chrome.runtime.lastError;
	self.runtime.getManifest = chrome.runtime.getManifest;

	return self;
}

exports.Prome = Prome;