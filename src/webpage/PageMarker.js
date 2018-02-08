(function(pool) {

	'use strict';

	class PageMarker {

		constructor(props = {}) {
			
			this.id = props.id;
			this._styleClass = props.styleClass;
			this._webScraper = props.webScraper;
			this._annotator = props.annotator;
			this._markupCompiler = props.markupCompiler;
			
			this._webPageData = {};
		}

		extractWebPageData() {
			this._webPageData.url = this._webScraper.getUrl();
			this._webPageData.tokens =  this._webScraper.getTokens();
		}

		getWebPageDataForRemote() {
			return {
				url: this._webPageData.url,
				tokens: this._webPageData.tokens.map(t => t.form)
			}
		}

		annotate(markup) {
			var annotatedTokens = this._markupCompiler.compileMarkup(
				markup, this._webPageData.tokens);
			this._annotator.annotate(annotatedTokens);
		}

		removeAnnotation() {
			this._annotator.removeAnnotation();
		}
	}

	pool.PageMarker = PageMarker;

})(emphasize.pool);