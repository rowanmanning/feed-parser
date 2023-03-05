'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed/item/atom', () => {
	let AtomFeedItem;
	let FeedItem;
	let MockElement;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock')();
		FeedItem = td.replace('../../../../../lib/feed/item/base', require('../../../mock/lib/feed/item/base.mock')());
		AtomFeedItem = require('../../../../../lib/feed/item/atom');
	});

	it('is a class constructor', () => {
		assert.isFunction(AtomFeedItem);
		assert.isFunction(AtomFeedItem.prototype.constructor);
	});

	describe('new AtomFeedItem(feed, element)', () => {
		let feedItem;
		let mockItemElement;
		let mockFeed;

		beforeEach(() => {
			mockFeed = {};
			mockItemElement = new MockElement();
			feedItem = new AtomFeedItem(mockFeed, mockItemElement);
		});

		it('is an instance of the FeedItem class', () => {
			assert.instanceOf(feedItem, FeedItem);
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
				td.when(mockItemElement.findElementWithName('summary')).thenReturn(mockSummaryElement);
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
				td.when(mockLinks[0].getAttributeAsUrl('href')).thenReturn('https://mock-url-norel');

				// Link rel alternate
				td.when(mockLinks[1].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn('https://mock-url-alternate');

				// Link rel self
				td.when(mockLinks[2].getAttribute('rel')).thenReturn('self');
				td.when(mockLinks[2].getAttributeAsUrl('href')).thenReturn('https://mock-url-self');

				// Link rel invalid
				td.when(mockLinks[3].getAttribute('rel')).thenReturn('invalid');
				td.when(mockLinks[3].getAttributeAsUrl('href')).thenReturn('https://mock-url-invalid');

				// Link rel alternate
				td.when(mockLinks[4].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[4].getAttributeAsUrl('href')).thenReturn('https://mock-url-alternate-2');

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
					Object.defineProperty(feedItem, 'published', {get: () => 'mock published date'});
					Object.defineProperty(FeedItem.prototype, 'updated', {get: () => null});
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
				td.when(mockItemElement.findElementWithName('content')).thenReturn(mockContentElement);
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
						td.when(mockContentElement.findElementWithName('div')).thenReturn(mockDivElement);
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

			beforeEach(() => {
				feedItem.mediaImages = [
					{
						url: 'mock-image-url-1',
						length: 1234,
						type: 'image',
						mimeType: 'image/png'
					},
					{
						url: 'mock-image-url-2',
						length: 4567,
						type: 'image',
						mimeType: 'image/jpg'
					}
				];
				mockThumbnailElement = new MockElement();
				td.when(mockThumbnailElement.getAttributeAsUrl('url')).thenReturn('mock-thumbnail-url');
				td.when(mockItemElement.findElementWithName('thumbnail')).thenReturn(mockThumbnailElement);
			});

			it('is set to a representation of the first image in the feed item', () => {
				assert.deepEqual(feedItem.image, {
					url: 'mock-image-url-1',
					title: null
				});
			});

			describe('when there are no images in the feed item but there is a thumbnail element', () => {

				beforeEach(() => {
					feedItem.mediaImages = [];
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
				td.when(mockLinks[0].getAttributeAsUrl('href')).thenReturn('https://mock-url-norel');

				// Link rel alternate
				td.when(mockLinks[1].getAttribute('rel')).thenReturn('alternate');
				td.when(mockLinks[1].getAttributeAsUrl('href')).thenReturn('https://mock-url-alternate');

				// Link rel enclosure
				td.when(mockLinks[2].getAttribute('rel')).thenReturn('enclosure');
				td.when(mockLinks[2].getAttributeAsUrl('href')).thenReturn('https://mock-enclosure-1');
				td.when(mockLinks[2].getAttributeAsNumber('length')).thenReturn(1234);
				td.when(mockLinks[2].getAttribute('type')).thenReturn('image/png');

				// Link rel enclosure
				td.when(mockLinks[3].getAttribute('rel')).thenReturn('enclosure');
				td.when(mockLinks[3].getAttributeAsUrl('href')).thenReturn('https://mock-enclosure-2');
				td.when(mockLinks[3].getAttributeAsNumber('length')).thenReturn(5678);
				td.when(mockLinks[3].getAttribute('type')).thenReturn('video/mp4');

				td.when(mockItemElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to an array of objects representing the enclosures found in the item', () => {
				assert.deepEqual(feedItem.media, [
					{
						url: 'https://mock-enclosure-1',
						length: 1234,
						type: 'image',
						mimeType: 'image/png'
					},
					{
						url: 'https://mock-enclosure-2',
						length: 5678,
						type: 'video',
						mimeType: 'video/mp4'
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
							length: 1234,
							type: 'image',
							mimeType: 'image/png'
						}
					]);
				});

			});

			describe('when a link does not have a valid numeric length', () => {

				beforeEach(() => {
					td.when(mockLinks[2].getAttributeAsNumber('length')).thenReturn(null);
				});

				it('is has a length property set to `null`', () => {
					assert.isNull(feedItem.media[0].length);
				});

			});

			describe('when a link does not have a type', () => {

				beforeEach(() => {
					td.when(mockLinks[2].getAttribute('type')).thenReturn(null);
				});

				it('is has a type property set to `null`', () => {
					assert.isNull(feedItem.media[0].type);
				});

				it('is has a mimeType property set to `null`', () => {
					assert.isNull(feedItem.media[0].mimeType);
				});

			});

			describe('when no link elements exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to an empty array', () => {
					assert.deepEqual(feedItem.media, []);
				});

			});

		});

	});

});
