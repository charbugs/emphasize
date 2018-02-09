
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
					callFake(chromeApiFn),

				create: jasmine.createSpy('create').and.
					callFake(chromeApiFn),

				executeScript: jasmine.createSpy('executeScript').and.
					callFake(chromeApiFn),

				insertCSS: jasmine.createSpy('insertCSS').and.
					callFake(chromeApiFn),

				onUpdated: {}
			},
			storage: {
				local: {
					get: jasmine.createSpy('get').and.
						callFake(chromeApiFn),

					set: jasmine.createSpy('set').and.
						callFake(chromeApiFn)
				}
			},

			runtime: {
				lastError: {}
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

	describe('prome.tabs.create function', () => {

		it('should call chrome.tabs.create properly', () => {
			prome.tabs.create('PROPS');
			var args = chromeMock.tabs.create.calls.argsFor(0);
			expect(args[0]).toBe('PROPS');
			expect(typeof args[1]).toBe('function');
				
		});

		it('should return the result of chrome.tabs.create as promise ', 
		() => {
			return prome.tabs.create().then(res => {
				expect(res).toBe('VAL');
			});
		});
	});

	describe('prome.tabs.executeScript function', () => {

		it('should call chrome.tabs.executeScript properly', () => {
			prome.tabs.executeScript('TABID', 'DETAILS');
			var args = chromeMock.tabs.executeScript.calls.argsFor(0);
			expect(args[0]).toBe('TABID');
			expect(args[1]).toBe('DETAILS');
			expect(typeof args[2]).toBe('function');
				
		});

		it('should return the result of chrome.tabs.executeScript as promise ', 
		() => {
			return prome.tabs.executeScript().then(res => {
				expect(res).toBe('VAL');
			});
		});
	});

	describe('prome.tabs.insertCSS function', () => {

		it('should call chrome.tabs.insertCSS properly', () => {
			prome.tabs.insertCSS('TABID', 'DETAILS');
			var args = chromeMock.tabs.insertCSS.calls.argsFor(0);
			expect(args[0]).toBe('TABID');
			expect(args[1]).toBe('DETAILS');
			expect(typeof args[2]).toBe('function');
				
		});

		it('should return the result of chrome.tabs.insertCSS as promise ', 
		() => {
			return prome.tabs.insertCSS().then(res => {
				expect(res).toBe();
			});
		});
	});

	describe('prome.tabs.onUpdated propertie', () => {

		it('should return chrome.tabs.onUpdated', () => {
			expect(prome.tabs.onUpdated).toBe(chromeMock.tabs.onUpdated);
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

	describe('prome.runtime.lastError propertie', () => {

		it('should return chrome.runtime.lastError', () => {
			expect(prome.runtime.lastError).toBe(chromeMock.runtime.lastError);
		});
	});

});