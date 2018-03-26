var { Token } = require('../../src/content/token.js');
var { Tokenizer } = require('../../src/content/tokenizer.js');
var { WebScraper } = require('../../src/content/web-scraper.js');

describe('---------- WebScraper class (integration test) ----------', () => {

	'use strict';

	var webScraper;

	var createToken = (form, node, begin, end) => 
		new Token({form, node,  begin, end});
	
	beforeEach(() => {

		webScraper = new WebScraper({
			document: document,
			tokenizer: new Tokenizer(),
			NodeFilter: NodeFilter,
			createToken: createToken
		});
	});

	describe('getUrl function', () => {

		it('should return the full url of the page', () => {
			expect(webScraper.getUrl()).toEqual(document.location.href);
		});
	});

	describe('getTextNodes function', () => {

		it('should return all non-empty text node of the root element', () => {
			var elem = document.getElementById('basic-node-extraction');
			webScraper._rootElement = elem;
			
			var nodes = webScraper.getTextNodes();

			expect(nodes.length).toEqual(5);
			expect(nodes[0].data.trim()).toEqual('str1');
			expect(nodes[1].data.trim()).toEqual('str2');
			expect(nodes[2].data.trim()).toEqual('str3');
			expect(nodes[3].data.trim()).toEqual('str4');
			expect(nodes[4].data.trim()).toEqual('str5');
		});

		it('should ignore text nodes within blacklist elements', () => {
			var elem = document.getElementById('blacklist-elements');
			webScraper._rootElement = elem;

			var nodes = webScraper.getTextNodes();

			expect(nodes.length).toEqual(4);
			expect(nodes[0].data.trim()).toEqual('str1');
			expect(nodes[1].data.trim()).toEqual('str3');
			expect(nodes[2].data.trim()).toEqual('str4');
			expect(nodes[3].data.trim()).toEqual('str9');

		});

		it('should ignore text nodes within hidden elements', () => {
			var elem = document.getElementById('hidden-elements');
			webScraper._rootElement = elem;

			var nodes = webScraper.getTextNodes();
			expect(nodes.length).toEqual(2);
			expect(nodes[0].data.trim()).toEqual('str3');
			expect(nodes[1].data.trim()).toEqual('str5');
		});
	});

	describe('getTokens function', () => {

		it('should return the tokens of a web page in order', () => {
			var elem = document.getElementById('nodes-to-tokenize');
			var textNode1 = elem.children[0].childNodes[0];
			var textNode2 = elem.children[1].childNodes[0];
			webScraper._rootElement = elem;

			var tokens = webScraper.getTokens();
			
			expect(tokens.length).toEqual(6);
			
			expect(tokens[0].form).toEqual('lorem');
			expect(tokens[0].begin).toEqual(2);
			expect(tokens[0].end).toEqual(7);
			expect(tokens[0].node).toEqual(textNode1);

			expect(tokens[5].form).toEqual('consectetur');
			expect(tokens[5].begin).toEqual(9);
			expect(tokens[5].end).toEqual(20);
			expect(tokens[5].node).toEqual(textNode2);

		});
	});
});