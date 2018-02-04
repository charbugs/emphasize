/**
 * Module defines the protocol between the 
 * browser extension and the remote marker programms.
 */
 (function(em) {

 	'use strict';

 	/**
	 * (json schema)
	 * Structure of the data for setup requests. 
	 */
	var setupRequestSchema = {
		type: 'object',
		required: ['call'],
		additionalProperties: false,
		properties: {
			call: {
				type: 'string',
				enum: ['setup']
			}
		}
	};

	/**
	 * (json schema)
	 * If a marker was requested to pass it's setup, the response 
	 * must have this structure.
	 */
	var setupResponseSchema = {
		type: 'object',
		required: ['title', 'description'],
		additionalProperties: false,
		properties: {
			title: {
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

	/**
	 * (json schema)
	 * Structure of the data for markup requests.
	 */
	var markupRequestSchema = {
		type: 'object',
		required: ['call', 'tokens', 'inputs', 'webpageUrl'],
		additionalProperties: false,
		properties: {
			call: {
				type: 'string',
				enum: ['markup']
			},
			tokens: {
				type: 'array',
				items: {
					type: 'string'
				}
			},
			inputs: {
				type: 'object',
			},
			webpageUrl: {
				type: 'string'
			}
		}
	};

	/**
	 * (json schema)
	 * If an marker was requested for markup, the response 
	 * must have this structure.
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
						report: { 
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
	 * Declares which html elements are allowed in the marker report.
	 * Will be passed to the html sanitizer.
	 */
	var htmlRules = {
		allowedTags: ['a', 'b', 'i', 'em', 'strong', 'br', 'ul', 'li', 'ol',
			'table', 'thead', 'tbody', 'tr', 'td', 'th'],
		allowedAttributes: {
			'a': ['href']
		}
	};

	/* exports */
	em.protocol = {
		setupRequestSchema,
		setupResponseSchema,
		markupRequestSchema,
		markupResponseSchema,
		htmlRules
	};

 })(emphasize);