
describe('#webscraper module', () => {

	var scraper = emphasize.webscraper;

	describe('#getUrl function', () => {

		it('should return the full url of the page', () => {
			expect(scraper.getUrl(document)).toEqual(document.location.href);
		});
	});

	describe('#getTextNodes', () => {

		it('should return all non-empty text nodes within the passed \
				element (simple text)', () => {
			var simpleText = fixtures.get('simpleText');
			var nodes = scraper.getTextNodes(simpleText);
			expect(nodes.length).toEqual(1);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
		});

		it('should return all non-empty text nodes within the passed \
				element (complex text)', () => {
			var complexText = fixtures.get('complexText');
			var nodes = scraper.getTextNodes(complexText);
			expect(nodes.length).toEqual(4)
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('dolor sit');
			expect(nodes[2].data.trim()).toEqual('amet consectetur');
			expect(nodes[3].data.trim()).toEqual('adipiscing elit');
		});

		it('should ignore text nodes of script elements', () => {
			var withScript = fixtures.get('withScript');
			var nodes = scraper.getTextNodes(withScript);
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of noscript elements', () => {
			var withNoscript = fixtures.get('withNoscript');
			var nodes = scraper.getTextNodes(withNoscript);
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of style elements', () => {
			var withStyle = fixtures.get('withStyle');
			var nodes = scraper.getTextNodes(withStyle);
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});
	});
});