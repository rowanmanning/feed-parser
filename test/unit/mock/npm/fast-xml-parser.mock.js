'use strict';

const td = require('testdouble');

module.exports = function createMock() {
	const fastXmlParser = {
		// @ts-ignore
		XMLParser: td.constructor()
	};

	fastXmlParser.XMLParser.prototype.parse = td.func();
	td.when(fastXmlParser.XMLParser.prototype.parse(), {ignoreExtraArgs: true}).thenReturn('mock-parsed-xml');

	return fastXmlParser;
};
