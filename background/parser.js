/** 
 * @module parse
 * This module defines functions for parsing/validating 
 * the response of the marker programms.
 * 
 * It uses JSON schema and Ajv for validating.
 * 
 * The schema declarations can be viewed as a documentation 
 * of the REST protocol between markers and the extension. 
 *
 * There is a further check for malicious html in marker response
 * using a html sanitizer library.
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
    * Declares what html elements are allowed in the marker messages.
    * Will be passed to the html sanitizer.
    */
    var htmlRules = {
        allowedTags: ['a', 'b', 'i', 'em', 'strong', 'br', 'ul', 'li', 'ol',
            'table', 'thead', 'tbody', 'tr', 'td', 'th'],
        allowedAttributes: {
            'a': ['href']
        }
    }

    var TITLE_LENGTH = 30;
    var SUBTITLE_LENGTH = 100;

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
        required: ['title', 'subtitle', 'description'],
        additionalProperties: false,
        properties: {
            title: {
                type: 'string'
            },
            subtitle: {
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
    * Throws an error if the setup response has defined a select input
    * but does not specify the options of the selection.
    *
    * Have no idea how to do this test with json schema, so this function
    * will take care of it.
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
    * @return {Promise(Object)} - parsed marker response.
    */
    function parseMarkupResponse(responseText) {
    
        try {
            response = JSON.parse(responseText);
            validate(markupValidator, response);
            if (response.message)
                response.message = sanitizeHtml(response.message, htmlRules);
            return Promise.resolve(response);
        } 
        catch(err) {
            var msg = 'Bad marker response: ' + err.message;
            return Promise.reject(new ResponseParseError(msg));
        }
    }
    
    /**
    * Parses the response to a setup request.
    *
    * @param {String} responseText
    * @return {Promise(Object)} - parsed marker response.
    */
    function parseSetupResponse(responseText) {
        try {
            response = JSON.parse(responseText);
            validate(setupValidator, response);
            checkForSelectValues(response);
            response.title = response.title.substring(0,TITLE_LENGTH);
            response.subtitle = response.subtitle.substring(0,SUBTITLE_LENGTH);
            response.description = sanitizeHtml(response.description,
                htmlRules);
            return Promise.resolve(response);
        }
        catch (err) {
            var msg = 'Bad marker response: ' + err.message;
            return Promise.reject(new ResponseParseError(msg));
        }
    }

    /** interfaces */
    return {
        parseMarkupResponse: parseMarkupResponse,
        parseSetupResponse: parseSetupResponse
    };
}());
