
describe('---------- Job class ----------', () => {

	'use strict';

	var Job = emphasize.pool.Job;

	describe('id property', () => {

		it('each instance has an unique id', () => {
			expect((new Job).id).toEqual(1);
			expect((new Job).id).toEqual(2);
			expect((new Job).id).toEqual(3);
		});
	});

	describe('state properties', () => {

		it('READY=0, WORKING=1, DONE=2, ERROR=3', () => {
			var job = new Job();
			expect(job.READY).toBe(0);
			expect(job.WORKING).toBe(1);
			expect(job.DONE).toBe(2);
			expect(job.ERROR).toBe(3);
		});
	});

	describe('state changing methods', () => {

		it('should change state properly', () => {
			var job = new Job();
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
	});
});