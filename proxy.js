/**
* @module proxy
*/
var proxy = (function(){

	'use strict';

	/* content scripts to inject in web page in given order */
	const scripts = [
		'faces.css',
		'tokenize.js',
		'extract.js',
		'highlight.js',
		'counterproxy.js'
	];

    /* urls the extension will/should not work on */
    const blockedUrls = [
        /^chrome:\/\// // not possible to inject content scripts here
    ];

	/**
	* Invokes a function that lives in a script of the web page context.
	*
	* Precondition: Content script are already injected in web page.
	*		This can be done by connectWebPage().
	*
	* First param {Number} is the tab id.
	* Second param {String} is the name of the function to invoke.
	* (Must be given with full module path, as in "module.fn".)
	* Last param {Function} is a callback: ({Any} err, {Any} data)
	* All other params {jsonisable} will be passed to the target function.
	*/
	function invoke() {

		var args = Array.prototype.slice.call(arguments);
		var tabId = args.shift()
		var path = args.shift();
		var callback = args.pop();
		var message = { command: 'invoke', path: path, args: args };

		chrome.tabs.sendMessage(tabId, message, null, function(resp) {
			if (resp) {
				if (resp.err) {
					if (callback) {
						callback(resp.err, null);
					} else {
						throw resp.err;
					}
				} else {
					if (callback) {
						callback(null, resp.data);
					}
				}
			} else {
				// see: https://developer.chrome.com/extensions/tabs#method-sendMessage
				if (chrome.runtime.lastError) {
					throw chrome.runtime.lastError.message;
				} else {
					throw new Error('some error with sendMessage()');
				}
			}
		});
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
	* Finds out if the content scripts already injected in the current web page.
	* If not injects them.
	*
	* @param {Function} callback
	*	  @prop {Number} tabId - id of current tab, null if blocked url
	*/
	function connectWebPage(callback) {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

            if (isBlockedUrl(tabs[0].url)) {
                callback(null);
            }
            else {
			    var tabId = tabs[0].id;
			    var message = {command: 'isAlive'};
			    chrome.tabs.sendMessage(tabId, message, function (response) {
				    if (response) {
					    callback(tabId);
                    }
				    else {
					    executeScripts(tabId, function() {
						    callback(tabId);
					    });
                    }
			    });
            }
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
		invoke: invoke,
		connectWebPage: connectWebPage
	};

}());
