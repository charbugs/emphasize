
/**
 * Provides a communication channel of the extension background
 * to communicate with the content scripts.
 */
(function(pool) {

	'use strict';

	/* urls the extension will/should not work on */
	var blockedUrls = [
		/^chrome:\/\//
	];

	/* content scripts to inject in web page in given order */
	var contentScripts = [
		'src/common/style.css',
		'src/common/Namespace.js',
		'src/common/Errors.js',
		'src/common/Sequencer.js',

		'src/webpage/Token.js',
		'src/webpage/Tokenizer.js',
		'src/webpage/WebScraper.js',
		'src/webpage/MarkupCompiler.js',
		'src/webpage/Annotator.js',
		'src/webpage/PageMarker.js',
		'src/webpage/Access.js',
		'src/webpage/Messaging.js',
		'src/webpage/Init.js'
	];

	class Injection {

		constructor(props = {}) {
			this._prome = props.prome;
			this._createInjectionError = props.createInjectionError;
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
				throw this._createInjectionError(msg);
			}
			
			var message = {command: 'isAlive'};
			var isAlive = await this._prome.tabs.sendMessage(tabId, message);
			
			if (isAlive) {
				return tabId;
			} else {
				await this._executeScripts(tabId);
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

	pool.Injection = Injection;

})(emphasize.pool);