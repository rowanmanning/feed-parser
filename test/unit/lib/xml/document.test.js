'use strict';

const { afterEach, beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const td = require('testdouble');

td.config({ ignoreWarnings: true });

describe('lib/xml/document', () => {
	let Element;
	let fastXmlParser;
	let Document;

	beforeEach(() => {
		Element = td.replace('../../../../lib/xml/element', { Element: td.constructor() }).Element;
		fastXmlParser = td.replace(
			'fast-xml-parser',
			require('../../mock/npm/fast-xml-parser.mock').createMock()
		);
		Document = require('../../../../lib/xml/document').Document;
	});

	afterEach(() => td.reset());

	it('creates a new XML Parser', () => {
		td.verify(
			new fastXmlParser.XMLParser({
				attributeNamePrefix: '',
				ignoreAttributes: false,
				ignoreDeclaration: true,
				parseTagValue: true,
				preserveOrder: true,
				trimValues: false
			}),
			{ times: 1 }
		);
	});

	it('is a class constructor', () => {
		assert.strictEqual(typeof Document, 'function');
		assert.strictEqual(typeof Document.prototype.constructor, 'function');
	});

	describe('new Document(rawFxpDocument)', () => {
		let document;

		beforeEach(() => {
			document = new Document('mock-raw-fxp-document');
		});

		it('is an instance of the Element class', () => {
			assert.ok(document instanceof Element);
		});

		it('calls the super constructor with a faked root element that contains the document children', () => {
			td.verify(
				Element.prototype.constructor({
					root: 'mock-raw-fxp-document'
				}),
				{ times: 1 }
			);
		});
	});

	describe('Document.fromString(xmlString)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = Document.fromString('mock-xml');
		});

		it('parses the XML string', () => {
			td.verify(fastXmlParser.XMLParser.prototype.parse('mock-xml'), { times: 1 });
		});

		it('creates a new Document instance with the parsed XML', () => {
			td.verify(
				Element.prototype.constructor({
					root: 'mock-parsed-xml'
				}),
				{ times: 1 }
			);
		});

		it('returns the created document', () => {
			assert.ok(returnValue instanceof Document);
		});
	});
});
