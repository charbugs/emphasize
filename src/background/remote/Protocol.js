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

	///////////////////////////////////////////////////////
	// HTML Rules
	///////////////////////////////////////////////////////

	var spl = string => string.match(/\S+/g);

	/**
	 * Declares which html content is allowed in marker description.
	 */
	var descriptionHtmlRules = {
		allowedTags: spl(`
			a abbr address article aside
			b bdi bdo br blockquote
			caption cite code col colgroup
			dd details dfn dialog div dl dt
			em
			figcaption figure footer
			header hr
			i
			kbd
			li
			main mark meter
			nav
			ol
			p picture pre progress
			q
			rp rt ruby
			s samp section small span strong sub summary sup
			time
			u ul
			var
			wbr`),
		allowedAttributes : {
			'*': 		spl(`title`),
			a: 			spl(`href target type rel media hreflang download`),
			bdo: 		spl(`dir`),
			blockquote: spl(`cite`),
			details: 	spl(`open`),
			dialog: 	spl(`open`),
			li: 		spl(`type value`),
			meter: 		spl(`form high low max min optimum value`),
			ol: 		spl(`reversed start type`),
			progress:   spl(`max value`),
			time:  		spl(`datetime`),
		},
		allowedSchemes: spl(`http https`),
		allowedSchemesAppliedToAttributes: spl(`href cite`)
	};	 

	/**
	 * Declares which html content is allowed in gloss strings.
	 */
	 var glossHtmlRules = {
		allowedTags: spl(`
			a abbr address area article aside audio
			b bdi bdo br blockquote
			caption cite code col colgroup
			data dd details dfn dialog div dl dt
			em embed
			figcaption figure footer
			h1 h2 h3 h4 h5 h6 header hr
			i img
			kbd
			li
			main mark map meter
			nav
			object ol
			p param picture pre progress
			q
			rp rt ruby
			s samp section small source span strong sub summary sup
			table tbody td tfoot thead time th track
			u ul
			var video
			wbr`),
		allowedAttributes : {
			'*': 		spl(`style title`),
			a: 			spl(`href target type rel media hreflang download`),
			area: 		spl(`shape coords href alt`),
			audio: 		spl(`autoplay controls loop muted preload src`),
			bdo: 		spl(`dir`),
			blockquote: spl(`cite`),
			data: 		spl(`value`),
			details: 	spl(`open`),
			dialog: 	spl(`open`),
			embed: 		spl(`height src type width`),
			img: 		spl(`src alt height width usemap ismap`),
			li: 		spl(`type value`),
			map: 		spl(`name`),
			meter: 		spl(`form high low max min optimum value`),
			object: 	spl(`data name height width usemap type`),
			ol: 		spl(`reversed start type`),
			param: 		spl(`name value`),
			progress:   spl(`max value`),
			source: 	spl(`src media type`),
			td: 		spl(`colspan headers rowspan`),
			time:  		spl(`datetime`),
			th: 		spl(`abbr rowspan scope sorted`),
			track: 		spl(`default kind label src srclang`),
			video: 		spl(`src autoplay controls height width loop muted
							poster preload`)
		},
		allowedSchemes: spl(`http https`),
		allowedSchemesAppliedToAttributes: spl(`
			href src cite poster data`)
	};

	/**
	 * Declares which html content is allowed in marker report.
	 */
	var reportHtmlRules = glossHtmlRules;

	/* exports */
	pool.protocol = {
		setupRequestSchema,
		setupResponseSchema,
		markupRequestSchema,
		markupResponseSchema,
		descriptionHtmlRules,
		reportHtmlRules,
		glossHtmlRules
	};

 })(emphasize.pool);