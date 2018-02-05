
(function(pool) {

	'use strict';

	var instanceCounter = 0;

	class Job {

		constructor() {
			this.id = ++instanceCounter;
			this.READY = 0;
			this.WORKING = 1;
			this.DONE = 2;
			this.ERROR = 3;
		}
		stateReady() {
			this.state = this.READY;	
		}
		stateWorking() {
			this.state = this.WORKING;	
		}
		stateDone() {
			this.state = this.DONE;	
		}
		stateError() {
			this.state = this.ERROR;	
		}
	}

	pool.Job = Job;

})(emphasize.pool);