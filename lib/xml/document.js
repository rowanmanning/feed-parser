'use strict';

const Element = require('./element');
const {XMLParser} = require('fast-xml-parser');

// Create and user a single parser for each document
const parser = new XMLParser({
	attributeNamePrefix: '',
	ignoreAttributes: false,
	ignoreDeclaration: true,
	parseTagValue: true,
	preserveOrder: true,
	trimValues: false
});

/**
 * Class representing an XML document.
 */
module.exports = class Document extends Element {

	/**
	 * Class constructor.
	 *
	 * @public
	 * @param {Array<object>} rawFxpDocument
	 *     The raw document representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 */
	constructor(rawFxpDocument) {
		super({
			root: rawFxpDocument
		});
	}

	/**
	 * Create a Document from an XML string.
	 *
	 * @public
	 * @param {string} xmlString
	 *     A string of XML.
	 * @returns {Document}
	 *     Returns a document representation of the XML string.
	 */
	static fromString(xmlString) {
		return new this(parser.parse(xmlString));
	}

};
