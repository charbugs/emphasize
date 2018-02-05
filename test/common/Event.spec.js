
describe('---------- Event class ----------', () => {

	'use strict';

	var event
	beforeEach(() => {
		event = new emphasize.pool.Event();
	});

	describe('register method', () => {

		it('should store a function to listeners', () => {
			var fn1 = jasmine.createSpy('fn1');
			var fn2 = jasmine.createSpy('fn2');
			
			event.register(fn1);
			event.register(fn2);
			
			expect(event._listeners[0]).toBe(fn1);
			expect(event._listeners[1]).toBe(fn2);
		});
	});

	describe('dispatch method', () => {

		it('should call all listeners and pass the data to them', () => {
			var fn1 = jasmine.createSpy('fn1');
			var fn2 = jasmine.createSpy('fn2');
			event._listeners = [fn1, fn2];
			
			event.dispatch('foo');

			expect(fn1).toHaveBeenCalledWith('foo');
			expect(fn2).toHaveBeenCalledWith('foo');
		});
	});

	describe('remove method', () => {

		it('should remove a listener', () => {
			var fn1 = jasmine.createSpy('fn1');
			var fn2 = jasmine.createSpy('fn2');
			event._listeners = [fn1, fn2];

			event.remove(fn2);

			expect(event._listeners).toEqual([fn1]);
		});
	});

	describe('empty method', () => {

		it('should remove all listners', () => {
			var fn1 = jasmine.createSpy('fn1');
			var fn2 = jasmine.createSpy('fn2');
			event._listeners = [fn1, fn2];

			event.empty();

			expect(event._listeners).toEqual([]);
		});


		
	});	
});