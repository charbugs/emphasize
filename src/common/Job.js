
(function(pool) {

	'use strict';

	var instanceCounter = 0;

	function Job(onStateChange) {

		return {

			jobId: ++instanceCounter,
			onStateChange: onStateChange,
			READY: 0,
			WORKING: 1,
			DONE: 2,
			ERROR: 3,

			stateReady() {
				this.state = this.READY;
				this.onStateChange.dispatch(this.state);
			},
			stateWorking() {
				this.state = this.WORKING;
				this.onStateChange.dispatch(this.state);
			},
			stateDone() {
				this.state = this.DONE;
				this.onStateChange.dispatch(this.state);
			},
			stateError() {
				this.state = this.ERROR;
				this.onStateChange.dispatch(this.state);
			}
		}
	}

	pool.Job = Job;

})(emphasize.pool);