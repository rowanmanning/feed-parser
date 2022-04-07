'use strict';

const td = require('testdouble');

module.exports = function createMock() {
	const Document = td.constructor([
		'findElementWithName',
		'findElementsWithName',
		'hasElementWithName'
	]);
	Document.fromString = td.func();
	return Document;
};
