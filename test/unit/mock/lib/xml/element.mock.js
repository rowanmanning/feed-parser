'use strict';

const td = require('testdouble');

module.exports = function createMock() {
	const Element = td.constructor([
		'findElementsWithName',
		'findElementWithName',
		'getAttribute',
		'hasElementWithName'
	]);
	return Element;
};
