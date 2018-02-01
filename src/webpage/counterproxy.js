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
		var target = em;

		for (var name of path.split('.')) {
			if (target) {
				object = target;
				target = object[name];
			}
		}

		if (!(target instanceof Function)) {
			var msg = path + ' is not a function.';
			var err = new em.errors.ChannelError(msg);
			err = makeErrorJsonable(err);
			if (callback) {
				callback({ err: err, data: null });
				return;
			} else {
				throw err;
			}
		}

		try {
			var data = await target.apply(object, args);
			if (callback) {
				callback({ err: null, data: data });
			}
		} catch (err) {
			if (callback) {
				if (err.stack)  { // an proper error object
					err = makeErrorJsonable(err);
				}
				callback({ err: err, data: null });
			} else {
				throw err;
			}
		}
	}

	function makeErrorJsonable(error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack
		};
	}

	///////////////////////////////////////////////////////
	// kind of main() of the webpage package
	///////////////////////////////////////////////////////
	createMessageChannel();

}(emphasize));


