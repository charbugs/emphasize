
(function(pool) {

	'use strict';

	class Messaging {

		constructor(props = {}) {
			this._browser = props.browser;
			this._baseObject = props.baseObject;
			this._createChannelError = props.createChannelError;
		}

		/**
		* Create a passiv message channel for communication
		* with the proxi of the extension context.
		*/
		createMessageChannel() {
			this._browser.runtime.onMessage.addListener(
				this._handleMessage.bind(this));
		}

		_handleMessage(message, sender, callback) {
			
			if (message.command === 'isAlive')
				callback(true);
			else if (message.command === 'invoke')
				this._invoke(message.path, message.args, callback);

			// "This function [the callback] becomes invalid when the event 
			// listener returns, unless you return true from the event listener
			// to indicate you wish to send a response asynchronously (this will
			// keep the message channel open to the other end until sendResponse
			// [the callback] is called)".
			// See: https://developer.chrome.com/extensions/\
			//		runtime#event-onMessage
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
		async _invoke(path, args, callback) {
			var object;
			var target = this._baseObject;

			for (var name of path.split('.')) {
				if (target) {
					object = target;
					target = object[name];
				}
			}

			if (!(target instanceof Function)) {
				var msg = path + ' is not a function.';
				var err = this._createChannelError(msg);
				err = this._makeErrorJsonable(err);
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
						err = this._makeErrorJsonable(err);
					}
					callback({ err: err, data: null });
				} else {
					throw err;
				}
			}
		}

		_makeErrorJsonable(error) {
			return {
				name: error.name,
				message: error.message,
				stack: error.stack
			};
		}
	}

	pool.Messaging = Messaging;

}(emphasize.pool));