'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/xml', () => {
	let xml;

	beforeEach(() => {
		td.replace('../../../../lib/xml/document', 'mock-document');
		td.replace('../../../../lib/xml/element', 'mock-element');
		xml = require('../../../../lib/xml');
	});

	it('is an object', () => {
		assert.isObject(xml);
	});

	describe('.Document', () => {

		it('aliases lib/xml/document', () => {
			assert.strictEqual(xml.Document, 'mock-document');
		});

	});

	describe('.Element', () => {

		it('aliases lib/xml/element', () => {
			assert.strictEqual(xml.Element, 'mock-element');
		});

	});

});
