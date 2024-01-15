'use strict';

const assert = require('node:assert/strict');
const td = require('testdouble');

describe('lib/feed/atom', () => {
	let AtomFeed;
	let AtomFeedItem;
	let Feed;
	let InvalidFeedError;
	let MockDocument;
	let MockElement;
	let parseContactString;

	beforeEach(() => {
		MockDocument = require('../../mock/lib/xml/document.mock')();
		MockElement = require('../../mock/lib/xml/element.mock')();
		AtomFeedItem = td.replace('../../../../lib/feed/item/atom', td.constructor());
		Feed = td.replace('../../../../lib/feed/base', require('../../mock/lib/feed/base.mock')());
		InvalidFeedError = td.replace('../../../../lib/errors/invalid-feed', td.constructor());
		parseContactString = td.replace('../../../../lib/utils/parse-contact-string', td.func());
		AtomFeed = require('../../../../lib/feed/atom');
	});

	it('is a class constructor', () => {
		assert.strictEqual(typeof AtomFeed, 'function');
		assert.strictEqual(typeof AtomFeed.prototype.constructor, 'function');
	});

	describe('new AtomFeed(document)', () => {
		let feed;
		let mockDocument;
		let mockRootElement;

		beforeEach(() => {

			// Mock an XML document
			mockDocument = new MockDocument();
			mockRootElement = new MockElement();
			td.when(mockDocument.findElementWithName('feed')).thenReturn(mockRootElement);

			feed = new AtomFeed(mockDocument);
		});

		it('is an instance of the Feed class', () => {
			assert.ok(feed instanceof Feed);
		});

		it('finds a root-level feed element', () => {
			td.verify(mockDocument.findElementWithName('feed'), {times: 1});
		});

		describe('.element', () => {

			it('is set to the feed root element', () => {
				assert.strictEqual(feed.element, mockRootElement);
			});

		});

		describe('.meta', () => {

			it('is an object', () => {
				assert.strictEqual(typeof feed.meta, 'object');
			});

			describe('.type', () => {

				it('is set to "atom"', () => {
					assert.strictEqual(feed.meta.type, 'atom');
				});

			});

			describe('.version', () => {

				it('is set to `null`', () => {
					assert.strictEqual(feed.meta.version, null);
				});

				describe('when the root element has a valid `version` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('version')).thenReturn('1.0');
					});

					it('is set to that version', () => {
						assert.strictEqual(feed.meta.version, '1.0');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "purl.org" Atom spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://purl.org/atom/ns#');
					});

					it('is set to "0.3"', () => {
						assert.strictEqual(feed.meta.version, '0.3');
					});

				});

				describe('when the root element has an `xmlns` attribute pointing to the "w3.org" Atom spec', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('http://www.w3.org/2005/Atom');
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
						assert.strictEqual(feed.meta.version, null);
					});

				});

				describe('when the root element has an unrecognised `xmlns` attribute', () => {

					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn('invalid');
					});

					it('is set to `null`', () => {
						assert.strictEqual(feed.meta.version, null);
					});

				});

			});

		});

		describe('.language', () => {

			beforeEach(() => {
				td.when(mockRootElement.getAttribute('xml:lang')).thenReturn('mock-xml:lang');
			});

			it('is set to the `xml:lang` attribute of the root element', () => {
				assert.strictEqual(feed.language, 'mock-xml:lang');
			});

			describe('when a the `xml:lang` attribute is not set but a `lang` attribute is', () => {

				beforeEach(() => {
					td.when(mockRootElement.getAttribute('xml:lang')).thenReturn(null);
					td.when(mockRootElement.getAttribute('lang')).thenReturn('mock-lang');
				});

				it('is set to the `lang` attribute of the root element', () => {
					assert.strictEqual(feed.language, 'mock-lang');
				});

			});

			describe('when neither attribute is set', () => {

				beforeEach(() => {
					td.when(mockRootElement.getAttribute('xml:lang')).thenReturn(null);
					td.when(mockRootElement.getAttribute('lang')).thenReturn(null);
				});

				it('is set to the language property of the base feed', () => {
					assert.strictEqual(feed.language, 'mock-feed-language');
				});

			});

		});

		describe('.title', () => {

			it('is set to the title property of the base feed', () => {
				assert.strictEqual(feed.title, 'mock-feed-title');
			});

		});

		describe('.description', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentNormalized = 'mock subtitle text';
				td.when(mockRootElement.findElementWithName('subtitle')).thenReturn(mockElement);
			});

			it('is set to the text of the first subtitle element found in the feed', () => {
				assert.strictEqual(feed.description, 'mock subtitle text');
			});

			describe('when a subtitle element does not exist but a tagline element does', () => {

				beforeEach(() => {
					mockElement.textContentNormalized = 'mock tagline text';
					td.when(mockRootElement.findElementWithName('subtitle')).thenReturn(null);
					td.when(mockRootElement.findElementWithName('tagline')).thenReturn(mockElement);
				});

				it('is set to the text of the first tagline element found in the feed', () => {
					assert.strictEqual(feed.description, 'mock tagline text');
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('subtitle')).thenReturn(null);
				});

				it('is set to the description property of the base feed', () => {
					assert.strictEqual(feed.description, 'mock-feed-description');
				});

			});

		});

		describe('.copyright', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentNormalized = 'mock rights text';
				td.when(mockRootElement.findElementWithName('rights')).thenReturn(mockElement);
			});

			it('is set to the text of the first rights element found in the feed', () => {
				assert.strictEqual(feed.copyright, 'mock rights text');
			});

			describe('when a rights element does not exist but a copyright element does', () => {

				beforeEach(() => {
					mockElement.textContentNormalized = 'mock copyright text';
					td.when(mockRootElement.findElementWithName('rights')).thenReturn(null);
					td.when(mockRootElement.findElementWithName('copyright')).thenReturn(mockElement);
				});

				it('is set to the text of the first copyright element found in the feed', () => {
					assert.strictEqual(feed.copyright, 'mock copyright text');
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('rights')).thenReturn(null);
				});

				it('is set to the copyright property of the base feed', () => {
					assert.strictEqual(feed.copyright, 'mock-feed-copyright');
				});

			});

		});

		describe('.url', () => {
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

				// Link rel alternate
				td.when(mockLinks[4].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[4].getAttributeAsUrl('href')).thenReturn('mock-href-alternate-2');

				td.when(mockRootElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to the href attribute of the first link[rel=alternate] element found in the feed', () => {
				assert.strictEqual(feed.url, 'mock-href-alternate');
			});

			describe('when a link[rel=alternate] element does not exist but a link element without a rel attribute does', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementsWithName('link')).thenReturn([
						mockLinks[0],
						mockLinks[2],
						mockLinks[3]
					]);
				});

				it('is set to the href attribute of the first link element found in the feed without a rel attribute', () => {
					assert.strictEqual(feed.url, 'mock-href-norel');
				});

			});

			describe('when no links have appropriate rel attributes', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementsWithName('link')).thenReturn([
						mockLinks[2],
						mockLinks[3]
					]);
				});

				it('is set to the url property of the base feed', () => {
					assert.strictEqual(feed.url, 'mock-feed-url');
				});

			});

			describe('when no link elements exists', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to the url property of the base feed', () => {
					assert.strictEqual(feed.url, 'mock-feed-url');
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

				td.when(mockRootElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to the href attribute of the first link[rel=self] element found in the feed', () => {
				assert.strictEqual(feed.self, 'mock-href-self');
			});

			describe('when no links have appropriate rel attributes', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementsWithName('link')).thenReturn([
						mockLinks[0],
						mockLinks[1],
						mockLinks[3]
					]);
				});

				it('is set to the self property of the base feed', () => {
					assert.strictEqual(feed.self, 'mock-feed-self');
				});

			});

			describe('when no link elements exists', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to the self property of the base feed', () => {
					assert.strictEqual(feed.self, 'mock-feed-self');
				});

			});

		});

		describe('.published', () => {

			it('is set to the published property of the base feed', () => {
				assert.strictEqual(feed.published, 'mock-feed-published');
			});

		});

		describe('.updated', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentAsDate = 'mock updated date';
				td.when(mockRootElement.findElementWithName('updated')).thenReturn(mockElement);
			});

			it('is set to the text of the first updated element found in the feed', () => {
				assert.strictEqual(feed.updated, 'mock updated date');
			});

			describe('when an updated element does not exist but a modified element does', () => {

				beforeEach(() => {
					mockElement.textContentAsDate = 'mock modified date';
					td.when(mockRootElement.findElementWithName('updated')).thenReturn(null);
					td.when(mockRootElement.findElementWithName('modified')).thenReturn(mockElement);
				});

				it('is set to the text of the first modified element found in the feed', () => {
					assert.strictEqual(feed.updated, 'mock modified date');
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('updated')).thenReturn(null);
				});

				it('is set to the updated property of the base feed', () => {
					assert.strictEqual(feed.updated, 'mock-feed-updated');
				});

			});

		});

		describe('.generator', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentNormalized = 'mock generator';
				td.when(mockElement.getAttributeAsUrl('uri')).thenReturn('mock-generator-uri');
				td.when(mockElement.getAttribute('version')).thenReturn('mock-generator-version');
				td.when(mockRootElement.findElementWithName('generator')).thenReturn(mockElement);
			});

			it('is set to an object containing the details of the first generator element found in the feed', () => {
				assert.deepEqual(feed.generator, {
					label: 'mock generator',
					version: 'mock-generator-version',
					url: 'mock-generator-uri'
				});
			});

			describe('when the generator element has no `uri` attribute but does have a `url` attribute', () => {

				beforeEach(() => {
					td.when(mockElement.getAttributeAsUrl('uri')).thenReturn(null);
					td.when(mockElement.getAttributeAsUrl('url')).thenReturn('mock-generator-url');
				});

				it('the object link property contains the value of the url attribute', () => {
					assert.strictEqual(feed.generator.url, 'mock-generator-url');
				});

			});

			describe('when only one part of the generator data is present', () => {

				beforeEach(() => {
					td.when(mockElement.getAttributeAsUrl('uri')).thenReturn(null);
					td.when(mockElement.getAttribute('version')).thenReturn(null);
				});

				it('is set to an object containing just the one part of the generator', () => {
					assert.deepEqual(feed.generator, {
						label: 'mock generator',
						version: null,
						url: null
					});
				});

			});

			describe('when a generator element is present but has no data', () => {

				beforeEach(() => {
					mockElement.textContentNormalized = '';
					td.when(mockElement.getAttributeAsUrl('uri')).thenReturn(null);
					td.when(mockElement.getAttribute('version')).thenReturn(null);
				});

				it('is set to the generator property of the base feed', () => {
					assert.strictEqual(feed.generator, 'mock-feed-generator');
				});

			});

			describe('when a generator element does not exist', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('generator')).thenReturn(null);
				});

				it('is set to the generator property of the base feed', () => {
					assert.strictEqual(feed.generator, 'mock-feed-generator');
				});

			});

		});

		describe('.image', () => {
			let mockLogoElement;
			let mockIconElement;

			beforeEach(() => {
				mockLogoElement = new MockElement();
				mockIconElement = new MockElement();
				mockLogoElement.textContentAsUrl = 'mock-logo';
				mockIconElement.textContentAsUrl = 'mock-icon';
				td.when(mockRootElement.findElementWithName('logo')).thenReturn(mockLogoElement);
				td.when(mockRootElement.findElementWithName('icon')).thenReturn(mockIconElement);
			});

			it('is set to an object containing the URL of the first logo element found in the feed', () => {
				assert.deepEqual(feed.image, {
					title: null,
					url: 'mock-logo'
				});
			});

			describe('when a logo element does not exist but an icon element does', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('logo')).thenReturn(null);
				});

				it('is set to an object containing the URL of the first icon element found in the feed', () => {
					assert.deepEqual(feed.image, {
						title: null,
						url: 'mock-icon'
					});
				});

			});

			describe('when neither element exists', () => {

				beforeEach(() => {
					td.when(mockRootElement.findElementWithName('logo')).thenReturn(null);
					td.when(mockRootElement.findElementWithName('icon')).thenReturn(null);
				});

				it('is set to the image property of the base feed', () => {
					assert.strictEqual(feed.image, 'mock-feed-image');
				});

			});

		});

		describe('.authors', () => {
			let mockAuthorElements;
			let authors;

			beforeEach(() => {
				mockAuthorElements = [
					new MockElement(),
					new MockElement(),
					new MockElement(),
					new MockElement()
				];
				td.when(mockRootElement.findElementsWithName('author')).thenReturn(mockAuthorElements);

				const mockName = new MockElement();
				mockName.textContentNormalized = 'mock-author-name';
				const mockUri = new MockElement();
				mockUri.textContentAsUrl = 'mock-author-uri';
				const mockEmail = new MockElement();
				mockEmail.textContentNormalized = 'mock-author-email';

				td.when(mockAuthorElements[0].findElementWithName('name')).thenReturn(mockName);
				td.when(mockAuthorElements[0].findElementWithName('uri')).thenReturn(mockUri);
				td.when(mockAuthorElements[0].findElementWithName('email')).thenReturn(mockEmail);
				td.when(mockAuthorElements[1].findElementWithName('name')).thenReturn(mockName);
				td.when(mockAuthorElements[2].findElementWithName('uri')).thenReturn(mockUri);
				td.when(mockAuthorElements[3].findElementWithName('email')).thenReturn(mockEmail);

				authors = feed.authors;
			});

			it('is set to an array of author objects', () => {
				assert.ok(Array.isArray(authors));
				assert.strictEqual(authors.length, 4);
				assert.deepEqual(authors[0], {
					name: 'mock-author-name',
					url: 'mock-author-uri',
					email: 'mock-author-email'
				});
				assert.deepEqual(authors[1], {
					name: 'mock-author-name',
					url: null,
					email: null
				});
				assert.deepEqual(authors[2], {
					name: null,
					url: 'mock-author-uri',
					email: null
				});
				assert.deepEqual(authors[3], {
					name: null,
					url: null,
					email: 'mock-author-email'
				});
			});

			describe('when an author has a url element rather than a uri element', () => {

				beforeEach(() => {
					const mockUrl = new MockElement();
					mockUrl.textContentAsUrl = 'mock-author-url';

					td.when(mockAuthorElements[0].findElementWithName('uri')).thenReturn(null);
					td.when(mockAuthorElements[0].findElementWithName('url')).thenReturn(mockUrl);

					authors = feed.authors;
				});

				it('the author urls use the incorrect element', () => {
					assert.strictEqual(authors[0].url, 'mock-author-url');
				});

			});

			describe('when an author element contains only text', () => {

				beforeEach(() => {
					mockAuthorElements = [
						new MockElement()
					];
					td.when(mockRootElement.findElementsWithName('author')).thenReturn(mockAuthorElements);
					mockAuthorElements[0].textContentNormalized = 'mock-author';

					td.when(parseContactString('mock-author')).thenReturn('mock-parsed-author');

					authors = feed.authors;
				});

				it('is parsed for URLs, emails, and names', () => {
					td.verify(parseContactString('mock-author'), {times: 1});
					assert.strictEqual(authors[0], 'mock-parsed-author');
				});

			});

			describe('when an author element contains only text and cannot be parsed', () => {

				beforeEach(() => {
					mockAuthorElements = [
						new MockElement()
					];
					td.when(mockRootElement.findElementsWithName('author')).thenReturn(mockAuthorElements);
					mockAuthorElements[0].textContentNormalized = 'mock-author';

					td.when(parseContactString('mock-author')).thenReturn(null);

					authors = feed.authors;
				});

				it('is not included', () => {
					assert.deepEqual(authors, []);
				});

			});

		});

		describe('.items', () => {
			let mockEntryElements;
			let items;

			beforeEach(() => {
				mockEntryElements = [
					new MockElement(),
					new MockElement(),
					new MockElement()
				];
				td.when(mockRootElement.findElementsWithName('entry')).thenReturn(mockEntryElements);
				items = feed.items;
			});

			it('instantiates an AtomFeedItem for each entry element found in the feed', () => {
				td.verify(new AtomFeedItem(), {
					ignoreExtraArgs: true,
					times: 3
				});
				td.verify(new AtomFeedItem(feed, mockEntryElements[0]), {times: 1});
				td.verify(new AtomFeedItem(feed, mockEntryElements[1]), {times: 1});
				td.verify(new AtomFeedItem(feed, mockEntryElements[2]), {times: 1});
			});

			it('is set to an array of the created AtomFeedItem instances', () => {
				assert.ok(Array.isArray(items));
				assert.strictEqual(items.length, 3);
				assert.ok(items[0] instanceof AtomFeedItem);
				assert.ok(items[1] instanceof AtomFeedItem);
				assert.ok(items[2] instanceof AtomFeedItem);
			});

			describe('when accessed a second time', () => {

				it('does not re-instantate AtomFeedItems', () => {
					const newItems = feed.items;
					td.verify(new AtomFeedItem(), {
						ignoreExtraArgs: true,
						times: 3
					});
					assert.strictEqual(newItems, items);
				});

			});

		});

		describe('if no root element is found', () => {
			let thrownError;

			beforeEach(() => {
				td.when(mockDocument.findElementWithName('feed')).thenReturn(null);
				try {
					feed = new AtomFeed(mockDocument);
				} catch (error) {
					thrownError = error;
				}
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError('The Atom feed does not have a root element'), {times: 1});
				assert.ok(thrownError instanceof InvalidFeedError);
			});

		});

	});

});
