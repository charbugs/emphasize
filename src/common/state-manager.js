
function StateManager({ states, onStateChange }) {

	var self = {};
	self.onStateChange = onStateChange;
	
	states.forEach((state, idx) => self[state] = idx );

	self.changeState = function(state, fire = true) {
		this.state = state;
		if (fire) {
			this.onStateChange.dispatch(state);
		}
	}

	return self;
}

module.exports = { StateManager };