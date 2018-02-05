
describe('---------- Marker class ----------', () => {

	'use strict';

	describe('extractWebPageData method', () => {

		var marker;
		beforeEach(() => {

			var webScraper = jasmine.createSpyObj(['getUrl', 'getTokens']);
			webScraper.getUrl.and.returnValue('http://foo.bar/');
			webScraper.getTokens.and.returnValue('pretty nice tokens');

			marker = new emphasize.pool.Marker({
				webScraper
			});
		});

		it('should use web scraper to extract and store web page url', () => {
			marker.extractWebPageData();
			expect(marker._webPageData.url).toEqual('http://foo.bar/');
		});

		it('should use WebScraper to extract and store web page tokens', () => {
			marker.extractWebPageData();
			expect(marker._webPageData.tokens).toEqual('pretty nice tokens');
		});
	});

	describe('getWebPageDataForRemote method', () => {

		var marker;
		beforeEach(() => {
			marker = new emphasize.pool.Marker();
			marker._webPageData = { 
				url: 'http://foo.bar/', 
				tokens: [ { form: 'foo' }, { form: 'bar' }, { form: 'baz' } ]
			}
		});

		it('should return an object that contains the stored web page url', 
			() => {
			expect(marker.getWebPageDataForRemote().url)
				.toEqual('http://foo.bar/');
		});

		it('should return an object that contains the web page tokens \
				as a list of strings', () => {
			expect(marker.getWebPageDataForRemote().tokens)
				.toEqual(['foo', 'bar', 'baz']);
		});
	});

	describe('annotate method', () => {

		var marker, markupCompiler, annotator, 
			remoteMarkup, batchedMarkupTokens;
		
		beforeEach(() => {
			
			remoteMarkup = 'FOO';
			batchedMarkupTokens = ['BAR'];
			
			markupCompiler = jasmine.createSpyObj(['compileRemoteMarkupAndSegment']);
			markupCompiler.compileRemoteMarkupAndSegment.and.
				returnValue(batchedMarkupTokens);
			
			annotator = jasmine.createSpyObj(['annotateNodes']);

			marker = new emphasize.pool.Marker({
				markupCompiler,
				annotator
			});

			marker._webPageData.tokens = 'BAZ';

			marker.annotate(remoteMarkup);
		});

		it('should use markup compiler properly', () => {
			expect(markupCompiler.compileRemoteMarkupAndSegment.calls.argsFor(0))
				.toEqual([remoteMarkup, marker._webPageData.tokens]);
		});

		it('should use annotator properly', () => {
			expect(annotator.annotateNodes.calls.argsFor(0))
				.toEqual([batchedMarkupTokens]);
		});
	});

	describe('removeAnnotation method', () => {

		var annotator;
		beforeEach(() => {
			annotator = jasmine.createSpyObj(['removeAnnotation']);
			var marker = new emphasize.pool.Marker({
				annotator
			});
			marker.removeAnnotation();
		});

		it('should use annotator properly', () => {
			expect(annotator.removeAnnotation).toHaveBeenCalled();
			

		});
	});
});