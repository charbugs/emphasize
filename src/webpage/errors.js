(function(em) {

	'use strict';

	/**
	* An error that will be thrown if something went wrong with the message channel.
	*/
	function ChannelError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	ChannelError.prototype = Object.create(Error.prototype);
	ChannelError.prototype.name = 'ChannelError';

	/**
	* If something went wrong wile extension trying to access the web page scripts.
	*/
	function AccessError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	AccessError.prototype = Object.create(Error.prototype);
	AccessError.prototype.name = 'AccessError';

	em.errors = {
		ChannelError,
		AccessError
	};

})(emphasize);
	