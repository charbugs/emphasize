/**
 * Rpresents the registration of analyzers.
 */
var Registration = class {

	/**
	 * param: (Number) id - an instance id needed for requests.
	 */
	constructor(id) {
		this.id = id;
		this.report = "Analyzer successfully added."
		this.reset();
	}

	reset() {
		this.state = Registration.READY;
		this.error = null;
		// bound to an html input element
		this.inputUrl = null;
	}

	/**
	 * Registers an analyzer to the system.
	 */
	async registerAnalyzer() {

		this.state = Registration.WORKING;

		try {
			if (!this.inputUrl || !Database.checkUrl(this.inputUrl)) {
				throw new DatabaseError('Need a valid HTTP URL');
			}
			var remoteSetup = await Request.requestSetup(this.id, this.inputUrl);
			await Database.addSetupFromRemote(this.inputUrl, remoteSetup);
			this.state = Registration.DONE;
		}
		catch (err) {
			if (err instanceof RequestError ||
				err instanceof ProtocolError ||
				err instanceof DatabaseError) {

				this.error = err;
				this.state = Registration.ERROR;
			} else {
				throw err;
			}
		}
	}

	/**
	 * Aborts a pending registration process.
	 *
	 * Will cause the waiting registerAnalyze() method to proceed.
	 */ 
	abortRegistration() {
		Request.abortRequest(this.id);
	}
}

Registration.READY = 0;
Registration.WORKING = 1;
Registration.DONE = 2;
Registration.ERROR = 3;
