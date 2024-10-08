'use strict';

const { afterEach, beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const td = require('testdouble');

td.config({ ignoreWarnings: true });

describe('lib/feed/item/rss', () => {
	let FeedItem;
	let MockElement;
	let parseContactString;
	let RssFeedItem;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock').createMock();
		FeedItem = td.replace('../../../../../lib/feed/item/base', {
			FeedItem: require('../../../mock/lib/feed/item/base.mock').createMock()
		}).FeedItem;
		parseContactString = td.replace('../../../../../lib/utils/parse-contact-string', {
			parseContactString: td.func()
		}).parseContactString;
		RssFeedItem = require('../../../../../lib/feed/item/rss').RssFeedItem;
	});

	afterEach(() => td.reset());

	it('is a class constructor', () => {
		assert.strictEqual(typeof RssFeedItem, 'function');
		assert.strictEqual(typeof RssFeedItem.prototype.constructor, 'function');
	});

	describe('new RssFeedItem(feed, element)', () => {
		let feedItem;
		let mockItemElement;
		let mockFeed;

		beforeEach(() => {
			mockFeed = {
				authors: ['mock-feed-author'],
				categories: ['mock-feed-category']
			};
			mockItemElement = new MockElement();
			feedItem = new RssFeedItem(mockFeed, mockItemElement);
		});

		it('is an instance of the FeedItem class', () => {
			assert.ok(feedItem instanceof FeedItem);
		});

		describe('.id', () => {
			let mockGuidElement;

			beforeEach(() => {
				mockGuidElement = new MockElement();
				mockGuidElement.textContentNormalized = 'mock-guid';
				td.when(mockItemElement.findElementWithName('guid')).thenReturn(mockGuidElement);
			});

			it('is set to the text of the first guid element found in the feed item', () => {
				assert.strictEqual(feedItem.id, 'mock-guid');
			});

			describe('when a guid element does not exist', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('guid')).thenReturn(null);
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
			let mockDescriptionElement;

			beforeEach(() => {
				mockDescriptionElement = new MockElement();
				mockDescriptionElement.textContentNormalized = 'mock description text';
				td.when(mockItemElement.findElementWithName('description')).thenReturn(
					mockDescriptionElement
				);
			});

			it('is set to the text of the first description element found in the feed item', () => {
				assert.strictEqual(feedItem.description, 'mock description text');
			});

			describe('when a description element does not exist', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('description')).thenReturn(null);
				});

				it('is set to the description property of the base feed item', () => {
					assert.strictEqual(feedItem.description, 'mock-feed-item-description');
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
				mockLinks[1].textContentAsUrl = 'https://mock-url-1';

				// Link with text
				mockLinks[2].textContentNormalized = 'mock-text-2';
				mockLinks[2].textContentAsUrl = 'https://mock-url-2';

				td.when(mockItemElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to text of the first link element with text content found in the feed', () => {
				assert.strictEqual(feedItem.url, 'https://mock-url-1/');
			});

			describe('when the link is relative', () => {
				beforeEach(() => {
					mockFeed.url = 'https://mock-feed';
					mockLinks[1].textContentAsUrl = '/mock-path';
				});

				it('is resolved against the feed URL', () => {
					assert.strictEqual(feedItem.url, 'https://mock-feed/mock-path');
				});
			});

			describe('when the link is relative but the feed has no URL', () => {
				beforeEach(() => {
					mockFeed.url = null;
					mockLinks[1].textContentAsUrl = '/mock-path';
				});

				it('is set to the relative URL', () => {
					assert.strictEqual(feedItem.url, '/mock-path');
				});
			});

			describe('when no links have text content', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([
						mockLinks[0]
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
				td.when(mockItemElement.findElementWithName('pubdate')).thenReturn(mockElement);
			});

			it('is set to the text of the first pubdate element found in the feed item', () => {
				assert.strictEqual(feedItem.published, 'mock published date');
			});

			describe('when a pubdate element does not exist but a date element does', () => {
				beforeEach(() => {
					mockElement.textContentAsDate = 'mock date';
					td.when(mockItemElement.findElementWithName('pubdate')).thenReturn(null);
					td.when(mockItemElement.findElementWithName('date')).thenReturn(mockElement);
				});

				it('is set to the text of the first date element found in the feed item', () => {
					assert.strictEqual(feedItem.published, 'mock date');
				});
			});

			describe('when neither element exists', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('pubdate')).thenReturn(null);
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
				mockElement.textContentAsDate = 'mock date';
				td.when(mockItemElement.findElementWithName('date')).thenReturn(mockElement);
			});

			it('is set to the text of the first date element found in the feed item', () => {
				assert.strictEqual(feedItem.updated, 'mock date');
			});

			describe('when a date element does not exist', () => {
				beforeEach(() => {
					Object.defineProperty(feedItem, 'published', {
						get: () => 'mock published date'
					});
					td.when(mockItemElement.findElementWithName('date')).thenReturn(null);
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
					td.when(mockItemElement.findElementWithName('date')).thenReturn(null);
				});

				it('is set to the value of the feedItem `published` property', () => {
					assert.strictEqual(feedItem.updated, 'mock published date');
				});
			});
		});

		describe('.content', () => {
			let mockContentEncodedElement;

			beforeEach(() => {
				mockContentEncodedElement = new MockElement();
				mockContentEncodedElement.namespace = 'content';
				mockContentEncodedElement.textContentNormalized = 'mock content text';
				td.when(mockItemElement.findElementWithName('encoded')).thenReturn(
					mockContentEncodedElement
				);
			});

			it('is set to the text of the first content:encoded element found in the feed item', () => {
				assert.strictEqual(feedItem.content, 'mock content text');
			});

			describe('when the content:encoded element has no content', () => {
				beforeEach(() => {
					mockContentEncodedElement.textContentNormalized = '';
				});

				it('is set to the content property of the base feed item', () => {
					assert.strictEqual(feedItem.content, 'mock-feed-item-content');
				});
			});

			describe('when an encoded element exists but with no content namespace', () => {
				beforeEach(() => {
					mockContentEncodedElement.namespace = 'nope';
				});

				it('is set to the content property of the base feed item', () => {
					assert.strictEqual(feedItem.content, 'mock-feed-item-content');
				});
			});

			describe('when a content:encoded element does not exist', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('encoded')).thenReturn(null);
				});

				it('is set to the content property of the base feed item', () => {
					assert.strictEqual(feedItem.content, 'mock-feed-item-content');
				});
			});
		});

		describe('.image', () => {
			let mediaGetter;
			let mockImageElement;
			let mockItunesImageElement;
			let mockThumbnailElement;
			let mockTitleElement;
			let mockUrlElement;

			beforeEach(() => {
				mockImageElement = new MockElement();
				mockTitleElement = new MockElement();
				mockUrlElement = new MockElement();
				mockTitleElement.textContentNormalized = 'mock image title';
				mockUrlElement.textContentAsUrl = 'mock-image-url';
				td.when(mockImageElement.findElementWithName('title')).thenReturn(mockTitleElement);
				td.when(mockImageElement.findElementWithName('url')).thenReturn(mockUrlElement);

				mockItunesImageElement = new MockElement();
				mockItunesImageElement.namespace = 'itunes';
				td.when(mockItunesImageElement.getAttributeAsUrl('href')).thenReturn(
					'mock-itunes-image-url'
				);

				td.when(mockItemElement.findElementsWithName('image')).thenReturn([
					mockImageElement,
					mockItunesImageElement
				]);

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

				mockThumbnailElement = new MockElement();
				td.when(mockThumbnailElement.getAttributeAsUrl('url')).thenReturn(
					'mock-thumbnail-url'
				);
				td.when(mockItemElement.findElementWithName('thumbnail')).thenReturn(
					mockThumbnailElement
				);
			});

			it('is set to an object containing the title and URL of the first image element found in the feed item', () => {
				assert.deepEqual(feedItem.image, {
					title: 'mock image title',
					url: 'mock-image-url'
				});
			});

			describe('when a image element has a URL but no title', () => {
				beforeEach(() => {
					td.when(mockImageElement.findElementWithName('title')).thenReturn(null);
				});

				it('is set to an object containing the URL of the image element and a `null` title', () => {
					assert.deepEqual(feedItem.image, {
						title: null,
						url: 'mock-image-url'
					});
				});
			});

			describe('when a image element has a title but no URL', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('image')).thenReturn([
						mockImageElement
					]);
					td.when(mockImageElement.findElementWithName('url')).thenReturn(null);
					feedItem.mediaImages = [];
					td.when(mediaGetter()).thenReturn([]);
					td.when(mockItemElement.findElementWithName('thumbnail')).thenReturn(null);
				});

				it('is set to the image property of the base feed item', () => {
					assert.strictEqual(feedItem.image, 'mock-feed-item-image');
				});
			});

			describe('when a regular image element does not exist but an itunes one does', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('image')).thenReturn([
						mockItunesImageElement
					]);
				});

				it('is set to an object containing the URL of the first itunes:image element found in the feed item', () => {
					assert.deepEqual(feedItem.image, {
						title: null,
						url: 'mock-itunes-image-url'
					});
				});
			});

			describe('when no images exist but media images do', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('image')).thenReturn([]);
				});

				it('is set to a representation of the first image in the feed item', () => {
					assert.deepEqual(feedItem.image, {
						url: 'mock-image-url-1',
						title: 'mock-image-title-1'
					});
				});
			});

			describe('when there are no images in the feed item but there is another media item with a thumbnail', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('image')).thenReturn([]);
					feedItem.mediaImages = [];
				});

				it('is set to that media item thumbnail', () => {
					assert.deepEqual(feedItem.image, {
						url: 'mock-media-thumbnail-url',
						title: 'mock-media-title'
					});
				});
			});

			describe('when there are no images or media in the feed item but there is a thumbnail element', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('image')).thenReturn([]);
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

			describe('when no image, media, or thumbnail exists', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('image')).thenReturn([]);
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
			let mockEnclosures;

			beforeEach(() => {
				mockEnclosures = [new MockElement(), new MockElement()];

				mockEnclosures[0].name = 'enclosure';
				td.when(mockEnclosures[0].getAttributeAsUrl('url')).thenReturn(
					'https://mock-enclosure-1'
				);
				td.when(mockEnclosures[0].getAttributeAsNumber('length')).thenReturn(1234);
				td.when(mockEnclosures[0].getAttribute('type')).thenReturn('image/png');

				mockEnclosures[1].name = 'enclosure';
				td.when(mockEnclosures[1].getAttributeAsUrl('url')).thenReturn(
					'https://mock-enclosure-2'
				);
				td.when(mockEnclosures[1].getAttributeAsNumber('length')).thenReturn(5678);
				td.when(mockEnclosures[1].getAttribute('type')).thenReturn('video/mp4');

				td.when(mockItemElement.findElementsWithName('enclosure')).thenReturn(
					mockEnclosures
				);
			});

			it('is set to an array of objects representing the enclosures found in the item and the base item media', () => {
				assert.deepEqual(feedItem.media, [
					{
						url: 'https://mock-enclosure-1',
						image: 'https://mock-enclosure-1',
						title: null,
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

			describe('when an enclosure does not have a URL', () => {
				beforeEach(() => {
					td.when(mockEnclosures[1].getAttributeAsUrl('url')).thenReturn(null);
				});

				it('is not included in the media', () => {
					assert.deepEqual(feedItem.media, [
						{
							url: 'https://mock-enclosure-1',
							image: 'https://mock-enclosure-1',
							title: null,
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

			describe('when an enclosure does not have a valid numeric length', () => {
				beforeEach(() => {
					td.when(mockEnclosures[0].getAttributeAsNumber('length')).thenReturn(null);
				});

				it('is has a length property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].length, null);
				});
			});

			describe('when an enclosure does not have a type', () => {
				beforeEach(() => {
					td.when(mockEnclosures[0].getAttribute('type')).thenReturn(null);
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
					td.when(mockEnclosures[0].getAttributeAsUrl('url')).thenReturn(
						'https://mock-feed-item-media-1'
					);
				});

				it('deduplicates, favouring the enclosure', () => {
					assert.deepEqual(feedItem.media, [
						{
							url: 'https://mock-feed-item-media-1',
							image: 'https://mock-feed-item-media-1',
							title: null,
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

			describe('when no enclosure elements or base item media elements exist', () => {
				beforeEach(() => {
					Object.defineProperty(FeedItem.prototype, 'media', { get: () => [] });
					td.when(mockItemElement.findElementsWithName('enclosure')).thenReturn([]);
				});

				it('is set to an empty array', () => {
					assert.deepEqual(feedItem.media, []);
				});
			});
		});

		describe('.authors', () => {
			let authors;

			beforeEach(() => {
				const mockAuthorElements = [new MockElement(), new MockElement()];
				mockAuthorElements[0].textContentNormalized = 'mock-author-1';
				mockAuthorElements[1].textContentNormalized = 'mock-author-2';
				td.when(mockItemElement.findElementsWithName('author')).thenReturn(
					mockAuthorElements
				);

				const mockCreatorElement = [new MockElement(), new MockElement()];
				mockCreatorElement[0].textContentNormalized = 'mock-creator-1';
				mockCreatorElement[1].textContentNormalized = 'mock-creator-2';
				td.when(mockItemElement.findElementsWithName('creator')).thenReturn(
					mockCreatorElement
				);

				td.when(parseContactString('mock-author-1')).thenReturn('mock-parsed-author-1');
				td.when(parseContactString('mock-author-2')).thenReturn('mock-parsed-author-2');
				td.when(parseContactString('mock-creator-1')).thenReturn('mock-parsed-creator-1');
				td.when(parseContactString('mock-creator-2')).thenReturn('mock-parsed-creator-2');

				authors = feedItem.authors;
			});

			it('parses each author element', () => {
				td.verify(parseContactString('mock-author-1'), { times: 1 });
				td.verify(parseContactString('mock-author-2'), { times: 1 });
				td.verify(parseContactString('mock-creator-1'), { times: 1 });
				td.verify(parseContactString('mock-creator-2'), { times: 1 });
			});

			it('is set to an array of parsed author objects', () => {
				assert.ok(Array.isArray(authors));
				assert.strictEqual(authors.length, 4);
				assert.deepEqual(authors, [
					'mock-parsed-author-1',
					'mock-parsed-author-2',
					'mock-parsed-creator-1',
					'mock-parsed-creator-2'
				]);
			});

			describe('when an author element cannot be parsed', () => {
				beforeEach(() => {
					td.when(parseContactString('mock-author-1')).thenReturn(null);
					authors = feedItem.authors;
				});

				it('is not included', () => {
					assert.deepEqual(authors, [
						'mock-parsed-author-2',
						'mock-parsed-creator-1',
						'mock-parsed-creator-2'
					]);
				});
			});

			describe('when there are no author elements', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('author')).thenReturn([]);
					td.when(mockItemElement.findElementsWithName('creator')).thenReturn([]);
					authors = feedItem.authors;
				});

				it('is set to the feed author', () => {
					assert.deepEqual(authors, ['mock-feed-author']);
				});
			});
		});

		describe('.categories', () => {
			let categories;
			let mockCategoryElements;
			let mockSubjectElements;

			beforeEach(() => {
				mockCategoryElements = [
					new MockElement(),
					new MockElement(),
					new MockElement(),
					new MockElement(),
					new MockElement(),
					new MockElement()
				];
				td.when(mockItemElement.findElementsWithName('category')).thenReturn(
					mockCategoryElements
				);

				mockSubjectElements = [new MockElement(), new MockElement()];
				td.when(mockItemElement.findElementsWithName('subject')).thenReturn(
					mockSubjectElements
				);

				mockCategoryElements[0].textContentNormalized = 'mock-category-text';
				td.when(mockCategoryElements[0].getAttribute('domain')).thenReturn(
					'https://mock-category-domain'
				);
				td.when(mockCategoryElements[0].getAttributeAsUrl('domain')).thenReturn(
					'mock-category-domain-as-url'
				);

				mockCategoryElements[1].textContentNormalized = 'mock-category-text';
				td.when(mockCategoryElements[1].getAttribute('domain')).thenReturn(
					'http://mock-category-domain'
				);
				td.when(mockCategoryElements[1].getAttributeAsUrl('domain')).thenReturn(
					'mock-category-domain-as-url'
				);

				mockCategoryElements[2].textContentNormalized = 'mock-category-text';
				td.when(mockCategoryElements[2].getAttribute('domain')).thenReturn(
					'mock-category-domain'
				);

				mockCategoryElements[3].textContentNormalized = 'mock-category-text';

				td.when(mockCategoryElements[4].getAttribute('domain')).thenReturn(
					'https://mock-category-domain'
				);
				td.when(mockCategoryElements[4].getAttributeAsUrl('domain')).thenReturn(
					'mock-category-domain-as-url'
				);

				mockSubjectElements[0].textContentNormalized = 'mock-subject-text';

				categories = feedItem.categories;
			});

			it('is set to an array of category objects, ignoring ones that do not have text', () => {
				assert.ok(Array.isArray(categories));
				assert.strictEqual(categories.length, 5);
				assert.deepEqual(categories, [
					{
						term: 'mock-category-text',
						label: 'mock-category-text',
						url: 'mock-category-domain-as-url'
					},
					{
						term: 'mock-category-text',
						label: 'mock-category-text',
						url: 'mock-category-domain-as-url'
					},
					{
						term: 'mock-category-text',
						label: 'mock-category-text',
						url: null
					},
					{
						term: 'mock-category-text',
						label: 'mock-category-text',
						url: null
					},
					{
						term: 'mock-subject-text',
						label: 'mock-subject-text',
						url: null
					}
				]);
			});

			describe('when there are no category elements', () => {
				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('category')).thenReturn([]);
					td.when(mockItemElement.findElementsWithName('subject')).thenReturn([]);
					categories = feedItem.categories;
				});

				it('is set to the feed categories', () => {
					assert.deepEqual(categories, ['mock-feed-category']);
				});
			});
		});
	});
});
