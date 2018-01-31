/**
* @module counterproxy
*/
(function(em) {

	'use strict';

	/**
	* Create a passiv message channel for communication
	* with the proxi of the extension context.
	*/
	function createMessageChannel() {
		chrome.runtime.onMessage.addListener(handleMessage);
	}

	function handleMessage(message, sender, callback) {

		if (message.command === 'isAlive')
			callback(true);
		else if (message.command === 'invoke')
			invoke(message.path, message.args, callback);

		// "This function [the callback] becomes invalid when the event 
		// listener returns, unless you return true from the event listener
		// to indicate you wish to send a response asynchronously (this will
		// keep the message channel open to the other end until sendResponse
		// [the callback] is called)".
		// See: https://developer.chrome.com/extensions/runtime#event-onMessage
		return true;
	}

	/**
	* Invokes a function.
	* Is used by the proxy of the extension context to gain access to
	* the scripts of the web page context.
	*
	* @param {String} path - path to function, i.e. 'module.fn'
	* @param {Array} args - arguments to pass to function
	* @param {Function} callback - ({Object} resp)
	*/
	async function invoke(path, args, callback) {

		var object;
		var target = window;

		for (var name of path.split('.')) {
			if (target) {
				object = target;
				target = object[name];
			}
		}

		if (!(target instanceof Function)) {
			var msg = 'Error in counterproxy: ' + path + ' is not a function.';
			if (callback) {
				callback({ err: msg, data: null });
				return;
			} else {
				throw new Error(msg);
			}
		}

		try {
			var data = await target.apply(object, args);
			if (callback) {
				callback({ err: null, data: data });
			}
		} catch (err) {
			if (callback) {
				var msg = err.message || err;
				callback({ err: msg, data: null });
			} else {
				throw err;
			}
		}
	}

	///////////////////////////////////////////////////////
	// kind of main() of the webpage package
	///////////////////////////////////////////////////////
	createMessageChannel();

}(emphasize));


