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
		parseSetupRequest(request) {
			try {
				this._validate(this._setupRequestValidator, request);
			} catch (err) {
				throw this._createProtocolError(err.message);
			}
			return request;
		}

		/**
		 * Check wether the response data of a setup request is valid
		 * and do some transformations on it.
		 *
		 * param: (String) data - setup response data
		 * return: (Object) - parsed setup data
		 */
		parseSetupResponse(response) {
			
			try {
				var response = JSON.parse(response);
				this._validate(this._setupResponseValidator, response);
				this._checkForSelectValues(response);
			} 
			catch(error) {
				throw this._createProtocolError(error.message);
			}

			response.description = this._sanitizeHtml(
				response.description, this._protocol.descriptionHtmlRules);

			return response;
		}

		/**
		 * Throws an error if the setup has defined a select input
		 * but does not specify the options of the selection. Have
		 * no idea how to do this test with json schema, so this
		 * function will take care of it.
		 *
		 * param: (Object) setup - setup response data
		 */
		_checkForSelectValues(response) {
			if (response.inputs) {
				for (var input of response.inputs) {
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
		parseMarkupRequest(request) {
			
			try {
				this._validate(this._markupRequestValidator, request);
			} catch (err) {
				throw this._createProtocolError(err.message);
			}
			return request;
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
				this._checkTokenNumbers(response);
			} 
			catch(error) {
				throw this._createProtocolError(error.message);
			}

			if (response.report) {
				response.report = this._sanitizeHtml(response.report, 
					this._protocol.htmlRules);
			}

			if (response.markup) {
				response.markup.forEach(item => {
					if (item.gloss) {
						item.gloss = this._sanitizeHtml(item.gloss,
							this._protocol.glossHtmlRules);
					}
				});
			}

			return response;
		}

		_checkTokenNumbers(response) {
			if (!response.markup)
				return;
			// order matters
			this._checkFirstLowerLast(response);
			this._checkEachTokenIsUnique(response);
		}

		_checkFirstLowerLast(response) {
			response.markup.forEach((item, index) => {
				if (item.group) {
					if (item.group.first > item.group.last) {
						throw new Error(
							`In markup item ${index}: first > last`);
					}
				}
				else if (item.groups) {
					item.groups.forEach(group => {
						if (group.first > group.last) {
							throw new Error(
								`In markup item ${index}: first > last`);
						}
					});
				}
			});
		}

		_checkEachTokenIsUnique(response) {
			var tokenNums = [];
			response.markup.forEach((item, index) => {
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