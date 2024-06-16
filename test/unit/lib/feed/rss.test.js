'use strict';

const assert = require('node:assert/strict');
const td = require('testdouble');

describe('lib/feed/rss', () => {
	let Feed;
	let InvalidFeedError;
	let MockDocument;
	let MockElement;
	let parseContactString;
	let RssFeed;
	let RssFeedItem;

	beforeEach(() => {
		MockDocument = require('../../mock/lib/xml/document.mock')();
		MockElement = require('../../mock/lib/xml/element.mock')();
		Feed = td.replace('../../../../lib/feed/base', require('../../mock/lib/feed/base.mock')());
		InvalidFeedError = td.replace('../../../../lib/errors/invalid-feed', td.constructor());
		parseContactString = td.replace('../../../../lib/utils/parse-contact-string', td.func());
		RssFeedItem = td.replace('../../../../lib/feed/item/rss', td.constructor());
		RssFeed = require('../../../../lib/feed/rss');
	});

	it('is a class constructor', () => {
		assert.strictEqual(typeof RssFeed, 'function');
		assert.strictEqual(typeof RssFeed.prototype.constructor, 'function');
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
			assert.ok(feed instanceof Feed);
		});

		it('finds a root-level rss element', () => {
			td.verify(mockDocument.findElementWithName('rss'), { times: 1 });
		});

		it('finds a channel element in the root element', () => {
			td.verify(mockRootElement.findElementWithName('channel'), { times: 1 });
		});

		describe('.element', () => {
			it('is set to the feed channel element', () => {
				assert.strictEqual(feed.element, mockChannelElement);
			});
		});

		describe('.meta', () => {
			it('is an object', () => {
				assert.strictEqual(typeof feed.meta, 'object');
			});

			describe('.type', () => {
				it('is set to the name of the root element', () => {
					assert.strictEqual(feed.meta.type, 'mock-root-name');
				});
			});

			describe('.version', () => {
				it('is set to `null`', () => {
					assert.strictEqual(feed.meta.version, null);
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
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn(
							'http://channel.netscape.com/rdf/simple/0.9/'
						);
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(feed.meta.version, '0.9');
					});
				});

				describe('when the root element has an `xmlns` attribute pointing to the "my.nestcape.com" RDF spec', () => {
					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn(
							'http://my.netscape.com/rdf/simple/0.9/'
						);
					});

					it('is set to "0.9"', () => {
						assert.strictEqual(feed.meta.version, '0.9');
					});
				});

				describe('when the root element has an `xmlns` attribute pointing to the "purl.org" RSS spec', () => {
					beforeEach(() => {
						td.when(mockRootElement.getAttribute('xmlns')).thenReturn(
							'http://purl.org/rss/1.0/'
						);
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
			let mockLanguageElement;

			beforeEach(() => {
				mockLanguageElement = new MockElement();
				mockLanguageElement.textContentNormalized = 'mock language text';
				td.when(mockChannelElement.findElementWithName('language')).thenReturn(
					mockLanguageElement
				);
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
				mockElement.textContentNormalized = 'mock description text';
				td.when(mockChannelElement.findElementWithName('description')).thenReturn(
					mockElement
				);
			});

			it('is set to the text of the first description element found in the feed', () => {
				assert.strictEqual(feed.description, 'mock description text');
			});

			describe('when a description element does not exist but a subtitle element does', () => {
				beforeEach(() => {
					mockElement.textContentNormalized = 'mock subtitle text';
					td.when(mockChannelElement.findElementWithName('description')).thenReturn(null);
					td.when(mockChannelElement.findElementWithName('subtitle')).thenReturn(
						mockElement
					);
				});

				it('is set to the text of the first subtitle element found in the feed', () => {
					assert.strictEqual(feed.description, 'mock subtitle text');
				});
			});

			describe('when neither element exists', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('description')).thenReturn(null);
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
				mockElement.textContentNormalized = 'mock copyright text';
				td.when(mockChannelElement.findElementWithName('copyright')).thenReturn(
					mockElement
				);
			});

			it('is set to the text of the first copyright element found in the feed', () => {
				assert.strictEqual(feed.copyright, 'mock copyright text');
			});

			describe('when a copyright element does not exist but a rights element does', () => {
				beforeEach(() => {
					mockElement.textContentNormalized = 'mock rights text';
					td.when(mockChannelElement.findElementWithName('copyright')).thenReturn(null);
					td.when(mockChannelElement.findElementWithName('rights')).thenReturn(
						mockElement
					);
				});

				it('is set to the text of the first rights element found in the feed', () => {
					assert.strictEqual(feed.copyright, 'mock rights text');
				});
			});

			describe('when neither element exists', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('copyright')).thenReturn(null);
				});

				it('is set to the copyright property of the base feed', () => {
					assert.strictEqual(feed.copyright, 'mock-feed-copyright');
				});
			});
		});

		describe('.url', () => {
			let mockLinks;

			beforeEach(() => {
				mockLinks = [new MockElement(), new MockElement(), new MockElement()];

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
				assert.strictEqual(feed.url, 'mock-url-1');
			});

			describe('when no links have text content', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([
						mockLinks[0]
					]);
				});

				it('is set to the url property of the base feed', () => {
					assert.strictEqual(feed.url, 'mock-feed-url');
				});
			});

			describe('when no link elements exists', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([]);
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

				it('is set to the self property of the base feed', () => {
					assert.strictEqual(feed.self, 'mock-feed-self');
				});
			});

			describe('when no link elements exists', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to the self property of the base feed', () => {
					assert.strictEqual(feed.self, 'mock-feed-self');
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

				it('is set to the published property of the base feed', () => {
					assert.strictEqual(feed.published, 'mock-feed-published');
				});
			});
		});

		describe('.updated', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentAsDate = 'mock last build date';
				td.when(mockChannelElement.findElementWithName('lastbuilddate')).thenReturn(
					mockElement
				);
			});

			it('is set to the text of the first lastbuilddate element found in the feed', () => {
				assert.strictEqual(feed.updated, 'mock last build date');
			});

			describe('when a lastbuilddate element does not exist but a date element does', () => {
				beforeEach(() => {
					mockElement.textContentAsDate = 'mock date';
					td.when(mockChannelElement.findElementWithName('lastbuilddate')).thenReturn(
						null
					);
					td.when(mockChannelElement.findElementWithName('date')).thenReturn(mockElement);
				});

				it('is set to the text of the first date element found in the feed', () => {
					assert.strictEqual(feed.updated, 'mock date');
				});
			});

			describe('when neither element exists', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('lastbuilddate')).thenReturn(
						null
					);
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
				td.when(mockChannelElement.findElementWithName('generator')).thenReturn(
					mockElement
				);
			});

			it('is set to an object containing the text of the first generator element found in the feed', () => {
				assert.deepEqual(feed.generator, {
					label: 'mock generator',
					version: null,
					url: null
				});
			});

			describe('when a generator element does not exist', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementWithName('generator')).thenReturn(null);
				});

				it('is set to the generator property of the base feed', () => {
					assert.strictEqual(feed.generator, 'mock-feed-generator');
				});
			});
		});

		describe('.image', () => {
			let mockImageElement;
			let mockItunesImageElement;
			let mockTitleElement;
			let mockUrlElement;

			beforeEach(() => {
				mockImageElement = new MockElement();
				mockTitleElement = new MockElement();
				mockUrlElement = new MockElement();
				mockTitleElement.textContentNormalized = 'mock image title';
				mockUrlElement.textContentAsUrl = 'mock-image-url';
				mockItunesImageElement = new MockElement();
				mockItunesImageElement.namespace = 'itunes';
				td.when(mockImageElement.findElementWithName('title')).thenReturn(mockTitleElement);
				td.when(mockImageElement.findElementWithName('url')).thenReturn(mockUrlElement);
				td.when(mockItunesImageElement.getAttributeAsUrl('href')).thenReturn(
					'mock-itunes-image-url'
				);
				td.when(mockChannelElement.findElementsWithName('image')).thenReturn([
					mockImageElement,
					mockItunesImageElement
				]);
			});

			it('is set to an object containing the title and URL of the first image element found in the feed', () => {
				assert.deepEqual(feed.image, {
					title: 'mock image title',
					url: 'mock-image-url'
				});
			});

			describe('when a image element has a URL but no title', () => {
				beforeEach(() => {
					td.when(mockImageElement.findElementWithName('title')).thenReturn(null);
				});

				it('is set to an object containing the URL of the image element and a `null` title', () => {
					assert.deepEqual(feed.image, {
						title: null,
						url: 'mock-image-url'
					});
				});
			});

			describe('when a image element has a title but no URL', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('image')).thenReturn([
						mockImageElement
					]);
					td.when(mockImageElement.findElementWithName('url')).thenReturn(null);
				});

				it('is set to the image property of the base feed', () => {
					assert.strictEqual(feed.image, 'mock-feed-image');
				});
			});

			describe('when a regular image element does not exist but an itunes one does', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('image')).thenReturn([
						mockItunesImageElement
					]);
				});

				it('is set to an object containing the URL of the first itunes:image element found in the feed', () => {
					assert.deepEqual(feed.image, {
						title: null,
						url: 'mock-itunes-image-url'
					});
				});
			});

			describe('when an image element does not exist', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('image')).thenReturn([]);
				});

				it('is set to the image property of the base feed', () => {
					assert.strictEqual(feed.image, 'mock-feed-image');
				});
			});
		});

		describe('.authors', () => {
			let authors;

			beforeEach(() => {
				const mockManagingEditorElements = [new MockElement(), new MockElement()];
				mockManagingEditorElements[0].textContentNormalized = 'mock-managing-editor-1';
				mockManagingEditorElements[1].textContentNormalized = 'mock-managing-editor-2';
				td.when(mockChannelElement.findElementsWithName('managingeditor')).thenReturn(
					mockManagingEditorElements
				);

				const mockAuthorElements = [new MockElement(), new MockElement()];
				mockAuthorElements[0].textContentNormalized = 'mock-author-1';
				mockAuthorElements[1].textContentNormalized = 'mock-author-2';
				td.when(mockChannelElement.findElementsWithName('author')).thenReturn(
					mockAuthorElements
				);

				const mockCreatorElement = [new MockElement(), new MockElement()];
				mockCreatorElement[0].textContentNormalized = 'mock-creator-1';
				mockCreatorElement[1].textContentNormalized = 'mock-creator-2';
				td.when(mockChannelElement.findElementsWithName('creator')).thenReturn(
					mockCreatorElement
				);

				td.when(parseContactString('mock-managing-editor-1')).thenReturn(
					'mock-parsed-managing-editor-1'
				);
				td.when(parseContactString('mock-managing-editor-2')).thenReturn(
					'mock-parsed-managing-editor-2'
				);
				td.when(parseContactString('mock-author-1')).thenReturn('mock-parsed-author-1');
				td.when(parseContactString('mock-author-2')).thenReturn('mock-parsed-author-2');
				td.when(parseContactString('mock-creator-1')).thenReturn('mock-parsed-creator-1');
				td.when(parseContactString('mock-creator-2')).thenReturn('mock-parsed-creator-2');

				authors = feed.authors;
			});

			it('parses each author element', () => {
				td.verify(parseContactString('mock-managing-editor-1'), { times: 1 });
				td.verify(parseContactString('mock-managing-editor-2'), { times: 1 });
				td.verify(parseContactString('mock-author-1'), { times: 1 });
				td.verify(parseContactString('mock-author-2'), { times: 1 });
				td.verify(parseContactString('mock-creator-1'), { times: 1 });
				td.verify(parseContactString('mock-creator-2'), { times: 1 });
			});

			it('is set to an array of parsed author objects', () => {
				assert.ok(Array.isArray(authors));
				assert.strictEqual(authors.length, 6);
				assert.deepEqual(authors, [
					'mock-parsed-managing-editor-1',
					'mock-parsed-managing-editor-2',
					'mock-parsed-author-1',
					'mock-parsed-author-2',
					'mock-parsed-creator-1',
					'mock-parsed-creator-2'
				]);
			});

			describe('when an author element cannot be parsed', () => {
				beforeEach(() => {
					td.when(parseContactString('mock-managing-editor-1')).thenReturn(null);
					authors = feed.authors;
				});

				it('is not included', () => {
					assert.deepEqual(authors, [
						'mock-parsed-managing-editor-2',
						'mock-parsed-author-1',
						'mock-parsed-author-2',
						'mock-parsed-creator-1',
						'mock-parsed-creator-2'
					]);
				});
			});
		});

		describe('.items', () => {
			let items;
			let mockChannelItems;
			let mockRootItems;

			beforeEach(() => {
				mockChannelItems = [new MockElement(), new MockElement()];
				mockRootItems = [new MockElement()];
				td.when(mockChannelElement.findElementsWithName('item')).thenReturn(
					mockChannelItems
				);
				td.when(mockRootElement.findElementsWithName('item')).thenReturn(mockRootItems);
				items = feed.items;
			});

			it('instantiates an RssFeedItem for each item element found in the channel and root elements', () => {
				td.verify(new RssFeedItem(), {
					ignoreExtraArgs: true,
					times: 3
				});
				td.verify(new RssFeedItem(feed, mockChannelItems[0]), { times: 1 });
				td.verify(new RssFeedItem(feed, mockChannelItems[1]), { times: 1 });
				td.verify(new RssFeedItem(feed, mockRootItems[0]), { times: 1 });
			});

			it('is set to an array of the created RssFeedItem instances', () => {
				assert.ok(Array.isArray(items));
				assert.strictEqual(items.length, 3);
				assert.ok(items[0] instanceof RssFeedItem);
				assert.ok(items[1] instanceof RssFeedItem);
				assert.ok(items[2] instanceof RssFeedItem);
			});

			describe('when accessed a second time', () => {
				it('does not re-instantate RssFeedItems', () => {
					const newItems = feed.items;
					td.verify(new RssFeedItem(), {
						ignoreExtraArgs: true,
						times: 3
					});
					assert.strictEqual(newItems, items);
				});
			});

			describe('when there are no items in the root element', () => {
				beforeEach(() => {
					td.when(mockRootElement.findElementsWithName('item')).thenReturn([]);
					RssFeedItem = td.replace('../../../../lib/feed/item/rss', td.constructor());
					RssFeed = require('../../../../lib/feed/rss');
					feed = new RssFeed(mockDocument);
					items = feed.items;
				});

				it('instantiates an RssFeedItem for each item element found in the channel', () => {
					td.verify(new RssFeedItem(), {
						ignoreExtraArgs: true,
						times: 2
					});
					td.verify(new RssFeedItem(feed, mockChannelItems[0]), { times: 1 });
					td.verify(new RssFeedItem(feed, mockChannelItems[1]), { times: 1 });
				});

				it('returns only the channel element items', () => {
					assert.ok(Array.isArray(items));
					assert.strictEqual(items.length, 2);
					assert.ok(items[0] instanceof RssFeedItem);
					assert.ok(items[1] instanceof RssFeedItem);
				});
			});

			describe('when there are no items in the channel element', () => {
				beforeEach(() => {
					td.when(mockChannelElement.findElementsWithName('item')).thenReturn([]);
					RssFeedItem = td.replace('../../../../lib/feed/item/rss', td.constructor());
					RssFeed = require('../../../../lib/feed/rss');
					feed = new RssFeed(mockDocument);
					items = feed.items;
				});

				it('instantiates an RssFeedItem for each item element found in the channel', () => {
					td.verify(new RssFeedItem(), {
						ignoreExtraArgs: true,
						times: 1
					});
					td.verify(new RssFeedItem(feed, mockRootItems[0]), { times: 1 });
				});

				it('returns only the channel element items', () => {
					assert.ok(Array.isArray(items));
					assert.strictEqual(items.length, 1);
					assert.ok(items[0] instanceof RssFeedItem);
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
				assert.ok(feed instanceof Feed);
			});

			it('finds a root-level rdf element', () => {
				td.verify(mockDocument.findElementWithName('rdf'), { times: 1 });
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
				td.verify(new InvalidFeedError('The RSS feed does not have a root element'), {
					times: 1
				});
				assert.ok(thrownError instanceof InvalidFeedError);
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
				td.verify(new InvalidFeedError('The RSS feed does not have a channel element'), {
					times: 1
				});
				assert.ok(thrownError instanceof InvalidFeedError);
			});
		});
	});
});
