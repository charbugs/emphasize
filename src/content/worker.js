'use strict';

class Worker {

	constructor({ createScraper, createAnnotation, createAnnotator, document }) {
		this._createScraper = createScraper;
		this._createAnnotation = createAnnotation;
		this._createAnnotator = createAnnotator;
		this._document = document;

		this._jobId;
		this._markerSetup;

		this._scraper;
		this._annotation;
		this._annotator;

		this._tokenNodes;
	}

	startAnnotationJob(jobId, markerSetup) {
		if (this._jobId) 
			throw Error('An annotation job already running.');
		else if (jobId === undefined)
			throw Error('Need a jod id to start the job.');

		this._jobId = jobId;
		this._markerSetup = markerSetup;
		this._scraper = this._createScraper();
		this._annotation = this._createAnnotation(jobId, markerSetup);
		this._annotator = this._createAnnotator(this._annotation);
	}

	stopAnnotationJob(jobId) {
		this._checkJobId(jobId);
		
		this._jobId = null;
		this._markerSetup = null;
		this._scraper = null;
		this._annotation = null;
		this._annotator = null;	
		this._tokenNodes = null;
	}

	getTokens(jobId) {
		this._checkJobId(jobId);
		
		this._tokenNodes = this._scraper.getTokenNodes();
		return this._tokenNodes.map(node => node.data);
	}

	getUrl(jobId) {
		this._checkJobId(jobId);

		return this._scraper.getUrl();
	}

	annotate(jobId, markup) {
		this._checkJobId(jobId);

		if (!this._tokenNodes)
			throw Error('No token nodes to annotate.');

		this._annotator.annotate(this._tokenNodes, markup);
		this._document.normalize();
	}

	removeAnnotation(jobId) {
		this._checkJobId(jobId);

		this._annotator.removeAnnotation();
		this._document.normalize();
	}

	toggleAnnotation(jobId) {
		this._checkJobId(jobId);

		this._annotator.toggleAnnotation();
		this._document.normalize();
	}

	_checkJobId(jobId) {
		if (!this._jobId)
			throw Error('No annotation job running.');
		else if(this._jobId !== jobId)
			throw Error('Job id mismatch.');
	}
}

module.exports = { Worker };