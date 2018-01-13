/**
 * Module defines custom error classes.
 */
(function(emphasize) {

	'use strict';

	/**
	 * An Error that will be thrown if something went wrong while
	 * requesting the remote marker programm.
	 */
	function RequestError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	RequestError.prototype = Object.create(Error.prototype);
	RequestError.prototype.name = 'RequestError';

	/**
	  * An Error that will be thrown if the response data of an marker
	  * does not match the protocol.
	  */
	function ProtocolError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	ProtocolError.prototype = Object.create(Error.prototype);
	ProtocolError.prototype.name = 'ProtocolError';

	/**
	 * An Error that will be thrown if an remote marker programm answers 
	 * with an error message.
	 */
	function MarkerError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	MarkerError.prototype = Object.create(Error.prototype);
	MarkerError.prototype.name = 'MarkerError';

	/**
	 * An Error that will be thrown if something went wrong while
	 * storing items.
	 */
	function StorageError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	StorageError.prototype = Object.create(Error.prototype);
	StorageError.prototype.name = 'StorageError';

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
	 * A proxy error that substitutes errors that causes on the content side.
	 * Nescessary since the content scripts can not send error objects to the 
	 * background (but they can of course send an error string).
	 */
	function ContentError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	ContentError.prototype = Object.create(Error.prototype);
	ContentError.prototype.name = 'ContentError';

	/**
	 * An error that will be thrown if content scripts can not be injected in
	 * the current website.
	 */
	function InjectionError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	InjectionError.prototype = Object.create(Error.prototype);
	InjectionError.prototype.name = 'InjectionError';	

	// exports 
	emphasize.common.errors = {
		RequestError,
		ProtocolError,
		MarkerError,
		StorageError,
		ChannelError,
		ContentError,
		InjectionError
	};

})(emphasize);

