/** 
* @module proxy
*/
var proxy = (function(){

	/* content scripts to inject in web page in given order */
	const scripts = [
		'vink.css',
		'statuslog.js',
		'tokenize.js', 
		'extract.js',
		'highlight.js', 
		'counterproxy.js'
	];

	/**
	* Invokes a function that lives in a script of the web page context.
	*
	* First param {String} is the name of the function to invoke. 
	* Must be given with full module path, as in "module.fn".
	* Last param {Function} is a callback: ({Any} err, {Any} data)
	* All other params {jsonisable} will be passed to the target function. 
	*/ 
	function invoke() {

		var args = Array.prototype.slice.call(arguments);
		var path = args.shift();
		var callback = args.pop();

		connectWebPage(function(tabId) {
			var message = { path: path, args: args };
			chrome.tabs.sendMessage(tabId, message, function(resp) {
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
					// probably means that there was an error in sendMessage:
					// see: https://developer.chrome.com/extensions/tabs#method-sendMessage
				}
			});
		});
	}

	/**
	* Finds out if the content scripts already injected in the current web page.
	* If not injects them.
	*
	* @param {Function} callback
	*	  @prop {Number} tabId - id of current tab
	*/
	function connectWebPage(callback) {

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var tabId = tabs[0].id;
			var message = {command: 'isAlive'};
			chrome.tabs.sendMessage(tabId, message, function (response) {
				if (response)
					callback(tabId);
				else
					executeScripts(tabId, function() {
						callback(tabId);
					});
			});
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
		invoke: invoke
	};

}());
