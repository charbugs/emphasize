
describe('#webscraper module', () => {

	var scraper = emphasize.webscraper;

	describe('#getUrl function', () => {

		it('should return the full url of the page', () => {
			expect(scraper.getUrl(document)).toEqual(document.location.href);
		});
	});

	describe('#getTextNodes', () => {

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
});