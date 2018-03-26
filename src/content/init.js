'use strict';
var tippy = require('tippy.js');

var { sequenceSyncMethodExecution } = require('../common/sequencer.js');
var { Token } = require('./token.js');
var { Tokenizer } = require('./tokenizer.js');
var { WebScraper } = require('./web-scraper.js');
var { MarkupCompiler } = require('./markup-compiler.js');
var { Annotator } = require('./annotator.js');
var { PageMarker } = require('./page-marker.js');
var { Access } = require('./access.js');
var { Messaging } = require('./messaging.js');


var createToken = (form, node, begin, end) => new Token({ 
	form, node, begin, end
});
	
var tokenizer = new Tokenizer();

var webScraper = new WebScraper({
	document: 		document, 
	rootElement: 	document.body,
	tokenizer: 		tokenizer,
	NodeFilter: 	NodeFilter,
	createToken: 	createToken
});

var markupCompiler = new MarkupCompiler();

var createAnnotator = (jobId, markerSetup) => new Annotator({
	document: 		document,
	rootElement: 	document.body,
	jobId: 			jobId,
	markerSetup: 	markerSetup,
	tippy:  		tippy
});

var createPageMarker = function(jobId, markerSetup) {
	var order = [
		'extractWebPageData',
		'getWebPageDataForRemote',
		'annotate',
	];
	var marker = new PageMarker({
		jobId: 			jobId,
		markerSetup: 	markerSetup,
		webScraper: 	webScraper,
		annotator: 		createAnnotator(jobId, markerSetup),
		markupCompiler:	markupCompiler 
	});
	return sequenceSyncMethodExecution(marker, order);
};

var access = new Access({ createPageMarker });

var messaging = new Messaging({
	browser: 			chrome,
	baseObject: 		access,
});

messaging.createMessageChannel();