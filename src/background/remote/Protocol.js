/**
 * Module defines the protocol between the 
 * browser extension and the remote marker programms.
 */
 (function(pool) {

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
		required: ['call', 'tokens', 'inputs', 'url'],
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
			url: {
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
					additionalProperties: false,
					properties: {
						markup: { 
							type: 'array',
							items: {
								oneOf: [
									{ // token
										type: 'object',
										required: ['token'],
										additionalProperties: false,
										properties: {
											token: {
												type: 'integer',
											},
											mark: {
												type: 'boolean'
											},
											gloss: {
												type: 'string'
											}
										}
									},
									{ // tokens
										type: 'object',
										required: ['tokens'],
										additionalProperties: false,
										properties: {
											tokens: {
												type: 'array',
												items: {
													type: 'integer'
												}
											},
											mark: {
												type: 'boolean'
											},
											gloss: {
												type: 'string'
											}	
										}
									},
									{ // group
										type: 'object',
										required: ['group'],
										additionalProperties: false,
										properties: {
											group: {
												type: 'object',
												required: ['first', 'last'],
												additionalProperties: false,
												properties: {
													first: {
														type: 'integer'
													},
													last: {
														type: 'integer'
													}
												}
											},
											mark: {
												type: 'boolean'
											},
											gloss: {
												type: 'string'
											}
										}
									},
									{ // groups
										type: 'object',
										required: ['groups'],
										additionalProperties: false,
										properties: {
											groups: {
												type: 'array',
												items: {
													type: 'object',
													required: ['first', 'last'],
													additionalProperties: false,
													properties: {
														first: {
															type: 'integer'
														},
														last: {
															type: 'integer'
														}
													}
												}
											},
											mark: {
												type: 'boolean'
											},
											gloss: {
												type: 'string'
											}
										}
									}
								]
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
		allowedTags: [
			'a', 'img',
			'b', 'i', 'em', 'strong', 'br', 
			'ul', 'li', 'ol',
			'table', 'thead', 'tbody', 'tr', 'td', 'th'],
		allowedAttributes: {
			'a': ['href']
		}
	};

	/* exports */
	pool.protocol = {
		setupRequestSchema,
		setupResponseSchema,
		markupRequestSchema,
		markupResponseSchema,
		htmlRules,
	};

 })(emphasize.pool);