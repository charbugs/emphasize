
'use strict';

const fixtures = {};

fixtures.MockError = function (message) {
	this.message = message;
	this.stack = (new Error()).stack;
}
fixtures.MockError.prototype = Object.create(Error.prototype);
fixtures.MockError.prototype.name = 'MockError';