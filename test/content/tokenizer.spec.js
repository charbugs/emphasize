var { Tokenizer } = require('../../src/content/tokenizer.js');

describe('---------- Tokenizer class ----------', () => {

	'use strict';
	
	describe('tokenize method', () => {

		var tokens;
		beforeEach(() => {
			var sent = "Lorem ipsum dolor lorem";
			var tokenizer = new Tokenizer();
			tokens = tokenizer.tokenize(sent);
		});

		it('should return an array', () => {
			expect(tokens).toEqual(jasmine.any(Array));
		});

		it('should return the right number of tokens', () => {
			expect(tokens.length).toBe(4);
		});

		describe('each item of the returning array', () => {

			it('should be an on object', () => {
				tokens.forEach(item => {
					expect(item).toEqual(jasmine.any(Object));
				});
			});

			it('should have the right #begin, #end, #form value', () => {
				expect(tokens[0]).toEqual(
					jasmine.objectContaining({ begin:0, end:5, form:'Lorem'}));
				expect(tokens[1]).toEqual(
					jasmine.objectContaining({ begin:6, end:11, form:'ipsum'}));
				expect(tokens[3]).toEqual(
					jasmine.objectContaining({ begin:18, end:23, form:'lorem'}));
			});
		});
	});
});