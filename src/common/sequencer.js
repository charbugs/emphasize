
exports.sequenceSyncMethodExecution = function(target, sequence) {

	var index = 0;
	var handler = {

		get: function(target, prop) {
	
			if (sequence.indexOf(prop) === -1) {
				return target[prop];
			} 
			
			if (prop !== sequence[index]) {
				throw new Error('Caller violates execution order.');
			}
			
			return function() {
			
				var ret =  target[prop].apply(target, arguments);
				index++;
				return ret;
			}
		}
	}
	return new Proxy(target, handler);
};

/**
 * experimental
 * not in use
 * not tested
 */
exports.sequenceAsyncMethodExecution = function (target, sequence) {

	var index = 0;
	var handler = {

		get: function(target, prop) {
	
			if (sequence.indexOf(prop) === -1) {
				return target[prop];
			} 
			
			if (prop !== sequence[index]) {
				throw new Error('Caller violates execution order.');
			}
			
			return async function() {
			
				var ret = await target[prop].apply(target, arguments);
				index++;
				return ret;
			}
		}
	}
	return new Proxy(target, handler);
};
	
	