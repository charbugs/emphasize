/**
* @module counterproxy
*/
var counterproxy = (function() {

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
	function invoke(path, args, callback) {

		var object;
		var target = window;

		for (var name of path.split('.')) {
			if (target) {
				object = target;
				target = object[name];
			}
		}

		if (target instanceof Function) {
			args.push(callBackProxy.bind(this, callback));
			target.apply(object, args);
		}
		else {
			var msg = 'Error in counterproxy: '+path+' is not a function.';
			if (callback)
				callback({ err: msg, data: null });
			else
				throw new Error(msg);
		}
	}

	/**
	* Serves as a generic callback function.
	* Checks return values and send them back to the proxy.
	*
	* @param {Function} callback - ({Object} resp)
	* @param {jsonisable} err
	* @param {jsonisable} data
	*/
	function callBackProxy(callback, err, data) {
		if (err) {
			if (callback) {
				callback({ err: err, data: null });
			} else {
				throw err;
			}
		} else {
			if (callback) {
				callback({ err: null, data: data });
			}
		}
	}

	/** interfaces of module */
	return {
		createMessageChannel: createMessageChannel
	};

}());

counterproxy.createMessageChannel();