/**
 * Functions for parsing and validating the request/response data
 */
(function(pool) {

	'use strict';

	class Parser {

		constructor(protocol, ProtocolError, Ajv, sanitizeHtml) {

			this.protocol = protocol;
			this.ProtocolError = ProtocolError;
			this.Ajv = Ajv;
			this.sanitizeHtml = sanitizeHtml;


			// validator functions
			this.setupRequestValidator = Ajv({allErrors: true})
					.compile(this.protocol.setupRequestSchema);

			this.setupResponseValidator = Ajv({allErrors: true})
					.compile(this.protocol.setupResponseSchema);

			this.markupRequestValidator = Ajv({allErrors: true})
					.compile(this.protocol.markupRequestSchema);

			this.markupResponseValidator = Ajv({allErrors: true})
					.compile(this.protocol.markupResponseSchema);		
		}

		/**
		 * Helper function for json schema validation via Ajv library.
		 * Validates data and in case of failure throws an error with
		 * with the first validator error message.
		 *
		 * param: (Function) validator - must be a Ajv validator function.
		 * param: (Any) data
		 */
		_validate(validator, data) {
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
		parseSetupRequest(data) {
			try {
				this._validate(this.setupRequestValidator, data);
			} catch (err) {
				throw this.ProtocolError(err.message);
			}
		}

		/**
		 * Check wether the response data of a setup request is valid
		 * and do some transformations on it.
		 *
		 * param: (String) data - setup response data
		 * return: (Object) - parsed setup data
		 */
		parseSetupResponse(data) {
			
			/**
			 * Throws an error if the setup has defined a select input
			 * but does not specify the options of the selection. Have
			 * no idea how to do this test with json schema, so this
			 * function will take care of it.
			 *
			 * param: (Object) setup - setup response data
			 */
			var checkForSelectValues = function(setup) {
				if (setup.inputs) {
					for (var input of setup.inputs) {
						if (input.type === 'select' && !input.values) {
							throw new Error(
								'selection declared but no values given');
						}
					}
				}
			}

			try {
				var setup = JSON.parse(data);
				this._validate(this.setupResponseValidator, setup);
				checkForSelectValues(setup);
			} 
			catch(error) {
				throw this.ProtocolError(error.message);
			}

			setup.description = this.sanitizeHtml(
				setup.description, this.protocol.htmlRules);

			return setup;
		}

		/**
		 * Check wether the data of a markup request is valid.
		 *
		 * param: (Object) data - markup request data
		 */
		parseMarkupRequest(data) {
		 
			try {
				this._validate(this.markupRequestValidator, data);
			} catch (err) {
				throw this.ProtocolError(err.message);
			}
		}

		/**
		 * Check wehter the response data of a markup request is valid
		 * and do some transformations on it.
		 *
		 * param: (String) response - markup response data
		 * return: (Object) - parsed markup response.
		 */
		parseMarkupResponse(response) {
			
			try {
				response = JSON.parse(response);
				this._validate(this.markupResponseValidator, response);
			} 
			catch(error) {
				throw this.ProtocolError(error.message);
			}

			if (response.error) {
				response.error = this.sanitizeHtml(response.error, 
					this.protocol.htmlRules);
			}

			if (response.report) {
				response.report = this.sanitizeHtml(response.report, 
					this.protocol.htmlRules);
			}

			return response;
		}
	}

	pool.Parser = Parser;

})(emphasize.pool);