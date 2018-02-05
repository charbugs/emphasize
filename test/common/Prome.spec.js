
describe('---------- Prome API ----------', () => {

	var prome, chromeMock;
	beforeEach(() => {
	
		var chromeApiFn = function(...args) {
			args.pop()('VAL'); // expect the last arg is a callback
		};

		chromeMock = {
			tabs: {
				sendMessage: jasmine.createSpy('sendMessage').and.
					callFake(chromeApiFn),

				query: jasmine.createSpy('query').and.
					callFake(chromeApiFn)
			},
			storage: {
				local: {
					get: jasmine.createSpy('get').and.
						callFake(chromeApiFn),

					set: jasmine.createSpy('set').and.
						callFake(chromeApiFn)
				}
			}
		};

		prome = emphasize.pool.Prome(chromeMock);
	});

	describe('prome.tabs.sendMessage function', () => {

		it('should call chrome.tabs.sendMessage properly', () => {
			prome.tabs.sendMessage('ID', 'MSG', 'OPTS');
			var args = chromeMock.tabs.sendMessage.calls.argsFor(0);
			expect(args[0]).toBe('ID');
			expect(args[1]).toBe('MSG');
			expect(args[2]).toBe('OPTS');
			expect(typeof args[3]).toBe('function');
				
		});

		it('should return the result of chrome.tabs.sendMessage as promise ', 
		() => {
			return prome.tabs.sendMessage().then(res => {
				expect(res).toBe('VAL');
			});
		});
	});

	describe('prome.tabs.query function', () => {

		it('should call chrome.tabs.query properly', () => {
			prome.tabs.query('INFO');
			var args = chromeMock.tabs.query.calls.argsFor(0);
			expect(args[0]).toBe('INFO');
			expect(typeof args[1]).toBe('function');
				
		});

		it('should return the result of chrome.tabs.query as promise ', 
		() => {
			return prome.tabs.query().then(res => {
				expect(res).toBe('VAL');
			});
		});
	});

	describe('prome.storage.local.get function', () => {

		it('should call chrome.storage.local.get properly', () => {
			prome.storage.local.get('KEY');
			var args = chromeMock.storage.local.get.calls.argsFor(0);
			expect(args[0]).toBe('KEY');
			expect(typeof args[1]).toBe('function');
				
		});

		it('should return the result of chrome.storage.local.get as promise ', 
		() => {
			return prome.storage.local.get().then(res => {
				expect(res).toBe('VAL');
			});
		});
	});

	describe('prome.storage.local.set function', () => {

		it('should call chrome.storage.local.set properly', () => {
			prome.storage.local.set('ITEMS');
			var args = chromeMock.storage.local.set.calls.argsFor(0);
			expect(args[0]).toBe('ITEMS');
			expect(typeof args[1]).toBe('function');
				
		});

		it('should return the result of chrome.storage.local.set as promise ', 
		() => {
			return prome.storage.local.set().then(res => {
				expect(res).toBe();
			});
		});
	});
});