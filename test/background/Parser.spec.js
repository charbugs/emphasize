
describe('---------- request and response validation\
	(integration tests) ----------', () => {

	var MockError = fixtures.MockError;
	var parser = new emphasize.pool.Parser({
		protocol: 				emphasize.pool.protocol,
		createProtocolError: 	msg => new MockError(msg),
		Ajv: 					Ajv,
		sanitizeHtml: 			sanitizeHtml
	});

	describe('marker response validation', () => {

		var resp;
		var parse = function(resp) {
			resp = JSON.stringify(resp);
			parser.parseMarkupResponse(resp);
		};

		describe('protocol violation (misc)', () => {

			it('should throw if response is not an object', () => {
				resp = null;
				expect(() => parse(resp)).toThrowError(MockError);

				resp = true;
				expect(() => parse(resp)).toThrowError(MockError);

				resp = 1;
				expect(() => parse(resp)).toThrowError(MockError);

				resp = 'str';
				expect(() => parse(resp)).toThrowError(MockError);

				resp = [];
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if response.error is not an string', () => {
				resp = { error: null };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { error: true };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { error: 1 };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { error: [] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { error: {} };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if response.report is not an string', () => {
				resp = { report: null };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { report: true };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { report: 1 };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { report: [] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { report: {} };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if response.markup is not an array', () => {
				resp = { markup: null };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: true };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: 1 };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: 'str' };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: {} };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if response has additional props', () => {
				resp = { markup: [], report: 'str', foo: 'str' };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if items of response.markup are not objects', 
				() => {
				resp = { markup: [null] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [true] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [1] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: ['str'] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [[]] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup items are empty objects', 
				() => {
				resp = { markup: [{}] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].token is not a integer', () => {
				resp = { markup: [ { token: null } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: true } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1.3 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 'str' } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: [] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: {} } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].tokens is not an array', () => {
				resp = { markup: [ { tokens: null } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: true } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: 1 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: 1.3 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: 'str' } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: {} } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});	

			it('should throw if markup[x].tokens[x] is not an integer', 
				() => {
				resp = { markup: [ { tokens: [null] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: [true] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: ['str'] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: [[]] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { tokens: [{}] } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].group is not an object', 
				() => {
				resp = { markup: [ { group: null } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { group: true } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { group: 1 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { group: 'str' } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { group: [] } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].groups is not an array', () => {
				resp = { markup: [ { groups: null } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: true } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: 1 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: 1.3 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: 'str' } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: {} } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].groups[x] is not an object', 
				() => {
				resp = { markup: [ { groups: [null] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: [true] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: [1] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: ['str'] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { groups: [[]] } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if group.first is not an integers',
				() => {
				resp  = { markup: [ { group: { first: null, last: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { group: { first: true, last: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);					

				resp  = { markup: [ { group: { first: 'str', last: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { group: { first: [], last: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { group: { first: {}, last: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if group.last is not an integers',
				() => {
				resp  = { markup: [ { group: { last: null, first: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { group: { last: true, first: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);					

				resp  = { markup: [ { group: { last: 'str', first: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { group: { last: [], first: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { group: { last: {}, first: 1 } } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if groups[x].first is not an integers',
				() => {
				resp  = { markup: [ { groups: [ { first: null, last: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { groups: [ { first: true, last: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);					

				resp  = { markup: [ { groups: [ { first: 'str', last: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { groups: [ { first: [], last: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { groups: [ { first: {}, last: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if groups[x].last is not an integers',
				() => {
				resp  = { markup: [ { groups: [ { last: null, first: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { groups: [ { last: true, first: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);					

				resp  = { markup: [ { groups: [ { last: 'str', first: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { groups: [ { last: [], first: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { markup: [ { groups: [ { last: {}, first: 1 } ] } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if properties token, tokens, group or groups\
				are not exclusive each in markup[x]', () => {

				resp  = { markup: [ { token: 1, tokens: [1] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp  = { 
					markup: [ { token: 1, group: { first: 1, last: 2} } ] 
				};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x] has none of the properties\
				token, tokens, group, groups', () => {
				resp = { markup: { mark: true } };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].mark is not an boolean', () => {
				resp = { markup: [ { token: 1, mark: null } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, mark: 1 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, mark: 'str' } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, mark: [] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, mark: {} } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if markup[x].gloss is not a string', () => {
				resp = { markup: [ { token: 1, gloss: null } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, gloss: true } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, gloss: 1 } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, gloss: [] } ] };
				expect(() => parse(resp)).toThrowError(MockError);

				resp = { markup: [ { token: 1, gloss: {} } ] };
				expect(() => parse(resp)).toThrowError(MockError);
			});
		});

		describe('protocol violation (token numbers issues)', () => {

			it('should throw if token numbers in markup are not unique (1)', 
				() => {
				
				resp = { markup: [
					{token: 1}, {token: 2}, {token:1}
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if token numbers in markup are not unique (2)', 
				() => {
				
				resp = { markup: [
					{tokens: [1,2,1] }
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if token numbers in markup are not unique (3)', 
				() => {

				resp = { markup: [
					{tokens: [3,2,1] }, { token: 2}
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if token numbers in markup are not unique (4)', 
				() => {
				
				resp = { markup: [
					{group: {first:1, last:8} }, 
					{token: 2}
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if token numbers in markup are not unique (5)', 
				() => {
				
				resp = { markup: [
					{group: {first:8, last: 17} },
					{group: {first:1, last:8} }
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if token numbers in markup are not unique (6)', 
				() => {
				
				resp = { markup: [
					{groups: [
						{first:1, last:8},
						{first:8, last:17}
					] }, 
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if token numbers in markup are not unique (7)', 
				() => {
				
				resp = { markup: [
					{groups: [ {first:1, last:8} ] },
					{token: [8,9,10]} 
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if first token number of a group is greater \
				then the last (1)', () => {

				resp = { markup: [
					{ group: { first: 8, last: 1 } },	
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});

			it('should throw if first token number of a group is greater \
				then the last (2)', () => {

				resp = { markup: [
					{ groups: [ {first: 1, last: 8 }, { first: 15, last: 11 } ] }
				]};
				expect(() => parse(resp)).toThrowError(MockError);
			});
		});

		describe('protocol fulfilment (misc)', () => {

			it('should pass if response is well-formed (1)', () => {
				resp = {};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (2)', () => {
				resp = { report: 'str' };
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (3)', () => {					
				resp = { markup: [] };
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (4)', () => {
				resp = { report: 'str', markup: [] };
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (5)', () => {
				resp = { markup: [
					{ token: 1 }
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (6)', () => {
				resp = { markup: [
					{ tokens: [ 1, 3, 4, 5 ] }
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (7)', () => {
				resp = { markup: [
					{ group: { first: 1, last: 5 } }
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});
			
			it('should pass if response is well-formed (8)', () => {
				resp = { markup: [
					{ groups: [{first: 1, last: 5}, {first: 34, last: 36}]}
				]};
				parse(resp);
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if response is well-formed (9)', () => {
				resp = { markup: [
					{ token: 1, mark: false, gloss: 'str' }
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});
				
			it('should pass if response is well-formed (10)', () => {
				resp = { report: 'str', markup: [
					{ token: 1, mark: false, gloss: 'str' },
					{ token: 2, mark: false, gloss: 'str' }
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});
		});

		describe('protocol fulfilment (token numbers unique)', () => {

			it('should pass if token numbers are unique (1)', () => {
				resp = { markup: [
					{ token: 3 },
					{ token: 2 },
					{ token: 1 }
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});

			it('should pass if token numbers are unique (2)', () => {
				resp = { markup: [
					{ tokens: [3,2,1] },
					{ tokens: [4,5,6] },
					{ group: {first:7, last:12} },
					{ groups: [ {first:13, last:20}, {first:21, last:25 } ] },
				]};
				expect(() => parse(resp)).not.toThrowError(MockError);
			});
		});
	});
});