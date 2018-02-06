/**
 * Module defines custom error classes.
 */
(function(pool) {

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
	 * An error that will be thrown if content scripts can not be injected in
	 * the current website.
	 */
	function InjectionError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	InjectionError.prototype = Object.create(Error.prototype);
	InjectionError.prototype.name = 'InjectionError';	

	/**
	* If something went wrong wile extension trying to access the web
	* page scripts.
	*/
	function AccessError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	AccessError.prototype = Object.create(Error.prototype);
	AccessError.prototype.name = 'AccessError';

	/**
	* If something went wrong wile extension trying to register
	* a new marker to the system.
	*/
	function RegistrationError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	RegistrationError.prototype = Object.create(Error.prototype);
	RegistrationError.prototype.name = 'RegistrationError';

	// exports 
	pool.RequestError = RequestError;
	pool.ProtocolError = ProtocolError;
	pool.MarkerError = MarkerError;
	pool.StorageError = StorageError;
	pool.ChannelError = ChannelError;
	pool.InjectionError = InjectionError;
	pool.AccessError = AccessError;
	pool.RegistrationError = RegistrationError;

})(emphasize.pool);

