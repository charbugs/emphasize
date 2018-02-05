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
			'removeAnnotation'
		];
		var marker = new pool.Marker({
			markerId,
			styleClass,
			webScraper,
			annotator: Annotator(markerId, styleClass),
			markupCompiler
		});
		return sequencer.sequenceSyncMethodExecution(marker, order);
	};

	var access = new pool.Access(
		Marker,
		msg => new pool.AccessError(msg)
	);

	var messaging = new pool.Messaging(
		chrome,
		access,
		msg => new pool.ChannelError(msg)
	);

	messaging.createMessageChannel();

})(emphasize.pool, emphasize.app);