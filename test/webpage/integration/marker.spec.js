'use strict';

describe('marker class', () => {

	var em = emphasize;

	var complex, marker, id;
	beforeEach(() => {
		id = 42;
		complex = fixtures.complexTextNodes();
		marker = new em.marker.Marker(id, complex.element);
	});

	describe('extractWebPageData method', () => {

		beforeEach(() => {
			marker.extractWebPageData();
		});

		it('should store the web page url', () => {
			expect(marker._webPageData.url).toEqual(document.location.href);
		});

		it('should store the web page tokens', () => {
			expect(marker._webPageData.tokens).toEqual(complex.tokens);
		});
	});

	describe('getWebPageDataForRemote method', () => {

		var data;
		beforeEach(() => {
			marker.extractWebPageData();
			data = marker.getWebPageDataForRemote();
		});

		it('return object should contain web page url', () => {
			expect(data.url).toEqual(document.location.href);	
		});

		it('return object should contain a list of web page token forms', () => {
			expect(data.tokens).toEqual(['lorem', 'ipsum', 'dolor', 'sit',
				'amet', 'consectetur', 'adipiscing', 'elit']);
		});
	});

	describe('annotate method', () => {

		beforeEach(() => {
			marker.extractWebPageData();
		});

		it('should annotate properly (1)', () => {

			var remoteMarkup = [];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					lorem ipsum
					<b>dolor sit</b>
					<em>
						<h1>amet consectetur</h1>
						<h2>adipiscing elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);			
		});

		it('should annotate properly (2)', () => {

			var remoteMarkup = [
				{ token: 0 }
			];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					<emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">lorem</emphasize-wrapper> ipsum
					<b>dolor sit</b>
					<em>
						<h1>amet consectetur</h1>
						<h2>adipiscing elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);			
		});

		it('should annotate properly (3)', () => {

			var remoteMarkup = [
				{ tokens: [0, 3], mark: false }
			];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					<emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-unmarked">lorem</emphasize-wrapper> ipsum
					<b>dolor <emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-unmarked">sit</emphasize-wrapper></b>
					<em>
						<h1>amet consectetur</h1>
						<h2>adipiscing elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);			
		});

		it('should annotate properly (4)', () => {

			var remoteMarkup = [
				{ token: 2, gloss: 'a nice gloss' }
			];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					lorem ipsum
					<b><emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">dolor<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper> sit</b>
					<em>
						<h1>amet consectetur</h1>
						<h2>adipiscing elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);			
		});

		it('should annotate properly (5)', () => {

			var remoteMarkup = [
				{ group: { first: 3, last: 6 }, gloss: 'a nice gloss' }
			];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					lorem ipsum
					<b>dolor <emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">sit<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper></b>
					<em>
						<h1><emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">amet consectetur<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper></h1>
						<h2><emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">adipiscing<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper> elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);			
		});

		it('should annotate properly (6)', () => {

			var remoteMarkup = [
				{ groups: [ { first: 3, last: 4}, { first: 5, last: 6} ], 
					gloss: 'a nice gloss' }
			];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					lorem ipsum
					<b>dolor <emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">sit<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper></b>
					<em>
						<h1><emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">amet<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper> <emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">consectetur<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper></h1>
						<h2><emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-marked">adipiscing<emphasize-gloss>a nice gloss</emphasize-gloss></emphasize-wrapper> elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);			
		});
	});

	describe('removeAnnotation method', () => {

		beforeEach(() => {
			marker.extractWebPageData();
		});

		it('should remove the annotation made by this marker', () => {

			var remoteMarkup = [
				{ tokens: [0, 3], mark: false }
			];

			// indentation matters !! see the corresponding fixture
			var after = `
				<div>
					<emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-unmarked">lorem</emphasize-wrapper> ipsum
					<b>dolor <emphasize-wrapper data-emphasize-marker-id="42" class="emphasize-unmarked">sit</emphasize-wrapper></b>
					<em>
						<h1>amet consectetur</h1>
						<h2>adipiscing elit</h2>
					</em>
				</div>`.trim();

			marker.annotate(remoteMarkup);
			expect(complex.element.outerHTML).toEqual(after);

			marker.removeAnnotation();
			expect(complex.element.outerHTML).toEqual(complex.html);
		});
	});
});