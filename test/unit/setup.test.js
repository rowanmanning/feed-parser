'use strict';

const td = require('testdouble');

td.config({
	ignoreWarnings: true
});

afterEach(() => {
	td.reset();
});
