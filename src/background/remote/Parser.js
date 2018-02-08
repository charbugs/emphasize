/**
 * Functions for parsing and validating the request/response data
 */
(function(pool) {

	'use strict';

	class Parser {

		constructor(props = {}) {

			this._protocol = props.protocol;
			this._createProtocolError = props.createProtocolError;
			this._Ajv = props.Ajv;
			this._sanitizeHtml = props.sanitizeHtml;


			// validator functions
			this._setupRequestValidator = this._Ajv({allErrors: true})
					.compile(this._protocol.setupRequestSchema);

			this._setupResponseValidator = this._Ajv({allErrors: true})
					.compile(this._protocol.setupResponseSchema);

			this._markupRequestValidator = this._Ajv({allErrors: true})
					.compile(this._protocol.markupRequestSchema);

			this._markupResponseValidator = this._Ajv({allErrors: true})
					.compile(this._protocol.markupResponseSchema);		
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
				this._validate(this._setupRequestValidator, data);
			} catch (err) {
				throw this._createProtocolError(err.message);
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
			
			try {
				var setup = JSON.parse(data);
				this._validate(this._setupResponseValidator, setup);
				this._checkForSelectValues(setup);
			} 
			catch(error) {
				throw this._createProtocolError(error.message);
			}

			setup.description = this._sanitizeHtml(
				setup.description, this._protocol.htmlRules);

			return setup;
		}

		/**
		 * Throws an error if the setup has defined a select input
		 * but does not specify the options of the selection. Have
		 * no idea how to do this test with json schema, so this
		 * function will take care of it.
		 *
		 * param: (Object) setup - setup response data
		 */
		_checkForSelectValues(setupResponse) {
			if (setupResponse.inputs) {
				for (var input of setupResponse.inputs) {
					if (input.type === 'select' && !input.values) {
						throw new Error(
							'Selection declared but no values given.');
					}
				}
			}
		}

		/**
		 * Check wether the data of a markup request is valid.
		 *
		 * param: (Object) data - markup request data
		 */
		parseMarkupRequest(data) {
		 
			try {
				this._validate(this._markupRequestValidator, data);
			} catch (err) {
				throw this._createProtocolError(err.message);
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
				this._validate(this._markupResponseValidator, response);
				this._checkEachTokenIsUnique(response);
			} 
			catch(error) {
				throw this._createProtocolError(error.message);
			}

			if (response.error) {
				response.error = this._sanitizeHtml(response.error, 
					this._protocol.htmlRules);
			}

			if (response.report) {
				response.report = this._sanitizeHtml(response.report, 
					this._protocol.htmlRules);
			}

			if (response.markup) {
				response.markup.forEach(item => {
					if (item.gloss) {
						item.gloss = this._sanitizeHtml(item.gloss,
							this._protocol.htmlRules);
					}
				});
			}

			return response;
		}

		_checkEachTokenIsUnique(response) {
			if (!response.markup)
				return;

			var tokenNums = [];

			response.markup.forEach(item => {
				
				for (var num of this._getTokenNumsOfItem(item)) {
				
					if (tokenNums[num])
						throw new Error(`Token ${num} is not unique.`);
					else {
						tokenNums[num] = true;
					}
				}
			});
		}

		*_getTokenNumsOfItem(item) {
			if (item.token) {
				yield item.token;
			}
			else if (item.tokens) {
				for (var token of item.tokens) {
					yield token;
				}
			}
			else if (item.group) {
				for (var i = item.group.first; i <= item.group.last; i++) {
					yield i;
				}
			}
			else if (item.groups) {
				for (var group of item.groups) {
					for (var i = group.first; i <= group.last; i++) {
						yield i;
					}		
				};
			}
		}
	}

	pool.Parser = Parser;

})(emphasize.pool);