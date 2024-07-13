'use strict';

const td = require('testdouble');

exports.createMock = function createMock() {
	return {
		decode: td.func()
	};
};
