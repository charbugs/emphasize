
(function(emphasize) {

	'use strict';

	function Event() {
		
		return {

			listeners: [],

			register(fn) {
				this.listeners.push(fn)
			},

			dispatch(data) {
				for (var fn of this.listeners) {
					fn(data);
				}	
			},

			remove(fn) {
				for (var i=0; i < this.listeners.length; i++) {
					if (this.listeners[i] === fn) {
						this.listeners.splice(i, 1);
					}
				}
			},
			
			empty() {
				this.listeners = [];
			}
		}
	}

	// exports 
	emphasize.common.event = {
		Event
	}

})(emphasize);