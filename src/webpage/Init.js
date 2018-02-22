(function(pool, app) {

	'use strict';

	var createChannelError = msg => new pool.ChannelError(msg);
	var createAccessError = msg => new pool.AccessError(msg);

	var sequencer = new pool.Sequencer();
	var tokenizer = new pool.Tokenizer();
	var markupCompiler = new pool.MarkupCompiler();

	var createToken = function(form, node, begin, end) {
		return new pool.Token({
			form: 	form,
			node: 	node,
			begin: 	begin,
			end: 	end
		});
	}

	var webScraper = new pool.WebScraper({
		document: 		document, 
		rootElement: 	document.body,
		tokenizer: 		tokenizer,
		NodeFilter: 	NodeFilter,
		createToken: 	createToken
	});


	var createAnnotator = function(jobId, markerSetup) {
		return new pool.Annotator({
			document: 		document,
			rootElement: 	document.body,
			jobId: 			jobId,
			markerSetup: 	markerSetup,
			tippy:  		tippy
		});
	};

	var createPageMarker = function(jobId, markerSetup) {
		var order = [
			'extractWebPageData',
			'getWebPageDataForRemote',
			'annotate',
		];
		var marker = new pool.PageMarker({
			jobId: 			jobId,
			markerSetup: 	markerSetup,
			webScraper: 	webScraper,
			annotator: 		createAnnotator(jobId, markerSetup),
			markupCompiler:	markupCompiler 
		});
		return sequencer.sequenceSyncMethodExecution(marker, order);
	};

	var access = new pool.Access({
		createPageMarker:	createPageMarker,
		createAccessError: 	createAccessError
	});

	var messaging = new pool.Messaging({
		browser: 			chrome,
		baseObject: 		access,
		createChannelError: createChannelError
	});

	messaging.createMessageChannel();

})(emphasize.pool, emphasize.app);