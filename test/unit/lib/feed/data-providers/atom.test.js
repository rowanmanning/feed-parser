'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed/data-providers/atom', () => {
	let AtomDataProvider;
	let DataProvider;
	let InvalidFeedError;
	let MockDocument;
	let MockElement;

	beforeEach(() => {
		MockDocument = require('../../../mock/lib/xml/document.mock')();
		MockElement = require('../../../mock/lib/xml/element.mock')();
		DataProvider = td.replace('../../../../../lib/feed/data-providers/base', td.constructor());
		InvalidFeedError = td.replace('../../../../../lib/feed/errors/invalid-feed', td.constructor());
		AtomDataProvider = require('../../../../../lib/feed/data-providers/atom');
	});

	it('is a class constructor', () => {
		assert.isFunction(AtomDataProvider);
		assert.isFunction(AtomDataProvider.prototype.constructor);
	});

	describe('new AtomDataProvider(document)', () => {
		let dataProvider;
		let mockDocument;
		let mockRootElement;

		beforeEach(() => {

			// Mock an XML document
			mockDocument = new MockDocument();
			mockRootElement = new MockElement();
			td.when(mockDocument.findElementWithName('feed')).thenReturn(mockRootElement);

			dataProvider = new AtomDataProvider(mockDocument);
		});

		it('is an instance of the DataProvider class', () => {
			assert.instanceOf(dataProvider, DataProvider);
		});

		it('finds a root-level feed element', () => {
			td.verify(mockDocument.findElementWithName('feed'), {times: 1});
		});

		describe('.root', () => {

			it('is set to the found feed element', () => {
				assert.strictEqual(dataProvider.root, mockRootElement);
			});

		});

		describe('.meta', () => {

			it('is an object', () => {
				assert.isObject(dataProvider.meta);
			});

			describe('.type', () => {

				it('is set to "atom"', () => {
					assert.strictEqual(dataProvider.meta.type, 'atom');
				});

			});

			describe('.version', () => {

				it('is set to `null`', () => {
					assert.isNull(dataProvider.meta.version);
				});

				describe('when the root element has a valid `version` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('1.0');
					});

					it('is set to that version', () => {
						assert.strictEqual(dataProvider.meta.version, '1.0');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "purl.org" Atom spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://purl.org/atom/ns#');
					});

					it('is set to "0.3"', () => {
						assert.strictEqual(dataProvider.meta.version, '0.3');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "w3.org" Atom spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://www.w3.org/2005/Atom');
					});

					it('is set to "1.0"', () => {
						assert.strictEqual(dataProvider.meta.version, '1.0');
					});

				});

				describe('when the root element has an invalid `version` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('invalid');
					});

					it('is set to `null`', () => {
						assert.isNull(dataProvider.meta.version);
					});

				});

				describe('when the root element has an unrecognised `xmlns` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('invalid');
					});

					it('is set to `null`', () => {
						assert.isNull(dataProvider.meta.version);
					});

				});

			});

		});

		describe('.language', () => {

			beforeEach(() => {
				td.when(mockRootElement.getAttribute('xml:lang')).thenReturn('mock-xml:lang');
			});

			it('is set to the `xml:lang` attribute of the root element', () => {
				assert.strictEqual(dataProvider.language, 'mock-xml:lang');
			});

			describe('when a the `xml:lang` attribute is not set but a `lang` attribute is', () => {

				beforeEach(() => {
					td.when(mockRootElement.getAttribute('xml:lang')).thenReturn(null);
					td.when(mockRootElement.getAttribute('lang')).thenReturn('mock-lang');
				});

				it('is set to the `lang` attribute of the root element', () => {
					assert.strictEqual(dataProvider.language, 'mock-lang');
				});

			});

			describe('when neither attribute is set', () => {

				beforeEach(() => {
					td.when(mockRootElement.getAttribute('xml:lang')).thenReturn(null);
					td.when(mockRootElement.getAttribute('lang')).thenReturn(null);
				});

				it('is set to the `null`', () => {
					assert.strictEqual(dataProvider.language, null);
				});

			});

		});

		describe('.title', () => {
			let mockTitleElement;

			beforeEach(() => {
				mockTitleElement = new MockElement();
				mockTitleElement.normalizedTextContent = 'mock title text';
				td.when(mockRootElement.findElementWithName('title')).thenReturn(mockTitleElement);
			});

			it('is set to the text of the first title element found in the feed', () => {
				assert.strictEqual(dataProvider.title, 'mock title text');
			});

			describe('when a title element does not exist', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('title')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(dataProvider.title);
				});

			});

		});

		describe('if no root element is found', () => {
			let thrownError;

			beforeEach(() => {
				td.when(mockDocument.findElementWithName('feed')).thenReturn(null);
				try {
					dataProvider = new AtomDataProvider(mockDocument);
				} catch (error) {
					thrownError = error;
				}
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError('The Atom feed does not have a root element'), {times: 1});
				assert.instanceOf(thrownError, InvalidFeedError);
			});

		});

	});

});
