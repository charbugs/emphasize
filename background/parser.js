/** 
 * @module parse
 * This module defines functions for parsing/validating 
 * the response of the marker programms.
 * 
 * It uses JSON schema and Ajv for validating.
 * 
 * The schema declarations can be viewed as a documentation 
 * of the REST protocol between markers and the extension. 
 */
var parser = (function(){

    /**
    * An Error that will be thrown if the response data of a marker app
    * does not match the communication protocol of marker and extension
    */
    function ResponseParseError(message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }
    ResponseParseError.prototype = Object.create(Error.prototype);
    ResponseParseError.prototype.name = 'ResponseParseError';

    /**
    * If a marker was requested to mark a text, the response 
    * must have this structure (in the words of json schema).
    */
    var markupResponseSchema = {
        oneOf: [
            { // regular response 
                type: 'object',
                required: ['markup'],
                additionalProperties: false,
                properties: {
                    markup: { 
                        type: 'array',
                        items: {
                            type: 'integer'
                        }
                    },
                    message: { 
                        type: 'string'
                    }
                }
            },
            { // error response
                type: 'object',
                required: ['error'],
                additionalProperties: true,
                properties: {
                    error: {
                        type: 'string',
                    }
                }
            }
        ]
    };

    /**
    * If a marker was requested to pass it's setup, the response 
    * must have this structure (in the words of json schema).
    */
    var setupResponseSchema = {
        type: 'object',
        required: ['name', 'description'],
        additionalProperties: false,
        properties: {
            name: {
                type: 'string'
            },
            description: {
                type: 'string'
            },
            inputs: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'type'],
                    additionalProperties: false,
                    properties: {
                        id: {
                            type: 'string'
                        },
                        type: {
                            type: 'string',
                            enum: ['text', 'select']
                        },
                        values: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        },
                        label: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    };

    // setup the validators
    var ajv = Ajv({allErrors: true});
    var markupValidator = ajv.compile(markupResponseSchema);
    var setupValidator = ajv.compile(setupResponseSchema);

    /**
    * Schema validation of data. Throws an error if data is bad.
    *
    * @param {function} validator
    * @param {any} data
    * @throws Error  
    */
    function validate(validator, data) {
        if(!validator(data)) {
            var first = validator.errors[0];
            var msg = "Response" + first.dataPath + " " + first.message;
            throw new Error(msg);
        }
    }

    /**
    * Throws an error is the setup response has defines a select input
    * but does not specify the options of the selection. This function 
    * is necessary due to an shortcoming in json schema.
    *
    * @param {Object} setupResponse
    * @throws Error
    */
    function checkForSelectValues(setupResponse) {
        if (setupResponse.inputs) {
            for (var input of setupResponse.inputs) {
                if (input.type === 'select' && !input.values) {
                    throw new Error('selection declared but no values given');
                }
            }
        }
    }

    /**
    * Parses the response to a markup request.
    *
    * @param {String} responseText
    * @param {Function} callback - (err, data) 
    */
    function parseMarkupResponse(responseText, callback) {
        try {
            response = JSON.parse(responseText);
            validate(markupValidator, response);
            callback(null, response);
        }
        catch (err) {
            var msg = 'Bad marker response: ' + err.message;
            callback(new ResponseParseError(msg), null);
        }
    }

    /**
    * Parses the response to a setup request.
    *
    * @param {String} responseText
    * @param {Function} callback - (err, data) 
    */
    function parseSetupResponse(responseText, callback) {
        try {
            response = JSON.parse(responseText);
            validate(setupValidator, response);
            checkForSelectValues(response);       
            callback(null, response);
        }
        catch (err) {
            var msg = 'Bad marker response: ' + err.message;
            callback(new ResponseParseError(msg), null);
        }
    }

    /** interfaces */
    return {
        parseMarkupResponse: parseMarkupResponse,
        parseSetupResponse: parseSetupResponse
    };
}());
