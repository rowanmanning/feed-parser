'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed/data-providers/rss', () => {
	let DataProvider;
	let InvalidFeedError;
	let MockDocument;
	let MockElement;
	let RssDataProvider;

	beforeEach(() => {
		MockDocument = require('../../../mock/lib/xml/document.mock')();
		MockElement = require('../../../mock/lib/xml/element.mock')();
		DataProvider = td.replace('../../../../../lib/feed/data-providers/base', td.constructor());
		InvalidFeedError = td.replace('../../../../../lib/feed/errors/invalid-feed', td.constructor());
		RssDataProvider = require('../../../../../lib/feed/data-providers/rss');
	});

	it('is a class constructor', () => {
		assert.isFunction(RssDataProvider);
		assert.isFunction(RssDataProvider.prototype.constructor);
	});

	describe('new RssDataProvider(document)', () => {
		let dataProvider;
		let mockChannelElement;
		let mockDocument;
		let mockRootElement;

		beforeEach(() => {

			// Mock an XML document
			mockDocument = new MockDocument();
			mockRootElement = new MockElement();
			mockRootElement.name = 'mock-root-name';
			mockChannelElement = new MockElement();
			td.when(mockDocument.findElementWithName('rss')).thenReturn(mockRootElement);
			td.when(mockRootElement.findElementWithName('channel')).thenReturn(mockChannelElement);

			dataProvider = new RssDataProvider(mockDocument);
		});

		it('is an instance of the DataProvider class', () => {
			assert.instanceOf(dataProvider, DataProvider);
		});

		it('finds a root-level rss element', () => {
			td.verify(mockDocument.findElementWithName('rss'), {times: 1});
		});

		it('finds a channel element in the root element', () => {
			td.verify(mockRootElement.findElementWithName('channel'), {times: 1});
		});

		describe('.root', () => {

			it('is set to the found rss element', () => {
				assert.strictEqual(dataProvider.root, mockRootElement);
			});

		});

		describe('.channel', () => {

			it('is set to the found channel element', () => {
				assert.strictEqual(dataProvider.channel, mockChannelElement);
			});

		});

		describe('.meta', () => {

			it('is an object', () => {
				assert.isObject(dataProvider.meta);
			});

			describe('.type', () => {

				it('is set to the name of the root element', () => {
					assert.strictEqual(dataProvider.meta.type, 'mock-root-name');
				});

			});

			describe('.version', () => {

				it('is set to `null`', () => {
					assert.isNull(dataProvider.meta.version);
				});

				describe('when the root element has a valid `version` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('2.0');
					});

					it('is set to that version', () => {
						assert.strictEqual(dataProvider.meta.version, '2.0');
					});

				});

				describe('when the root element has a `version` attribute matching 0.9X', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('0.91');
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(dataProvider.meta.version, '0.9');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "channel.nestcape.com" RDF spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://channel.netscape.com/rdf/simple/0.9/');
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(dataProvider.meta.version, '0.9');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "my.nestcape.com" RDF spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://my.netscape.com/rdf/simple/0.9/');
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(dataProvider.meta.version, '0.9');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "purl.org" RSS spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://purl.org/rss/1.0/');
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
			let mockLanguageElement;

			beforeEach(() => {
				mockLanguageElement = new MockElement();
				mockLanguageElement.normalizedTextContent = 'mock language text';
				td.when(mockChannelElement.findElementWithName('language')).thenReturn(mockLanguageElement);
			});

			it('is set to the text of the first language element found in the feed', () => {
				assert.strictEqual(dataProvider.language, 'mock language text');
			});

			describe('when a language element does not exist but an `xml:lang` attribute is set', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('language')).thenReturn(null);
					td.when(mockRootElement.getAttribute('xml:lang')).thenReturn('mock-xml:lang');
				});

				it('is set to the `xml:lang` attribute of the root element', () => {
					assert.strictEqual(dataProvider.language, 'mock-xml:lang');
				});

			});

			describe('when a language element does not exist and the `xml:lang` attribute is not set but a `lang` attribute is', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('language')).thenReturn(null);
					td.when(mockRootElement.getAttribute('lang')).thenReturn('mock-lang');
				});

				it('is set to the `lang` attribute of the root element', () => {
					assert.strictEqual(dataProvider.language, 'mock-lang');
				});

			});

			describe('when a language element does not exist and no language attributes are set', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('language')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(dataProvider.language);
				});

			});

		});

		describe('.title', () => {
			let mockTitleElement;

			beforeEach(() => {
				mockTitleElement = new MockElement();
				mockTitleElement.normalizedTextContent = 'mock title text';
				td.when(mockChannelElement.findElementWithName('title')).thenReturn(mockTitleElement);
			});

			it('is set to the text of the first title element found in the feed', () => {
				assert.strictEqual(dataProvider.title, 'mock title text');
			});

			describe('when a title element does not exist', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('title')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(dataProvider.title);
				});

			});

		});

		describe('when the root element name is "rdf"', () => {

			beforeEach(() => {

				// Mock an XML document
				td.when(mockDocument.findElementWithName('rss')).thenReturn(null);
				td.when(mockDocument.findElementWithName('rdf')).thenReturn(mockRootElement);

				dataProvider = new RssDataProvider(mockDocument);
			});

			it('is an instance of the DataProvider class', () => {
				assert.instanceOf(dataProvider, DataProvider);
			});

			it('finds a root-level rdf element', () => {
				td.verify(mockDocument.findElementWithName('rdf'), {times: 1});
			});

			describe('.root', () => {

				it('is set to the found rdf element', () => {
					assert.strictEqual(dataProvider.root, mockRootElement);
				});

			});

		});

		describe('if no root element is found', () => {
			let thrownError;

			beforeEach(() => {
				td.when(mockDocument.findElementWithName('rss')).thenReturn(null);
				try {
					dataProvider = new RssDataProvider(mockDocument);
				} catch (error) {
					thrownError = error;
				}
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError('The RSS feed does not have a root element'), {times: 1});
				assert.instanceOf(thrownError, InvalidFeedError);
			});

		});

		describe('if no channel element is found', () => {
			let thrownError;

			beforeEach(() => {
				td.when(mockRootElement.findElementWithName('channel')).thenReturn(null);
				try {
					dataProvider = new RssDataProvider(mockDocument);
				} catch (error) {
					thrownError = error;
				}
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError('The RSS feed does not have a channel element'), {times: 1});
				assert.instanceOf(thrownError, InvalidFeedError);
			});

		});

	});

});
