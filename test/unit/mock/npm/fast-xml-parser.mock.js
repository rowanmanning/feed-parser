'use strict';

const td = require('testdouble');

module.exports = function createMock() {
	const fastXmlParser = {
		XMLBuilder: td.constructor(),
		XMLParser: td.constructor()
	};

	fastXmlParser.XMLBuilder.prototype.build = td.func();
	td.when(fastXmlParser.XMLBuilder.prototype.build(), {ignoreExtraArgs: true}).thenReturn('mock-build-xml');

	fastXmlParser.XMLParser.prototype.parse = td.func();
	td.when(fastXmlParser.XMLParser.prototype.parse(), {ignoreExtraArgs: true}).thenReturn('mock-parsed-xml');

	return fastXmlParser;
};
