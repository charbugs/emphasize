
class Parser {

	constructor() {
		throw new Error("This class can not be instantiated.");
	}

	/**
	 * Helper function for json schema validation via Ajv library.
	 * Validates data and in case of failure throws an error with
	 * with the first validator error message.
	 *
	 * param: (Function) validator - must be a Ajv validator function.
	 * param: (Any) data
	 */
	static validate(validator, data) {
		if(!validator(data)) {
			var first = validator.errors[0];
			var msg = "Data" + first.dataPath + " " + first.message;
			throw new Error(msg);
		}
	}

	/**
	 * Check wether the outgoing data of a setup request are valid.
	 *
	 * param: (Object) setupRequest
	 */
	static parseSetupRequest(setupRequest) {
	   
		try {
			Parser.validate(Parser.setupRequestValidator, setupRequest);
		} catch (err) {
			throw new ProtocolError(err.message);
		}
	}

	/**
	 * Check wether the response of a setup request is valid
	 * and do some transformations on it.
	 *
	 * param: (String) response
	 * return: (Object) - parsed setup response
	 */
	static parseSetupResponse(response) {
		
		/**
		 * Throws an error if the setup has defined a select input
		 * but does not specify the options of the selection. Have no idea how
		 * to do this test with json schema, so this function will take care of it.
		 *
		 * param: (Object) setup
		 */
		function checkForSelectValues(setup) {
			if (setup.inputs) {
				for (var input of setup.inputs) {
					if (input.type === 'select' && !input.values) {
						throw new Error('selection declared but no values given');
					}
				}
			}
		}

		try {
			response = JSON.parse(response);
			Parser.validate(Parser.setupResponseValidator, response);
			checkForSelectValues(response);
		} 
		catch(error) {
			throw new ProtocolError(error.message);
		}

		response.description = sanitizeHtml(
			response.description, Protocol.htmlRules);

		return response;
	}

	/**
	 * Check wether the outgoing data of a analysis request are valid.
	 *
	 * param: (Object) analysisRequest
	 */
	static parseAnalysisRequest(analysisRequest) {
	 
		try {
			Parser.validate(Parser.analysisRequestValidator, analysisRequest);
		} catch (err) {
			throw new ProtocolError(err.message);
		}
	}

	/**
	 * Check wehter the response of a analysis request are valid
	 * and do some transformations on it.
	 *
	 * param: (String) response
	 * return: (Object) - parsed analysis response.
	 */
	static parseAnalysisResponse(response) {
		
		try {
			response = JSON.parse(response);
			Parser.validate(Parser.analysisResponseValidator, response);
		} 
		catch(error) {
			throw new ProtocolError(error.message);
		}

		if (response.error) {
			response.error = sanitizeHtml(response.error, Protocol.htmlRules);
		}

		if (response.report) {
			response.report = sanitizeHtml(response.report, Protocol.htmlRules);
		}

		return response;
	}
}

Parser.setupRequestValidator = Ajv({allErrors: true})
	.compile(Protocol.setupRequestSchema);

Parser.setupResponseValidator = Ajv({allErrors: true})
	.compile(Protocol.setupResponseSchema);

Parser.analysisRequestValidator = Ajv({allErrors: true})
	.compile(Protocol.analysisRequestSchema);

Parser.analysisResponseValidator = Ajv({allErrors: true})
	.compile(Protocol.analysisResponseSchema);