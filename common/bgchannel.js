
/**
 * Represents a communication channel of the extension background
 * to communicate with the content scripts.
 */
var BgChannel = class {

	constructor () {
		throw new Error("This class can not be instantiated.");
	}

	/**
	 * Finds out if the content scripts already injected in the current web page.
	 * If not injects them.
	 *
	 * return: (Number) - id of the tab to connect to.
	 */
	static async connectWebPage() {

		var tabs = await prome.tabs.query({active: true, currentWindow: true});
		var tabId = tabs[0].id;

		if (BgChannel.isBlockedUrl(tabs[0].url)) {
			var msg = 'Scripts can not be injected to this tab.';
			throw new InjectionError(msg);
		}
		
		var message = {command: 'isAlive'};
		var isAlive = await prome.tabs.sendMessage(tabId, message);
		
		if (isAlive) {
			return tabId;
		}
		else {
			return new Promise(function(resolve) {
				BgChannel.executeScripts(tabId, () => resolve(tabId));
			});
		}
	}

	/**
	 * Checks if an url is blocked by the system.
	 */
	static isBlockedUrl(url) {
		for (var re of BgChannel.blockedUrls) {
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
	static executeScripts(tabId, callback) {

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

		for (var i = BgChannel.contentScripts.length - 1; i >= 0; --i) {
			callback = createCallback(
				tabId, 
				BgChannel.contentScripts[i], 
				callback
			);
		}

		if (callback !== null)
			callback();   // execute outermost function
	}

	/**
	 * Invokes a function that lives in a script of the web page context.
	 *
	 * Precondition: Content script are already injected in web page.
	 *       This can be done by connectWebPage().
	 *
	 * param1: (Number) - the tab id
	 * param2 (String) - the name of the function to invoke.
	 *   (Must be given with full module path, as in "module.fn".)
	 * All other params: (jsonable) will be passed to the target function.
	 *
	 * return: (jsonable) return value from content script function.
	 */
	static async invoke() {

		var args = Array.prototype.slice.call(arguments);
		var tabId = args.shift()
		var path = args.shift();
		var message = { command: 'invoke', path: path, args: args };

		var resp = await prome.tabs.sendMessage(tabId, message, null);

		if (resp) {
			if (resp.err)
				throw new ContentError(resp.err);
			else
				return resp.data; 
		} else {
			// see: https://developer.chrome.com/extensions/tabs#method-sendMessage
			if (chrome.runtime.lastError)
				throw new ChannelError(chrome.runtime.lastError.message);
		}
	}
}

/* content scripts to inject in web page in given order */
BgChannel.contentScripts = [
	'common/faces.css',
	'webpage/tokenize.js',
	'webpage/extract.js',
	'webpage/highlight.js',
	'webpage/counterproxy.js'
];

/* urls the extension will/should not work on */
BgChannel.blockedUrls = [
	/^chrome:\/\//
];