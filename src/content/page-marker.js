'use strict';

class PageMarker {

	constructor({ jobId, markerSetup, webScraper, annotator, markupCompiler }) {
		
		this.jobId = jobId;
		this._markerSetup = markerSetup;
		this._webScraper = webScraper;
		this._annotator = annotator;
		this._markupCompiler = markupCompiler;
		
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

	toggleAnnotation() {
		this._annotator.toggleAnnotation();
	}

	removeAnnotation() {
		this._annotator.removeAnnotation();
	}
}

module.exports = { PageMarker };