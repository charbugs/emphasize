(function(em) {

	'use strict';

	class Marker {

		constructor(id, root, tokenizer) {
			this.id = id;
			this._root = root || em.document.body;
			this._tokenizer = tokenizer || em.tokenizers.whiteSpace;
			this._webPageData = {};
		}

		extractWebPageData() {
			this._webPageData.url = em.webscraper.getUrl();
			this._webPageData.tokens =  em.webscraper.getTokens(
				this._root, this._tokenizer);
		}

		getWebPageDataForRemote() {
			return {
				url: this._webPageData.url,
				tokens: this._webPageData.tokens.map(t => t.form)
			}
		}

		annotate(remoteMarkup, styleClass) {
			var batchedMarkupTokens = em.markup.
				compileRemoteMarkupAndSegment(remoteMarkup, 
					this._webPageData.tokens);
			batchedMarkupTokens = Array.from(batchedMarkupTokens);
			em.annotation.annotateNodes(
				batchedMarkupTokens, this.id, styleClass);

		}

		removeAnnotation() {
			em.annotation.removeAnnotation(this._root, this.id);
		}
	}

	em.marker = {
		Marker
	};

})(emphasize);