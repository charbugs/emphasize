
describe('#tokenize module', () => {
	it('should be an object', () => {
		expect(emphasizeWebPage.tokenize).toEqual(jasmine.any(Object));
	});
});

describe('#whiteSpace function', () => {

	var sent, whiteSpace;

	beforeEach(() => {
		whiteSpace = emphasizeWebPage.tokenize.whiteSpace;
		sent = "Lorem ipsum dolor lorem";
	});

	it('should return an array', () => {
		expect(whiteSpace(sent)).toEqual(jasmine.any(Array));
	});

	it('should return the right number of tokens', () => {
		expect(whiteSpace(sent).length).toBe(4);
	});

	describe('each item of the returning array', () => {

		it('should be an on object', () => {
			whiteSpace(sent).forEach(item => {
				expect(item).toEqual(jasmine.any(Object));
			});
		});

		it('should have the right #begin, #end, #form value', () => {
			var tokens = whiteSpace(sent);
			
			expect(tokens[0].begin).toBe(0);
			expect(tokens[0].end).toBe(5);
			expect(tokens[0].form).toBe('Lorem');

			expect(tokens[1].begin).toBe(6);
			expect(tokens[1].end).toBe(11);
			expect(tokens[1].form).toBe('ipsum');

			expect(tokens[3].begin).toBe(18);
			expect(tokens[3].end).toBe(23);
			expect(tokens[3].form).toBe('lorem');
		});
	});
});