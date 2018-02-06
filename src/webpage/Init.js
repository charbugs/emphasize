(function(pool, app) {

	'use strict';

	var sequencer = new pool.Sequencer();
	var tokenizer = new pool.Tokenizer();
	var markupCompiler = new pool.MarkupCompiler();

	var webScraper = new pool.WebScraper(
		document, 
		document.body,
		tokenizer.whiteSpace,
		NodeFilter
	);

	var Annotator = function(markerId, styleClass) {
		return new pool.Annotator(
			document,
			document.body,
			markerId,
			styleClass
		);
	};

	var Marker = function(markerId, styleClass) {
		var order = [
			'extractWebPageData',
			'getWebPageDataForRemote',
			'annotate',
		];
		var marker = new pool.Marker({
			id: 			markerId,
			styleClass: 	styleClass,
			webScraper: 	webScraper,
			annotator: 		Annotator(markerId, styleClass),
			markupCompiler:	markupCompiler 
		});
		return sequencer.sequenceSyncMethodExecution(marker, order);
	};

	var AccessError = function(msg) {
		return new pool.AccessError(msg);
	};

	var access = new pool.Access(
		Marker,
		AccessError
	);


	var ChannelError = function(msg) {
		return new pool.ChannelError(msg);
	};

	var messaging = new pool.Messaging(
		chrome,
		access,
		ChannelError
	);

	messaging.createMessageChannel();

})(emphasize.pool, emphasize.app);