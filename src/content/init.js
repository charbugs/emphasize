'use strict';

var tippy = require('tippy.js');

var { Scraper } = require('./scraper.js');
var { Annotation } = require('./annotation.js');
var { Annotator } = require('./annotator.js');
var { Worker } = require('./worker.js');
var { Messaging } = require('./messaging.js');

var createScraper = function() {
	return new Scraper({
		document: 		document,
		rootElement: 	document.body,
		NodeFilter: 	NodeFilter,
		Node: 			Node
	});
}

var createAnnotation = function(jobId, markerSetup) {
	return new Annotation({
		document: 		document,
		Node: 			Node,
		tippy: 			tippy,
		jobId: 			jobId,
		markerSetup: 	markerSetup
	});
};

var createAnnotator = function(annotation) {
	return new Annotator({
		document: 	document,
		Node: 		Node,
		annotation: annotation
	});
}

var worker = new Worker({
	document: 			document,
	createScraper: 		createScraper,
	createAnnotation: 	createAnnotation,
	createAnnotator: 	createAnnotator
});

var messaging = new Messaging({
	browser: 			chrome,
	baseObject: 		worker,
});

messaging.createMessageChannel();