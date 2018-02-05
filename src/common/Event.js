
(function(pool) {

	'use strict';

	class Event {
		
		constructor() {
			this._listeners = [];
		}

		register(fn) {
			this._listeners.push(fn)
		}

		dispatch(data) {
			for (var fn of this._listeners) {
				fn(data);
			}	
		}

		remove(fn) {
			for (var i=0; i < this._listeners.length; i++) {
				if (this._listeners[i] === fn) {
					this._listeners.splice(i, 1);
				}
			}
		}
		
		empty() {
			this._listeners = [];
		}
	}

	// exports 
	pool.Event = Event;

})(emphasize.pool);