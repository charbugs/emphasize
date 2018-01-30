(function(em) {

	'use strict';

	class Marker {

	    constructor(id, root, tokenizer) {
	    	this.id = id;
	    	this._root = root || em.document.body;
	    	this._tokenizer = tokenizer || em.tokenizers.whiteSpace;
	    	this._webPageData = {};
	    	this._extractWebPageData();
	    }

	    getWebPageDataForRemote() {
	    	return {
	    		url: this._webPageData.url,
	    		tokens: this._webPageData.tokens.map(t => t.form)
	    	}
	    };

	    annotate(remoteMarkup) {
	    	var compile = em.markupCompiler.compileRemoteMarkupAndSegment;
	    	var annotate = em.nodeAnnotator.annotate;
	    	var segments = compile(remoteMarkup, this._webPageData.tokens);
	    	for (var segment of segments) {
	    		annotate(segment, this.id);
	    	};
	    }

	    removeAnnotation() {
			em.nodeAnnotator.removeAnnotation(this._root, this.id);
	    }

		_extractWebPageData() {
	    	this._webPageData.url = em.webscraper.getUrl();
	    	this._webPageData.tokens =  em.webscraper.getTokens(
	    		this._root,	this._tokenizer);
		}
	}

	em.marker = {
		Marker
	};

})(emphasize);