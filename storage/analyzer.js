'use strict';

/**
 * Represents the local part of an analyzer.
 * It connects to the remote analyzer programm.
 */
var Analyzer = class {
 
	/**
	 * param: (Number) id - an instance id needed for requests and 
	 * 		annotations in the web page
	 * param: (Setup) setup - analyzer setup.
	 */
	constructor(id, setup) {
		this.id = id;
		this.setup = setup;
		this.reset();
	}

	reset() {
		this.state = Analyzer.READY;
		this.output = null;
		this.error = null;
		this.input = {
			tokens: null,
			// is bound to some html input elements.
			userInputs: {},
			webpage: null
		};
	}

	async analyze() {

		this.state = Analyzer.WORKING;
		
		try {
			var output = await Request.requestAnalysis(
				this.id,
				this.setup.url,
				this.input.tokens,
				this.input.userInputs,
				this.input.webpage
			);

			if (output.error) {
				throw new AnalyzerError(output.error);
			} 
			else {
				this.output = output;
				this.state = Analyzer.DONE;
				return output;
			}
		} 
		catch (err) {
			if (err instanceof RequestError || 
				err instanceof ProtocolError ||
				err instanceof AnalyzerError) {

				this.error = err;
				this.state = Analyzer.ERROR;
			} else {
				throw err;
			}
		}
	}

	/**
	 * Aborts a pending analysis request.
	 *
	 * Will cause the waiting analyze() method to proceed.
	 */ 
	abortAnalysis() {
		Request.abortRequest(this.id);
	}
}

Analyzer.READY = 0;
Analyzer.WORKING = 1;
Analyzer.DONE = 2;
Analyzer.ERROR = 3;