'use strict';

const td = require('testdouble');

exports.createMock = function createMock() {
	const Document = td.constructor([
		'findElementWithName',
		'findElementsWithName',
		'hasElementWithName'
	]);
	Document.fromString = td.func();
	return Document;
};
