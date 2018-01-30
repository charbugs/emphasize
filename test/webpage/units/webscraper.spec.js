
describe('webscraper module', () => {

	var em = emphasize
	var scraper = em.webscraper;

	describe('getUrl function', () => {

		it('should return the full url of the page', () => {
			expect(scraper.getUrl()).toEqual(em.document.location.href);
		});
	});

	describe('getTextNodes function', () => {

		it('should return all non-empty text nodes of an element', () => {
			var complex = fixtures.complexTextNodes();
			var nodes = scraper.getTextNodes(complex.element);
			expect(nodes.length).toEqual(4)
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('dolor sit');
			expect(nodes[2].data.trim()).toEqual('amet consectetur');
			expect(nodes[3].data.trim()).toEqual('adipiscing elit');
		});

		it('should ignore text nodes of script elements', () => {
			var withScript = fixtures.withScript();
			var nodes = scraper.getTextNodes(withScript.element);
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of noscript elements', () => {
			var withNoscript = fixtures.withNoscript();
			var nodes = scraper.getTextNodes(withNoscript.element);
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of style elements', () => {
			var withStyle = fixtures.withStyle();
			var nodes = scraper.getTextNodes(withStyle.element);
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});
	});

	describe('getTokens function', () => {

		it('should return the tokens of a web page in order', () => {
			var two = fixtures.twoTextNodes();
			var tokenizer = jasmine.createSpy();
			tokenizer.and.returnValues(
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
			var tokens = scraper.getTokens(two.element, tokenizer);
			expect(tokens).toEqual(two.tokens);
		});
	});
});