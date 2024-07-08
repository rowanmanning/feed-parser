'use strict';

const { afterEach, beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const td = require('testdouble');

td.config({ ignoreWarnings: true });

describe('lib/feed/item/atom', () => {
	let AtomFeedItem;
	let FeedItem;
	let MockElement;
	let parseContactString;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock')();
		FeedItem = td.replace(
			'../../../../../lib/feed/item/base',
			require('../../../mock/lib/feed/item/base.mock')()
		);
		parseContactString = td.replace('../../../../../lib/utils/parse-contact-string', td.func());
		AtomFeedItem = require('../../../../../lib/feed/item/atom');
	});

	afterEach(() => td.reset());

	it('is a class constructor', () => {
		assert.strictEqual(typeof AtomFeedItem, 'function');
		assert.strictEqual(typeof AtomFeedItem.prototype.constructor, 'function');
	});

	describe('new AtomFeedItem(feed, element)', () => {
		let feedItem;
		let mockItemElement;
		let mockFeed;

		beforeEach(() => {
			mockFeed = {
				authors: ['mock-feed-author']
			};
			mockItemElement = new MockElement();
			feedItem = new AtomFeedItem(mockFeed, mockItemElement);
		});

		it('is an instance of the FeedItem class', () => {
			assert.ok(feedItem instanceof FeedItem);
		});

		describe('.id', () => {
			let mockIdElement;

			beforeEach(() => {
				mockIdElement = new MockElement();
				mockIdElement.textContentNormalized = 'mock-id';
				td.when(mockItemElement.findElementWithName('id')).thenReturn(mockIdElement);
			});

			it('is set to the text of the first id element found in the feed item', () => {
				assert.strictEqual(feedItem.id, 'mock-id');
			});

			describe('when an id element does not exist', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('id')).thenReturn(null);
				});

				it('is set to the id property of the base feed item', () => {
					assert.strictEqual(feedItem.id, 'mock-feed-item-id');
				});
			});
		});

		describe('.title', () => {
			it('is set to the title property of the base feed item', () => {
				assert.strictEqual(feedItem.title, 'mock-feed-item-title');
			});
		});

		describe('.description', () => {
			let mockSummaryElement;

			beforeEach(() => {
				mockSummaryElement = new MockElement();
				mockSummaryElement.textContentNormalized = 'mock summary text';
				td.when(mockItemElement.findElementWithName('summary')).thenReturn(
					mockSummaryElement
				);
			});

			it('is set to the text of the first summary element found in the feed item', () => {
				assert.strictEqual(feedItem.description, 'mock summary text');
			});

			describe('when a summary element does not exist', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('summary')).thenReturn(null);
				});

				it('is set to the description property of the base feed item', () => {
					assert.strictEqual(feedItem.description, 'mock-feed-item-description');
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
				td.when(mockLinks[0].getAttributeAsUrl('href')).thenReturn(
					'https://mock-url-norel'
				);

				// Link rel alternate
				td.when(mockLinks[1].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn(
					'https://mock-url-alternate'
				);

				// Link rel self
				td.when(mockLinks[2].getAttribute('rel')).thenReturn('self');
				td.when(mockLinks[2].getAttributeAsUrl('href')).thenReturn('https://mock-url-self');

				// Link rel invalid
				td.when(mockLinks[3].getAttribute('rel')).thenReturn('invalid');
				td.when(mockLinks[3].getAttributeAsUrl('href')).thenReturn(
					'https://mock-url-invalid'
				);

				// Link rel alternate
				td.when(mockLinks[4].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[4].getAttributeAsUrl('href')).thenReturn(
					'https://mock-url-alternate-2'
				);

				td.when(mockItemElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to the href attribute of the first link[rel=alternate] element found in the feed', () => {
				assert.strictEqual(feedItem.url, 'https://mock-url-alternate/');
			});

			describe('when a link[rel=alternate] element does not exist but a link element without a rel attribute does', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([
						mockLinks[0],
						mockLinks[2],
						mockLinks[3]
					]);
				});

				it('is set to the href attribute of the first link element found in the feed without a rel attribute', () => {
					assert.strictEqual(feedItem.url, 'https://mock-url-norel/');
				});
			});

			describe('when the link is relative', () => {
				beforeEach(() => {
					mockFeed.url = 'https://mock-feed';
					td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn('/mock-path');
				});

				it('is resolved against the feed URL', () => {
					assert.strictEqual(feedItem.url, 'https://mock-feed/mock-path');
				});
			});

			describe('when the link is relative but the feed has no URL', () => {
				beforeEach(() => {
					mockFeed.url = null;
					td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn('/mock-path');
				});

				it('is set to the relative URL', () => {
					assert.strictEqual(feedItem.url, '/mock-path');
				});
			});

			describe('when no links have appropriate rel attributes', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([
						mockLinks[2],
						mockLinks[3]
					]);
				});

				it('is set to the url property of the base feed item', () => {
					assert.strictEqual(feedItem.url, 'mock-feed-item-url');
				});
			});

			describe('when no link elements exists', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to the url property of the base feed item', () => {
					assert.strictEqual(feedItem.url, 'mock-feed-item-url');
				});
			});
		});

		describe('.published', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentAsDate = 'mock published date';
				td.when(mockItemElement.findElementWithName('published')).thenReturn(mockElement);
			});

			it('is set to the text of the first published element found in the feed item', () => {
				assert.strictEqual(feedItem.published, 'mock published date');
			});

			describe('when a published element does not exist but an issued element does', () => {
				beforeEach(() => {
					mockElement.textContentAsDate = 'mock issued date';
					td.when(mockItemElement.findElementWithName('published')).thenReturn(null);
					td.when(mockItemElement.findElementWithName('issued')).thenReturn(mockElement);
				});

				it('is set to the text of the first issued element found in the feed item', () => {
					assert.strictEqual(feedItem.published, 'mock issued date');
				});
			});

			describe('when neither element exists', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('published')).thenReturn(null);
				});

				it('is set to the published property of the base feed item', () => {
					assert.strictEqual(feedItem.published, 'mock-feed-item-published');
				});
			});
		});

		describe('.updated', () => {
			let mockElement;

			beforeEach(() => {
				mockElement = new MockElement();
				mockElement.textContentAsDate = 'mock modified date';
				td.when(mockItemElement.findElementWithName('modified')).thenReturn(mockElement);
			});

			it('is set to the text of the first modified element found in the feed item', () => {
				assert.strictEqual(feedItem.updated, 'mock modified date');
			});

			describe('when a modified element does not exist but an updated element does', () => {
				beforeEach(() => {
					mockElement.textContentAsDate = 'mock updated date';
					td.when(mockItemElement.findElementWithName('modified')).thenReturn(null);
					td.when(mockItemElement.findElementWithName('updated')).thenReturn(mockElement);
				});

				it('is set to the text of the first updated element found in the feed item', () => {
					assert.strictEqual(feedItem.updated, 'mock updated date');
				});
			});

			describe('when neither element exists', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('modified')).thenReturn(null);
				});

				it('is set to the updated property of the base feed item', () => {
					assert.strictEqual(feedItem.updated, 'mock-feed-item-updated');
				});
			});

			describe('when the base feed item updated property is null', () => {
				beforeEach(() => {
					Object.defineProperty(feedItem, 'published', {
						get: () => 'mock published date'
					});
					Object.defineProperty(FeedItem.prototype, 'updated', { get: () => null });
					td.when(mockItemElement.findElementWithName('modified')).thenReturn(null);
				});

				it('is set to the value of the feedItem `published` property', () => {
					assert.strictEqual(feedItem.updated, 'mock published date');
				});
			});
		});

		describe('.content', () => {
			let mockContentElement;

			beforeEach(() => {
				mockContentElement = new MockElement();
				mockContentElement.textContentNormalized = 'mock content text';
				td.when(mockItemElement.findElementWithName('content')).thenReturn(
					mockContentElement
				);
			});

			it('is set to the text of the first content element found in the feed item', () => {
				assert.strictEqual(feedItem.content, 'mock content text');
			});

			describe('when the content element has a type of "xtml"', () => {
				beforeEach(() => {
					td.when(mockContentElement.getAttribute('type')).thenReturn('xhtml');
				});

				describe('and it contains a wrapping div', () => {
					let mockDivElement;

					beforeEach(() => {
						mockDivElement = new MockElement();
						mockDivElement.innerHtml = 'mock div content';
						td.when(mockContentElement.findElementWithName('div')).thenReturn(
							mockDivElement
						);
					});

					it('is set to the inner HTML of the div', () => {
						assert.strictEqual(feedItem.content, 'mock div content');
					});
				});

				describe('and it does not contain a wrapping div', () => {
					it('is set to the text of the first content element found in the feed item', () => {
						assert.strictEqual(feedItem.content, 'mock content text');
					});
				});
			});

			describe('when the content element text content is empty', () => {
				beforeEach(() => {
					mockContentElement.textContentNormalized = '';
				});

				it('is set to the content property of the base feed item', () => {
					assert.strictEqual(feedItem.content, 'mock-feed-item-content');
				});
			});

			describe('when a content element does not exist', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('content')).thenReturn(null);
				});

				it('is set to the content property of the base feed item', () => {
					assert.strictEqual(feedItem.content, 'mock-feed-item-content');
				});
			});
		});

		describe('.image', () => {
			let mockThumbnailElement;
			let mediaGetter;

			beforeEach(() => {
				mediaGetter = td.func();
				td.when(mediaGetter()).thenReturn([
					{
						image: null
					},
					{
						image: 'mock-media-thumbnail-url',
						title: 'mock-media-title'
					}
				]);
				Object.defineProperty(feedItem, 'media', { get: mediaGetter });
				feedItem.mediaImages = [
					{
						url: 'mock-image-url-1',
						title: 'mock-image-title-1'
					},
					{
						url: 'mock-image-url-2',
						title: 'mock-image-title-2'
					}
				];
				mockThumbnailElement = new MockElement();
				td.when(mockThumbnailElement.getAttributeAsUrl('url')).thenReturn(
					'mock-thumbnail-url'
				);
				td.when(mockItemElement.findElementWithName('thumbnail')).thenReturn(
					mockThumbnailElement
				);
			});

			it('is set to a representation of the first image in the feed item', () => {
				assert.deepEqual(feedItem.image, {
					url: 'mock-image-url-1',
					title: 'mock-image-title-1'
				});
			});

			describe('when there are no images in the feed item but there is another media item with a thumbnail', () => {
				beforeEach(() => {
					feedItem.mediaImages = [];
				});

				it('is set to that media item thumbnail', () => {
					assert.deepEqual(feedItem.image, {
						url: 'mock-media-thumbnail-url',
						title: 'mock-media-title'
					});
				});
			});

			describe('when there are no images or other media in the feed item but there is a thumbnail element', () => {
				beforeEach(() => {
					feedItem.mediaImages = [];
					td.when(mediaGetter()).thenReturn([]);
				});

				it('is set to a representation of the first thumbnail in the feed item', () => {
					assert.deepEqual(feedItem.image, {
						url: 'mock-thumbnail-url',
						title: null
					});
				});
			});

			describe('when there are no images or thumbnail elements', () => {
				beforeEach(() => {
					feedItem.mediaImages = [];
					td.when(mediaGetter()).thenReturn([]);
					td.when(mockItemElement.findElementWithName('thumbnail')).thenReturn(null);
				});

				it('is set to the image property of the base feed item', () => {
					assert.strictEqual(feedItem.image, 'mock-feed-item-image');
				});
			});
		});

		describe('.media', () => {
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
				td.when(mockLinks[0].getAttributeAsUrl('href')).thenReturn(
					'https://mock-url-norel'
				);

				// Link rel alternate
				td.when(mockLinks[1].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn(
					'https://mock-url-alternate'
				);

				// Link rel enclosure
				td.when(mockLinks[2].getAttribute('rel')).thenReturn('enclosure');
				td.when(mockLinks[2].getAttributeAsUrl('href')).thenReturn(
					'https://mock-enclosure-1'
				);
				td.when(mockLinks[2].getAttributeAsNumber('length')).thenReturn(1234);
				td.when(mockLinks[2].getAttribute('type')).thenReturn('image/png');
				td.when(mockLinks[2].getAttribute('title')).thenReturn('enclosure title 1');

				// Link rel enclosure
				td.when(mockLinks[3].getAttribute('rel')).thenReturn('enclosure');
				td.when(mockLinks[3].getAttributeAsUrl('href')).thenReturn(
					'https://mock-enclosure-2'
				);
				td.when(mockLinks[3].getAttributeAsNumber('length')).thenReturn(5678);
				td.when(mockLinks[3].getAttribute('type')).thenReturn('video/mp4');
				td.when(mockLinks[3].getAttribute('title')).thenReturn(null);

				td.when(mockItemElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to an array of objects representing the enclosures found in the item and the base item media', () => {
				assert.deepEqual(feedItem.media, [
					{
						url: 'https://mock-enclosure-1',
						image: 'https://mock-enclosure-1',
						title: 'enclosure title 1',
						length: 1234,
						type: 'image',
						mimeType: 'image/png'
					},
					{
						url: 'https://mock-enclosure-2',
						image: null,
						title: null,
						length: 5678,
						type: 'video',
						mimeType: 'video/mp4'
					},
					{
						url: 'https://mock-feed-item-media-1'
					}
				]);
			});

			describe('when a link does not have a URL', () => {
				beforeEach(() => {
					td.when(mockLinks[3].getAttributeAsUrl('href')).thenReturn(null);
				});

				it('is not included in the media', () => {
					assert.deepEqual(feedItem.media, [
						{
							url: 'https://mock-enclosure-1',
							image: 'https://mock-enclosure-1',
							title: 'enclosure title 1',
							length: 1234,
							type: 'image',
							mimeType: 'image/png'
						},
						{
							url: 'https://mock-feed-item-media-1'
						}
					]);
				});
			});

			describe('when a link does not have a valid numeric length', () => {
				beforeEach(() => {
					td.when(mockLinks[2].getAttributeAsNumber('length')).thenReturn(null);
				});

				it('is has a length property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].length, null);
				});
			});

			describe('when a link does not have a type', () => {
				beforeEach(() => {
					td.when(mockLinks[2].getAttribute('type')).thenReturn(null);
				});

				it('is has a type property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].type, null);
				});

				it('is has a mimeType property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].mimeType, null);
				});
			});

			describe('when an enclosure and base item media has the same URL', () => {
				beforeEach(() => {
					td.when(mockLinks[2].getAttributeAsUrl('href')).thenReturn(
						'https://mock-feed-item-media-1'
					);
				});

				it('deduplicates, favouring the enclosure', () => {
					assert.deepEqual(feedItem.media, [
						{
							url: 'https://mock-feed-item-media-1',
							image: 'https://mock-feed-item-media-1',
							title: 'enclosure title 1',
							length: 1234,
							type: 'image',
							mimeType: 'image/png'
						},
						{
							url: 'https://mock-enclosure-2',
							image: null,
							title: null,
							length: 5678,
							type: 'video',
							mimeType: 'video/mp4'
						}
					]);
				});
			});

			describe('when no link elements or base item media elements exist', () => {
				beforeEach(() => {
					Object.defineProperty(FeedItem.prototype, 'media', { get: () => [] });
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to an empty array', () => {
					assert.deepEqual(feedItem.media, []);
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
				td.when(mockItemElement.findElementsWithName('author')).thenReturn(
					mockAuthorElements
				);

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

				authors = feedItem.authors;
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

					authors = feedItem.authors;
				});

				it('the author urls use the incorrect element', () => {
					assert.strictEqual(authors[0].url, 'mock-author-url');
				});
			});

			describe('when an author element contains only text', () => {
				beforeEach(() => {
					mockAuthorElements = [new MockElement()];
					td.when(mockItemElement.findElementsWithName('author')).thenReturn(
						mockAuthorElements
					);
					mockAuthorElements[0].textContentNormalized = 'mock-author';

					td.when(parseContactString('mock-author')).thenReturn('mock-parsed-author');

					authors = feedItem.authors;
				});

				it('is parsed for URLs, emails, and names', () => {
					td.verify(parseContactString('mock-author'), { times: 1 });
					assert.strictEqual(authors[0], 'mock-parsed-author');
				});
			});

			describe('when an author element contains only text and cannot be parsed', () => {
				beforeEach(() => {
					mockAuthorElements = [new MockElement(), new MockElement()];
					td.when(mockItemElement.findElementsWithName('author')).thenReturn(
						mockAuthorElements
					);
					mockAuthorElements[0].textContentNormalized = 'mock-author';
					mockAuthorElements[1].textContentNormalized = 'mock-author-2';

					td.when(parseContactString('mock-author')).thenReturn(null);
					td.when(parseContactString('mock-author-2')).thenReturn('mock-parsed-author-2');

					authors = feedItem.authors;
				});

				it('is not included', () => {
					assert.deepEqual(authors, ['mock-parsed-author-2']);
				});
			});

			describe('when there are no author elements', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('author')).thenReturn([]);
					authors = feedItem.authors;
				});

				it('is set to the feed author', () => {
					assert.deepEqual(authors, ['mock-feed-author']);
				});
			});
		});
	});
});
