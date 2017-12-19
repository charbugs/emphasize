/**
 * This class defines the protocol between the 
 * browser extension and the remote analyzer programms.
 */
class Protocol {

	constructor () {
		throw new Error("This class can not be instantiated.");
	}
}

/**
 * (json schema)
 * Structure of the data for setup requests. 
 */
Protocol.setupRequestSchema = {
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
 * If a analyzer was requested to pass it's setup, the response 
 * must have this structure.
 */
Protocol.setupResponseSchema = {
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
 * Structure of the data for analysis requests.
 */
Protocol.analysisRequestSchema = {
	type: 'object',
	required: ['call', 'tokens', 'inputs', 'webpage'],
	additionalProperties: false,
	properties: {
		call: {
			type: 'string',
			enum: ['analyze']
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
		webpage: {
			type: 'string'
		}
	}
};

/**
 * (json schema)
 * If an analyser was requested to analyze a text, the response 
 * must have this structure.
 */
Protocol.analysisResponseSchema = {
		oneOf: [
			{ // regular response 
				type: 'object',
				required: ['annotation'],
				additionalProperties: false,
				properties: {
					annotation: { 
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
 * Declares which html elements are allowed in the analysis report.
 * Will be passed to the html sanitizer.
 */
Protocol.htmlRules = {
	allowedTags: ['a', 'b', 'i', 'em', 'strong', 'br', 'ul', 'li', 'ol',
		'table', 'thead', 'tbody', 'tr', 'td', 'th'],
	allowedAttributes: {
		'a': ['href']
	}
}