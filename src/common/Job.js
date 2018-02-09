
(function(pool) {

	'use strict';

	var instanceCounter = 0;

	function Job() {

		return {

			jobId: ++instanceCounter,
			READY: 0,
			WORKING: 1,
			DONE: 2,
			ERROR: 3,
			
			stateReady() {
				this.state = this.READY;	
			},
			stateWorking() {
				this.state = this.WORKING;	
			},
			stateDone() {
				this.state = this.DONE;	
			},
			stateError() {
				this.state = this.ERROR;	
			}
		}
	}

	pool.Job = Job;

})(emphasize.pool);