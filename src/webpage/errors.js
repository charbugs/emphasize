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

	em.errors = {
		ChannelError
	};

})(emphasize);
	