
/**
 * Provides a communication channel of the extension background
 * to communicate with the content scripts.
 */
(function(em) {

	'use strict';

	/* content scripts to inject in web page in given order */
	var contentScripts = [
		'src/common/style.css',
		'src/common/namespace.js',
		'src/common/errors.js',
		'src/common/Sequencer.js',

		'src/webpage/Tokenizer.js',
		'src/webpage/WebScraper.js',
		'src/webpage/MarkupCompiler.js',
		'src/webpage/Annotator.js',
		'src/webpage/Marker.js',
		'src/webpage/Access.js',
		'src/webpage/Messaging.js',
		'src/webpage/init.js'
	];

	/* urls the extension will/should not work on */
	var blockedUrls = [
		/^chrome:\/\//
	];

	/**
	 * Finds out if the content scripts already injected in the current web page.
	 * If not injects them.
	 *
	 * return: (Number) - id of the tab to connect to.
	 */
	async function connectWebPage() {

		var tabs = await em.prome.tabs.query({active: true, currentWindow: true});
		var tabId = tabs[0].id;

		if (!tabs[0].url || isBlockedUrl(tabs[0].url)) {
			var msg = 'Scripts can not be injected to this tab.';
			throw new em.errors.InjectionError(msg);
		}
		
		var message = {command: 'isAlive'};
		var isAlive = await em.prome.tabs.sendMessage(tabId, message);
		
		if (isAlive) {
			return tabId;
		}
		else {
			return new Promise(function(resolve) {
				executeScripts(tabId, () => resolve(tabId));
			});
		}
	}

	/**
	 * Checks if an url is blocked by the system.
	 */
	function isBlockedUrl(url) {
		for (var re of blockedUrls) {
			if (url.match(re)) {
				return true;
			}
		}
	}

	/**
	 * Inject a list of content scripts in the current web page.
	 *
	 * With slight changes taken from:
	 * http://stackoverflow.com/questions/21535234
	 *
	 * param: tabId (Number) - id of current tab
	 * param: callback (Function)
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

		for (var i = contentScripts.length - 1; i >= 0; --i) {
			callback = createCallback(
				tabId, 
				contentScripts[i], 
				callback
			);
		}

		if (callback !== null)
			callback();   // execute outermost function
	}

	// exports 
	em.injection = {
		connectWebPage
	}

})(emphasize);