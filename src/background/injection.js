
/**
 * Provides a communication channel of the extension background
 * to communicate with the content scripts.
 */
'use strict';

var { InjectionError } = require('../common/errors.js');

/* urls the extension will/should not work on */
var blockedUrls = [
	/^chrome:\/\//
];

/* content scripts to inject in web page in given order */
var contentScripts = [
	'content/content.js',
	'content/content.css'
];

class Injection {

	constructor({ prome }) {
		this._prome = prome;
	}

	/**
	 * Finds out if the content scripts already injected in the current web page.
	 * If not injects them.
	 *
	 * return: (Number) - id of the tab to connect to.
	 */
	async connectWebPage() {

		var tabs = await this._prome.tabs.query({
			active: true, 
			currentWindow: true
		});
		
		var tabId = tabs[0].id;

		if (!tabs[0].url || this._isBlockedUrl(tabs[0].url)) {
			var msg = 'Scripts can not be injected to this tab.';
			throw new InjectionError(msg);
		}
		
		var message = {command: 'isAlive'};
		var isAlive = await this._prome.tabs.sendMessage(tabId, message);
		
		if (isAlive) {
			return tabId;
		} else {
			await this._executeScripts(tabId);
			return tabId;
		}
	}

	/**
	 * Checks if an url is blocked by the system.
	 */
	_isBlockedUrl(url) {
		for (var re of blockedUrls) {
			if (url.match(re)) {
				return true;
			}
		}
	}

	/**
	 * Inject a list of content scripts in the current web page.
	 *
	 * param: tabId (Number) - id of current tab
	*/
	async _executeScripts(tabId) {
		for (var script of contentScripts) {
			if (script.endsWith('.js')) {
				await this._prome.tabs.executeScript(tabId, {file: script});
			} else if (script.endsWith('.css')) {
				await this._prome.tabs.insertCSS(tabId, {file: script});
			}
		}	
	}
}

module.exports = { Injection };