
(function(pool) {

	class Messaging {

		constructor(props = {}) {
			this._prome = props.prome;
			this._createChannelError = props.createChannelError;
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
		async invoke() {

			var args = Array.prototype.slice.call(arguments);
			var tabId = args.shift()
			var path = args.shift();
			var message = { command: 'invoke', path: path, args: args };

			var resp = await this._prome.tabs.sendMessage(tabId, message, null);

			if (resp) {
				if (resp.err)
					throw resp.err;
				else
					return resp.data; 
			} else {
				// see: https://developer.chrome.com/extensions/tabs#method-sendMessage
				if (chrome.runtime.lastError)
					throw this._createChannelError(chrome.runtime.lastError.message);
			}
		}
	}

	pool.Messaging = Messaging;

})(emphasize.pool);