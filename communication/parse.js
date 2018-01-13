/**
 * Functions for parsing and validating the request/response data
 */
(function(emphasize) {

	'use strict';

	// shortcuts
	var protocol = emphasize.communication.protocol;
	var ProtocolError = emphasize.common.errors.ProtocolError;

	// validator functions
	var setupRequestValidator = Ajv({allErrors: true})
			.compile(protocol.setupRequestSchema);

	var	setupResponseValidator = Ajv({allErrors: true})
			.compile(protocol.setupResponseSchema);

	var markupRequestValidator = Ajv({allErrors: true})
			.compile(protocol.markupRequestSchema);

	var markupResponseValidator = Ajv({allErrors: true})
			.compile(protocol.markupResponseSchema);

	/**
	 * Helper function for json schema validation via Ajv library.
	 * Validates data and in case of failure throws an error with
	 * with the first validator error message.
	 *
	 * param: (Function) validator - must be a Ajv validator function.
	 * param: (Any) data
	 */
	function validate(validator, data) {
		if(!validator(data)) {
			var first = validator.errors[0];
			var msg = "Data" + first.dataPath + " " + first.message;
			throw new Error(msg);
		}
	}

	/**
	 * Check wether the data of a setup request is valid.
	 *
	 * param: (Object) data - setup request data
	 */
	function parseSetupRequest(data) {
		try {
			validate(setupRequestValidator, data);
		} catch (err) {
			throw new ProtocolError(err.message);
		}
	}

	/**
	 * Check wether the response data of a setup request is valid
	 * and do some transformations on it.
	 *
	 * param: (String) data - setup response data
	 * return: (Object) - parsed setup data
	 */
	function parseSetupResponse(data) {
		
		/**
		 * Throws an error if the setup has defined a select input
		 * but does not specify the options of the selection. Have no idea how
		 * to do this test with json schema, so this function will take care of it.
		 *
		 * param: (Object) setup - setup response data
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
			var setup = JSON.parse(data);
			validate(setupResponseValidator, setup);
			checkForSelectValues(setup);
		} 
		catch(error) {
			throw new ProtocolError(error.message);
		}

		setup.description = sanitizeHtml(
			setup.description, protocol.htmlRules);

		return setup;
	}

	/**
	 * Check wether the data of a markup request is valid.
	 *
	 * param: (Object) data - markup request data
	 */
	function parseMarkupRequest(data) {
	 
		try {
			validate(markupRequestValidator, data);
		} catch (err) {
			throw new ProtocolError(err.message);
		}
	}

	/**
	 * Check wehter the response data of a markup request is valid
	 * and do some transformations on it.
	 *
	 * param: (String) response - markup response data
	 * return: (Object) - parsed markup response.
	 */
	function parseMarkupResponse(response) {
		
		try {
			response = JSON.parse(response);
			validate(markupResponseValidator, response);
		} 
		catch(error) {
			throw new ProtocolError(error.message);
		}

		if (response.error) {
			response.error = sanitizeHtml(response.error, protocol.htmlRules);
		}

		if (response.report) {
			response.report = sanitizeHtml(response.report, protocol.htmlRules);
		}

		return response;
	}

	// exports
	emphasize.communication.parse = {
		parseSetupRequest,
		parseSetupResponse,
		parseMarkupRequest,
		parseMarkupResponse
	};

})(emphasize);