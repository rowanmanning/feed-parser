'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed/rss', () => {
	let Feed;
	let InvalidFeedError;
	let MockDocument;
	let MockElement;
	let RssFeed;

	beforeEach(() => {
		MockDocument = require('../../mock/lib/xml/document.mock')();
		MockElement = require('../../mock/lib/xml/element.mock')();
		Feed = td.replace('../../../../lib/feed/base', td.constructor());
		InvalidFeedError = td.replace('../../../../lib/errors/invalid-feed', td.constructor());
		RssFeed = require('../../../../lib/feed/rss');
	});

	it('is a class constructor', () => {
		assert.isFunction(RssFeed);
		assert.isFunction(RssFeed.prototype.constructor);
	});

	describe('new RssFeed(document)', () => {
		let feed;
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

			feed = new RssFeed(mockDocument);
		});

		it('is an instance of the Feed class', () => {
			assert.instanceOf(feed, Feed);
		});

		it('finds a root-level rss element', () => {
			td.verify(mockDocument.findElementWithName('rss'), {times: 1});
		});

		it('finds a channel element in the root element', () => {
			td.verify(mockRootElement.findElementWithName('channel'), {times: 1});
		});

		describe('.root', () => {

			it('is set to the found rss element', () => {
				assert.strictEqual(feed.root, mockRootElement);
			});

		});

		describe('.channel', () => {

			it('is set to the found channel element', () => {
				assert.strictEqual(feed.channel, mockChannelElement);
			});

		});

		describe('.meta', () => {

			it('is an object', () => {
				assert.isObject(feed.meta);
			});

			describe('.type', () => {

				it('is set to the name of the root element', () => {
					assert.strictEqual(feed.meta.type, 'mock-root-name');
				});

			});

			describe('.version', () => {

				it('is set to `null`', () => {
					assert.isNull(feed.meta.version);
				});

				describe('when the root element has a valid `version` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('2.0');
					});

					it('is set to that version', () => {
						assert.strictEqual(feed.meta.version, '2.0');
					});

				});

				describe('when the root element has a `version` attribute matching 0.9X', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('0.91');
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(feed.meta.version, '0.9');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "channel.nestcape.com" RDF spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://channel.netscape.com/rdf/simple/0.9/');
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(feed.meta.version, '0.9');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "my.nestcape.com" RDF spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://my.netscape.com/rdf/simple/0.9/');
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(feed.meta.version, '0.9');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "purl.org" RSS spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://purl.org/rss/1.0/');
					});

					it('is set to "1.0"', () => {
						assert.strictEqual(feed.meta.version, '1.0');
					});

				});

				describe('when the root element has an invalid `version` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('invalid');
					});

					it('is set to `null`', () => {
						assert.isNull(feed.meta.version);
					});

				});

				describe('when the root element has an unrecognised `xmlns` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('invalid');
					});

					it('is set to `null`', () => {
						assert.isNull(feed.meta.version);
					});

				});

			});

		});

		describe('.language', () => {
			let mockLanguageElement;

			beforeEach(() => {
				mockLanguageElement = new MockElement();
				mockLanguageElement.textContentNormalized = 'mock language text';
				td.when(mockChannelElement.findElementWithName('language')).thenReturn(mockLanguageElement);
			});

			it('is set to the text of the first language element found in the feed', () => {
				assert.strictEqual(feed.language, 'mock language text');
			});

			describe('when a language element does not exist but an `xml:lang` attribute is set', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('language')).thenReturn(null);
					td.when(mockRootElement.getAttribute('xml:lang')).thenReturn('mock-xml:lang');
				});

				it('is set to the `xml:lang` attribute of the root element', () => {
					assert.strictEqual(feed.language, 'mock-xml:lang');
				});

			});

			describe('when a language element does not exist and the `xml:lang` attribute is not set but a `lang` attribute is', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('language')).thenReturn(null);
					td.when(mockRootElement.getAttribute('lang')).thenReturn('mock-lang');
				});

				it('is set to the `lang` attribute of the root element', () => {
					assert.strictEqual(feed.language, 'mock-lang');
				});

			});

			describe('when a language element does not exist and no language attributes are set', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('language')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.language);
				});

			});

		});

		describe('.title', () => {
			let mockTitleElement;

			beforeEach(() => {
				mockTitleElement = new MockElement();
				mockTitleElement.textContentNormalized = 'mock title text';
				td.when(mockChannelElement.findElementWithName('title')).thenReturn(mockTitleElement);
			});

			it('is set to the text of the first title element found in the feed', () => {
				assert.strictEqual(feed.title, 'mock title text');
			});

			describe('when a title element does not exist', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('title')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.title);
				});

			});

		});

		describe('.description', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentNormalized = 'mock description text';
				td.when(mockChannelElement.findElementWithName('description')).thenReturn(mockElement);
			});

			it('is set to the text of the first description element found in the feed', () => {
				assert.strictEqual(feed.description, 'mock description text');
			});

			describe('when a description element does not exist but a subtitle element does', () => {

				beforeEach(() => {
					mockElement.textContentNormalized = 'mock subtitle text';
					td.when(mockChannelElement.findElementWithName('description')).thenReturn(null);
					td.when(mockChannelElement.findElementWithName('subtitle')).thenReturn(mockElement);
				});

				it('is set to the text of the first subtitle element found in the feed', () => {
					assert.strictEqual(feed.description, 'mock subtitle text');
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('description')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.description);
				});

			});

		});

		describe('.copyright', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentNormalized = 'mock copyright text';
				td.when(mockChannelElement.findElementWithName('copyright')).thenReturn(mockElement);
			});

			it('is set to the text of the first copyright element found in the feed', () => {
				assert.strictEqual(feed.copyright, 'mock copyright text');
			});

			describe('when a copyright element does not exist but a rights element does', () => {

				beforeEach(() => {
					mockElement.textContentNormalized = 'mock rights text';
					td.when(mockChannelElement.findElementWithName('copyright')).thenReturn(null);
					td.when(mockChannelElement.findElementWithName('rights')).thenReturn(mockElement);
				});

				it('is set to the text of the first rights element found in the feed', () => {
					assert.strictEqual(feed.copyright, 'mock rights text');
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('copyright')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.copyright);
				});

			});

		});

		describe('.link', () => {
			let mockLinks;

			beforeEach(() => {
				mockLinks = [
					new MockElement(),
					new MockElement(),
					new MockElement()
				];

				// Link with no text
				mockLinks[0].textContentNormalized = '';
				mockLinks[0].textContentAsUrl = '';

				// Link with text
				mockLinks[1].textContentNormalized = 'mock-text-1';
				mockLinks[1].textContentAsUrl = 'mock-url-1';

				// Link with text
				mockLinks[2].textContentNormalized = 'mock-text-2';
				mockLinks[2].textContentAsUrl = 'mock-url-2';

				td.when(mockChannelElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to text of the first link element with text content found in the feed', () => {
				assert.strictEqual(feed.link, 'mock-url-1');
			});

			describe('when no links have text content', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([
						mockLinks[0]
					]);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.link);
				});

			});

			describe('when no link elements exists', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.link);
				});

			});

		});

		describe('.self', () => {
			let mockLinks;

			beforeEach(() => {
				mockLinks = [
					new MockElement(),
					new MockElement(),
					new MockElement(),
					new MockElement(),
					new MockElement()
				];

				// Link with no rel
				td.when(mockLinks[0].getAttribute('rel')).thenReturn(null);
				td.when(mockLinks[0].getAttributeAsUrl('href')).thenReturn('mock-href-norel');

				// Link rel alternate
				td.when(mockLinks[1].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn('mock-href-alternate');

				// Link rel self
				td.when(mockLinks[2].getAttribute('rel')).thenReturn('self');
				td.when(mockLinks[2].getAttributeAsUrl('href')).thenReturn('mock-href-self');

				// Link rel invalid
				td.when(mockLinks[3].getAttribute('rel')).thenReturn('invalid');
				td.when(mockLinks[3].getAttributeAsUrl('href')).thenReturn('mock-href-invalid');

				// Link rel self
				td.when(mockLinks[4].getAttribute('rel')).thenReturn('self');
				td.when(mockLinks[4].getAttributeAsUrl('href')).thenReturn('mock-href-self-2');

				td.when(mockChannelElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to the href attribute of the first link[rel=self] element found in the feed', () => {
				assert.strictEqual(feed.self, 'mock-href-self');
			});

			describe('when no links have appropriate rel attributes', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([
						mockLinks[0],
						mockLinks[1],
						mockLinks[3]
					]);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.self);
				});

			});

			describe('when no link elements exists', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.self);
				});

			});

		});

		describe('.published', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentAsDate = 'mock published date';
				td.when(mockChannelElement.findElementWithName('pubdate')).thenReturn(mockElement);
			});

			it('is set to the text of the first pubdate element found in the feed', () => {
				assert.strictEqual(feed.published, 'mock published date');
			});

			describe('when a pubdate element does not exist', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('pubdate')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.published);
				});

			});

		});

		describe('.updated', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentAsDate = 'mock last build date';
				td.when(mockChannelElement.findElementWithName('lastbuilddate')).thenReturn(mockElement);
			});

			it('is set to the text of the first lastbuilddate element found in the feed', () => {
				assert.strictEqual(feed.updated, 'mock last build date');
			});

			describe('when a lastbuilddate element does not exist but a date element does', () => {

				beforeEach(() => {
					mockElement.textContentAsDate = 'mock date';
					td.when(mockChannelElement.findElementWithName('lastbuilddate')).thenReturn(null);
					td.when(mockChannelElement.findElementWithName('date')).thenReturn(mockElement);
				});

				it('is set to the text of the first date element found in the feed', () => {
					assert.strictEqual(feed.updated, 'mock date');
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('lastbuilddate')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.updated);
				});

			});

		});

		describe('.generator', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentNormalized = 'mock generator';
				td.when(mockChannelElement.findElementWithName('generator')).thenReturn(mockElement);
			});

			it('is set to an object containing the text of the first generator element found in the feed', () => {
				assert.deepEqual(feed.generator, {
					label: 'mock generator',
					version: null,
					link: null
				});
			});

			describe('when a generator element does not exist', () => {

				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('generator')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feed.generator);
				});

			});

		});

		describe('when the root element name is "rdf"', () => {

			beforeEach(() => {

				// Mock an XML document
				td.when(mockDocument.findElementWithName('rss')).thenReturn(null);
				td.when(mockDocument.findElementWithName('rdf')).thenReturn(mockRootElement);

				feed = new RssFeed(mockDocument);
			});

			it('is an instance of the Feed class', () => {
				assert.instanceOf(feed, Feed);
			});

			it('finds a root-level rdf element', () => {
				td.verify(mockDocument.findElementWithName('rdf'), {times: 1});
			});

			describe('.root', () => {

				it('is set to the found rdf element', () => {
					assert.strictEqual(feed.root, mockRootElement);
				});

			});

		});

		describe('if no root element is found', () => {
			let thrownError;

			beforeEach(() => {
				td.when(mockDocument.findElementWithName('rss')).thenReturn(null);
				try {
					feed = new RssFeed(mockDocument);
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
					feed = new RssFeed(mockDocument);
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
