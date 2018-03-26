var { Job } = require('../../src/common/job.js');

describe('---------- Job class ----------', () => {

	'use strict';

	var job;
	var createEvent = function() { 
		return { dispatch: jasmine.createSpy('dispatch') };
	};

	beforeEach(() => {
		job = Job({ createEvent });
	});

	describe('id property', () => {

		it('each instance has an unique id', () => {
			var a = (new Job({ createEvent })).jobId;
			var b = (new Job({ createEvent })).jobId;
			var c = (new Job({ createEvent })).jobId;

			expect(a).not.toEqual(b);
			expect(a).not.toEqual(c);
			expect(b).not.toEqual(c);
		});
	});

	describe('state properties', () => {

		it('READY=0, WORKING=1, DONE=2, ERROR=3', () => {
			expect(job.READY).toBe(0);
			expect(job.WORKING).toBe(1);
			expect(job.DONE).toBe(2);
			expect(job.ERROR).toBe(3);
		});
	});

	describe('state changing methods', () => {

		it('should change state properly', () => {
			expect(typeof job.state).toBe('undefined');

			job.stateReady();
			expect(job.state).toBe(0);

			job.stateWorking();
			expect(job.state).toBe(1);

			job.stateDone();
			expect(job.state).toBe(2);

			job.stateError();
			expect(job.state).toBe(3);
		});

		it('should fire onStateChange event with new state', () => {

			var getDispatchedState = () =>
				job.onStateChange.dispatch.calls.mostRecent().args[0];

			job.stateReady();
			expect(getDispatchedState()).toBe(0);

			job.stateWorking();
			expect(getDispatchedState()).toBe(1);

			job.stateError();
			expect(getDispatchedState()).toBe(3);

			job.stateDone();
			expect(getDispatchedState()).toBe(2);
		});
	});
});