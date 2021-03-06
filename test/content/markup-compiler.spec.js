var fixtures = require('../fixtures.js');
var { MarkupCompiler } = require('../../src/content/markup-compiler.js');

describe('---------- MarkupCompiler Class ----------', () => {

	'use strict';

	describe('compileMarkup function', () => {

		var compiler = new MarkupCompiler();
		var compileMarkup = compiler.compileMarkup.bind(compiler);

		describe('when only a single text node is involved', () => {

			var webPageTokens, node;
			beforeEach(() => {
				webPageTokens = fixtures.singleTextNode().tokens;
				node = webPageTokens[0].node;
			});

			it('should compile a single token', () => {
				var markup = [
					{ token: 2 }
				];

				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[ 
						{ begin: 12, end: 17, form: 'dolor', node: node }
					]
				);
			});

			it('should compile multiple tokens', () => {
				var markup = [
					{ token: 2 },
					{ token: 3}
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[ 
						{ begin: 12, end: 17, form: 'dolor', node: node },
						{ begin: 18, end: 21, form: 'sit', node: node }	
					]
				);
			});

			it('should handle shorthand notation of tokens', () => {
				var markup = [
					{ tokens: [2,3] }
				];

				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[ 
						{ begin: 12, end: 17, form: 'dolor', node: node },
						{ begin: 18, end: 21, form: 'sit', node: node }
					]
				);
			});

			it('should compile a token group', () => {
				var markup = [
					{ group: { first: 0, last: 2} }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 17, form: 'lorem ipsum dolor',	
							node: node }
					]
				);
			});

			it('should compile multiple token groups', () => {
				var markup = [
					{ group: { first: 0, last: 2} },
					{ group: { first: 3, last: 5} }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 17, form: 'lorem ipsum dolor', 
							node: node },
						{ begin: 18, end: 38, form: 'sit amet consectetur', 
							node: node },
					]
				);
			});

			it('should handle shorthand notation of groups', () => {
				var markup = [
					{ groups: [ { first: 0, last: 2}, { first: 3, last: 5} ] }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 17, form: 'lorem ipsum dolor', 
							node: node },
						{ begin: 18, end: 38, form: 'sit amet consectetur', 
							node: node },
					]
				);
			});

			it('should handle mixed notations (1)', () => {
				var markup = [
					{ token: 0},
					{ group: { first: 1, last: 3} },
					{ tokens: [4, 5] },
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 5, form: 'lorem', node: node },
						{ begin: 6, end: 21, form: 'ipsum dolor sit', 
							node: node },
						{ begin: 22, end: 26, form: 'amet', node: node },
						{ begin: 27, end: 38, form: 'consectetur', node: node}
					]
				);
			});

			it('should handle mixed notations (2)', () => {
				var markup = [
					{ group: { first: 0, last: 1} },
					{ groups: [ { first: 2, last: 3}, { first: 4, last: 5} ] },
					
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 11, form: 'lorem ipsum', node: node },
						{ begin: 12, end: 21, form: 'dolor sit', node: node },
						{ begin: 22, end: 38, form: 'amet consectetur',
							node: node }
					]
				);
			});

			it('should copy the annotation features of the markup items', 
			() => {
				var markup = [
					{ token: 0, mark:true, gloss: 'a pretty nice token' },
					{ tokens: [1], mark: true },
					{ group: { first: 2, last: 3 }, mark: true },
					{ groups: [ { first: 4, last: 5 } ], mark: true }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 5, form: 'lorem', node: node,
							mark: true, gloss: 'a pretty nice token' },
						{ begin: 6, end: 11, form: 'ipsum', node: node,
							mark: true },
						{ begin: 12, end: 21, form: 'dolor sit', node: node,
								mark: true },
						{ begin: 22, end: 38, form: 'amet consectetur', 
							node: node, mark: true }
					]
				);
			});

			it('should silently ignore non existing token indices ', () => {
				var markup = [
					{ tokens: [1, 6] }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 6, end: 11, form: 'ipsum', node: node }
					]
				);
			});

			it('should silently adjust token group when one index overshoots', 
			() => {
				var markup = [
					{ group: { first: 3, last: 42000 } }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 18, end: 38, form: 'sit amet consectetur',
							node: node }
					]
				);
			})
		});

		describe('when two text nodes are involved', () => {

			var webPageTokens, nodes;
			beforeEach(() => {
				var two = fixtures.twoTextNodes();
				webPageTokens = two.tokens;
				nodes = two.nodes;
			});

			it('should compile properly when each markup items refers to \
				only a separate text node', () => {

				var markup = [
					{ token: 0, mark:true, gloss: 'a pretty nice token' },
					{ tokens: [1,2], mark: true },
					{ group: { first: 3, last: 4 }, mark: true },
					{ groups: [ { first: 5, last: 6 } ], mark: true },
					{ token: 7, mark: false }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 0, end: 2, form: 'ut', node: nodes[0],
							mark: true, gloss: 'a pretty nice token' },
						{ begin: 3, end: 7, form: 'enim', node: nodes[0],
							mark: true },
						{ begin: 8, end: 10, form: 'ad', node: nodes[0],
							mark: true },
						{ begin: 11, end: 23, form: 'minim veniam', 
							node: nodes[0], mark: true },
						{ begin: 0, end: 12, form: 'quis nostrud', 
							node: nodes[1], mark: true },
						{ begin: 13, end: 25, form: 'exercitation',
							node: nodes[1], mark: false }
					]
				);
			});

			it('should compile properly with tokens shorthand notation', 
			() => {
				var markup = [
					{ tokens: [4, 5] }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 17, end: 23, form: 'veniam', node: nodes[0] },
						{ begin: 0, end: 4, form: 'quis', node: nodes[1] }
					]
				);
			});

			it('should compile properly when a token group involves \
				two consecutive text nodes', () => {

				var markup = [
					{ group: { first: 3, last: 6}, gloss: 'a nice gloss' }
				];
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 11, end: 23, form: 'minim veniam', 
							node: nodes[0], gloss: 'a nice gloss' },
						{ begin: 0, end: 12, form: 'quis nostrud',
							node: nodes[1], gloss: 'a nice gloss' }
					]
				);
			});
		});

		describe('when three text nodes are involed', () => {

			var webPageTokens, nodes;
			beforeEach(() => {
				var three = fixtures.threeTextNodes();
				webPageTokens = three.tokens;
				nodes = three.nodes;
			});

			it('should compile properly when a token group involves more then \
				two consecutive text nodes', () => {

				var markup = [
					{ group: {first: 1, last: 7 } }
				];
				
				var annotatedTokens = compileMarkup(markup, webPageTokens);
				
				expect(annotatedTokens).toEqual(
					[
						{ begin: 5, end: 15, form: 'aute irure', node: nodes[0] },
						{ begin: 0, end: 22, form: 'dolor in reprehenderit',
							node: nodes[1] },
						{ begin: 0, end: 12, form: 'in voluptate', node: nodes[2] }
					]
				);
			});
		});

		describe('order of annotated tokens', () => {

			var webPageTokens, nodes;
			beforeEach(() => {
				var three = fixtures.threeTextNodes();
				webPageTokens = three.tokens;
				nodes = three.nodes;
			});

			it('should not take care of the order of the resulting\
				annotated tokens', () => {
				
				var markup = [
					{ token: 8 },
					{ token: 0 },
					{ groups: [
						{ first: 4, last: 7 },
						{ first: 1, last: 3 }
					]} 
				];

				var annotatedTokens = compileMarkup(markup, webPageTokens);

				expect(annotatedTokens).toEqual(
					[
						{ begin: 13, end: 18, form: 'velit', node: nodes[2] },
						{ begin: 0, end: 4, form: 'duis', node: nodes[0] },
						{ begin: 6, end: 22, form: 'in reprehenderit', node: nodes[1] },
						{ begin: 0, end: 12, form: 'in voluptate', node: nodes[2] },
						{ begin: 5, end: 15, form: 'aute irure', node: nodes[0] },
						{ begin: 0, end: 5, form: 'dolor', node: nodes[1] }
					]
				);
			})
		});
	});
});