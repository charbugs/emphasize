(function(pool) {

	'use strict';

	class Marker {

		constructor(props = {}) {
			
			this.id = props.id;
			this.styleClass = props.styleClass;
			this.webScraper = props.webScraper;
			this.annotator = props.annotator;
			this.markupCompiler = props.markupCompiler;
			
			this._webPageData = {};
		}

		extractWebPageData() {
			this._webPageData.url = this.webScraper.getUrl();
			this._webPageData.tokens =  this.webScraper.getTokens();
		}

		getWebPageDataForRemote() {
			return {
				url: this._webPageData.url,
				tokens: this._webPageData.tokens.map(t => t.form)
			}
		}

		annotate(remoteMarkup) {
			var batchedMarkupTokens = this.markupCompiler
				.compileRemoteMarkupAndSegment(remoteMarkup, 
					this._webPageData.tokens);

			batchedMarkupTokens = Array.from(batchedMarkupTokens);
			this.annotator.annotateNodes(batchedMarkupTokens);

		}

		removeAnnotation() {
			this.annotator.removeAnnotation();
		}
	}

	pool.Marker = Marker;

})(emphasize.pool);