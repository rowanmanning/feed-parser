'use strict';

const td = require('testdouble');

module.exports = function createMock() {
	return {
		decode: td.func()
	};
};
