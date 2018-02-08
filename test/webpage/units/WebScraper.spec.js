
describe('---------- WebScraper class (integration test) ----------', () => {

	'use strict';

	var webScraper;
	beforeEach(() => {
		webScraper = new emphasize.pool.WebScraper({
			document: document,
			tokenizer: new emphasize.pool.Tokenizer(),
			NodeFilter: NodeFilter,
			createToken: (form, node, begin, end) => {
				return new emphasize.pool.Token({
					form: form,
					node: node, 
					begin: begin,
					end: end
				});
			}
		});
	});

	describe('getUrl function', () => {

		it('should return the full url of the page', () => {
			expect(webScraper.getUrl()).toEqual(document.location.href);
		});
	});

	describe('getTextNodes function', () => {

		it('should return all non-empty text nodes of an element', () => {
			webScraper._rootElement = fixtures.complexTextNodes().element;

			var nodes = webScraper.getTextNodes();

			expect(nodes.length).toEqual(4)
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('dolor sit');
			expect(nodes[2].data.trim()).toEqual('amet consectetur');
			expect(nodes[3].data.trim()).toEqual('adipiscing elit');
		});

		it('should ignore text nodes of script elements', () => {
			webScraper._rootElement = fixtures.withScript().element;
			
			var nodes = webScraper.getTextNodes();
			
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of noscript elements', () => {
			webScraper._rootElement = fixtures.withNoscript().element;

			var nodes = webScraper.getTextNodes();
			
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});

		it('should ignore text nodes of style elements', () => {
			webScraper._rootElement = fixtures.withStyle().element;

			var nodes = webScraper.getTextNodes();
			
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('lorem ipsum');
			expect(nodes[1].data.trim()).toEqual('amet consectetur');
		});
	});

	describe('getTokens function', () => {

		it('should return the tokens of a web page in order', () => {
			var twoTextNodes = fixtures.twoTextNodes();

			webScraper._rootElement = twoTextNodes.element;

			var tokens = webScraper.getTokens();

			// expect fails if Objects to test have a custom type
			// as here Token
			tokens = tokens.map(token => Object.assign({}, token));
			expect(tokens).toEqual(twoTextNodes.tokens);
		});
	});
});