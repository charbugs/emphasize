
var counterproxy = (function() {

	/**
	* Create a passiv message channel for communication
	* with the proxi of the extension context.
	*/
	function createMessageChannel() {
		chrome.runtime.onMessage.addListener(handleMessage);
	}

	function handleMessage(message, sender, callback) {
		
		if (message.command && message.command === 'isAlive') {
			callback(true);
		} else {
			invoke(message, sender, callback);
		}
	}

	function invoke(message, sender, callback) {

		var object;
		var target = window;
		
		for (var name of message.call.split('.')) {
			if (target) {
				object = target;
				target = target[name];
			}
		}

		if (target instanceof Function) {
			message.args.push(callBackProxy.bind(this, callback));
			target.apply(object, message.args);
		}
		else {
			callback({ err: 'Error in counterproxy: '+message.call+' is not a function.', data: null });
		}
	}

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

	return {
		createMessageChannel: createMessageChannel
	};

}());

counterproxy.createMessageChannel();
