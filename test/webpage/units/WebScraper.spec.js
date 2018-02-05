// Some tests depend on dom `document` and `NodeFilter`

describe('---------- WebScraper class ----------', () => {

	'use strict';

	var webScraper;
	beforeEach(() => {
		webScraper = new emphasize.pool.WebScraper();
	});

	describe('getUrl function', () => {

		it('should return the full url of the page', () => {
			webScraper.document = document;
			expect(webScraper.getUrl()).toEqual(document.location.href);
		});
	});

	describe('getTextNodes function', () => {

		it('should return all non-empty text nodes of an element', () => {
			webScraper.document = document;
			webScraper.NodeFilter = NodeFilter;
			webScraper.rootElement = fixtures.complexTextNodes().element;

			var nodes = webScraper.getTextNodes();

			expect(nodes.length).toEqual(4)
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('dolor sit');
			expect(nodes[2].data.trim()).toEqual('amet consectetur');
			expect(nodes[3].data.trim()).toEqual('adipiscing elit');
		});

		it('should ignore text nodes of script elements', () => {
			webScraper.document = document;
			webScraper.NodeFilter = NodeFilter;
			webScraper.rootElement = fixtures.withScript().element;
			
			var nodes = webScraper.getTextNodes();
			
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of noscript elements', () => {
			webScraper.document = document;
			webScraper.NodeFilter = NodeFilter;
			webScraper.rootElement = fixtures.withNoscript().element;

			var nodes = webScraper.getTextNodes();
			
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of style elements', () => {
			webScraper.document = document;
			webScraper.NodeFilter = NodeFilter;
			webScraper.rootElement = fixtures.withStyle().element;

			var nodes = webScraper.getTextNodes();
			
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});
	});

	describe('getTokens function', () => {

		it('should return the tokens of a web page in order', () => {
			webScraper.document = document;
			webScraper.NodeFilter = NodeFilter;

			var twoTextNodes = fixtures.twoTextNodes();
			webScraper.rootElement = twoTextNodes.element;
			
			var tokenize = jasmine.createSpy();
			tokenize.and.returnValues(
				[
					{ begin: 0, end: 2, form: 'ut' },
					{ begin: 3, end: 7, form: 'enim' },
					{ begin: 8, end: 10, form: 'ad' },
					{ begin: 11, end: 16, form: 'minim' },
					{ begin: 17, end: 23, form: 'veniam' }
				],
				[
					{ begin: 0, end: 4, form: 'quis' },
					{ begin: 5, end: 12, form: 'nostrud' },
					{ begin: 13, end: 25, form: 'exercitation' }
				]
			);
			webScraper.tokenize = tokenize;

			var tokens = webScraper.getTokens();
			expect(tokens).toEqual(twoTextNodes.tokens);
		});
	});
});