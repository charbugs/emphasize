'use strict';

describe('---------- tokenizers module ----------', () => {
	
	var em = emphasize;

	describe('Token class', () => {

		it('should be instantiatable', () => {
			expect(typeof new em.tokenizers.Token()).toEqual('object');
		});
	});

	describe('whiteSpace function', () => {

		var sent;
		
		beforeEach(() => {
			sent = "Lorem ipsum dolor lorem";
		});

		it('should return an array', () => {
			expect(em.tokenizers.whiteSpace(sent)).toEqual(jasmine.any(Array));
		});

		it('should return the right number of tokens', () => {
			expect(em.tokenizers.whiteSpace(sent).length).toBe(4);
		});

		describe('each item of the returning array', () => {

			it('should be an on object', () => {
				em.tokenizers.whiteSpace(sent).forEach(item => {
					expect(item).toEqual(jasmine.any(Object));
				});
			});

			it('should have the right #begin, #end, #form value', () => {
				var tokens = em.tokenizers.whiteSpace(sent);

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