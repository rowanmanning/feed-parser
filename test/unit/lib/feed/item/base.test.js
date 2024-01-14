'use strict';

const assert = require('node:assert/strict');
const td = require('testdouble');

describe('lib/feed/item/base', () => {
	let FeedItem;
	let MockElement;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock')();
		FeedItem = require('../../../../../lib/feed/item/base');
	});

	it('is a class constructor', () => {
		assert.strictEqual(typeof FeedItem, 'function');
		assert.strictEqual(typeof FeedItem.prototype.constructor, 'function');
	});

	describe('new FeedItem(feed, element)', () => {
		let feedItem;
		let mockItemElement;

		beforeEach(() => {
			mockItemElement = new MockElement();
			feedItem = new FeedItem('mock-feed', mockItemElement);
		});

		describe('.feed', () => {

			it('is set to the passed in feed', () => {
				assert.strictEqual(feedItem.feed, 'mock-feed');
			});

		});

		describe('.element', () => {

			it('is set to the passed in element', () => {
				assert.strictEqual(feedItem.element, mockItemElement);
			});

		});

		describe('.id', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.id, null);
			});

		});

		describe('.title', () => {
			let mockTitleElement;

			beforeEach(() => {
				mockTitleElement = new MockElement();
				mockTitleElement.textContentNormalized = 'mock title text';
				td.when(mockItemElement.findElementWithName('title')).thenReturn(mockTitleElement);
			});

			it('is set to the text of the first title element found in the feed item', () => {
				assert.strictEqual(feedItem.title, 'mock title text');
			});

			describe('when a title element does not exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('title')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.strictEqual(feedItem.title, null);
				});

			});

		});

		describe('.description', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.description, null);
			});

		});

		describe('.url', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.url, null);
			});

		});

		describe('.published', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.published, null);
			});

		});

		describe('.updated', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.updated, null);
			});

		});

		describe('.content', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.content, null);
			});

		});

		describe('.image', () => {

			it('is set to `null`', () => {
				assert.strictEqual(feedItem.image, null);
			});

		});

		describe('.media', () => {
			let mockGroupMedia;
			let mockMedia;

			beforeEach(() => {
				const mockGroupElement = new MockElement();
				mockGroupElement.namespaceUri = 'http://search.yahoo.com/mrss/';

				mockMedia = [
					new MockElement(),
					new MockElement()
				];
				mockGroupMedia = [
					new MockElement()
				];

				mockMedia[0].namespaceUri = 'http://search.yahoo.com/mrss/';
				mockMedia[0].name = 'content';
				td.when(mockMedia[0].getAttributeAsUrl('url')).thenReturn('https://mock-media-1');
				td.when(mockMedia[0].getAttributeAsNumber('length')).thenReturn(1234);
				td.when(mockMedia[0].getAttributeAsNumber('filesize')).thenReturn(2345);
				td.when(mockMedia[0].getAttribute('type')).thenReturn('image/png');
				td.when(mockMedia[0].getAttribute('medium')).thenReturn('mock-medium-1');

				mockGroupMedia[0].namespaceUri = 'http://search.yahoo.com/mrss/';
				mockGroupMedia[0].name = 'content';
				td.when(mockGroupMedia[0].getAttributeAsUrl('url')).thenReturn('https://mock-media-2');
				td.when(mockGroupMedia[0].getAttributeAsNumber('length')).thenReturn(5678);
				td.when(mockGroupMedia[0].getAttribute('type')).thenReturn('video/mp4');
				td.when(mockGroupMedia[0].getAttribute('medium')).thenReturn('mock-medium-2');

				// Not a valid media:content element - no namespace
				mockMedia[1].name = 'content';
				td.when(mockMedia[1].getAttributeAsUrl('url')).thenReturn('https://mock-media-3');

				td.when(mockItemElement.findElementsWithName('content')).thenReturn(mockMedia);
				td.when(mockItemElement.findElementsWithName('group')).thenReturn([mockGroupElement]);
				td.when(mockGroupElement.findElementsWithName('content')).thenReturn(mockGroupMedia);
			});

			it('is set to an array of objects representing the media found in the item', () => {
				assert.deepEqual(feedItem.media, [
					{
						url: 'https://mock-media-1',
						image: null,
						title: null,
						length: 1234,
						type: 'mock-medium-1',
						mimeType: 'image/png'
					},
					{
						url: 'https://mock-media-2',
						image: null,
						title: null,
						length: 5678,
						type: 'mock-medium-2',
						mimeType: 'video/mp4'
					}
				]);
			});

			describe('when a media:content element has a media:thumbnail sibling', () => {
				let mockThumbnailElement;

				beforeEach(() => {
					mockThumbnailElement = new MockElement();
					mockThumbnailElement.namespaceUri = 'http://search.yahoo.com/mrss/';
					td.when(mockThumbnailElement.getAttributeAsUrl('url')).thenReturn('https://mock-thumbnail');
					mockMedia[0].parent = new MockElement();
					td.when(mockMedia[0].parent.findElementWithName('thumbnail')).thenReturn(mockThumbnailElement);
				});

				it('is has an image property set to the thumbnail URL', () => {
					assert.strictEqual(feedItem.media[0].image, 'https://mock-thumbnail');
				});

				describe('when the thumbnail does not have a URL', () => {

					beforeEach(() => {
						td.when(mockThumbnailElement.getAttributeAsUrl('url')).thenReturn(null);
					});

					it('is has an image property set to `null`', () => {
						assert.strictEqual(feedItem.media[0].image, null);
					});

				});

			});

			describe('when a media:content element does not have a media:thumbnail sibling but it has a medium or type of "image"', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttribute('medium')).thenReturn('image');
					td.when(mockGroupMedia[0].getAttribute('medium')).thenReturn(null);
					td.when(mockGroupMedia[0].getAttribute('type')).thenReturn('image/png');
				});

				it('is has an image property set to the media item URL', () => {
					assert.strictEqual(feedItem.media[0].image, 'https://mock-media-1');
					assert.strictEqual(feedItem.media[1].image, 'https://mock-media-2');
				});

			});

			describe('when a media:content element contains a media:title element', () => {
				let mockTitleElement;

				beforeEach(() => {
					mockTitleElement = new MockElement();
					mockTitleElement.namespaceUri = 'http://search.yahoo.com/mrss/';
					mockTitleElement.textContentNormalized = 'mock title';
					td.when(mockMedia[0].findElementWithName('title')).thenReturn(mockTitleElement);
				});

				it('is has a title property set to the title content', () => {
					assert.strictEqual(feedItem.media[0].title, 'mock title');
				});

				describe('when the title does not have any text', () => {

					beforeEach(() => {
						mockTitleElement.textContentNormalized = '';
					});

					it('is has an title property set to `null`', () => {
						assert.strictEqual(feedItem.media[0].title, null);
					});

				});

			});

			describe('when a media:content has a sibling media:title element', () => {
				let mockTitleElement;

				beforeEach(() => {
					mockTitleElement = new MockElement();
					mockTitleElement.namespaceUri = 'http://search.yahoo.com/mrss/';
					mockTitleElement.textContentNormalized = 'mock title';
					mockMedia[0].parent = new MockElement();
					td.when(mockMedia[0].parent.findElementWithName('title')).thenReturn(mockTitleElement);
				});

				it('is has a title property set to the title content', () => {
					assert.strictEqual(feedItem.media[0].title, 'mock title');
				});

				describe('when the title does not have any text', () => {

					beforeEach(() => {
						mockTitleElement.textContentNormalized = '';
					});

					it('is has an title property set to `null`', () => {
						assert.strictEqual(feedItem.media[0].title, null);
					});

				});

			});

			describe('when a media:content element contains a media:description element', () => {
				let mockDescriptionElement;

				beforeEach(() => {
					mockDescriptionElement = new MockElement();
					mockDescriptionElement.namespaceUri = 'http://search.yahoo.com/mrss/';
					mockDescriptionElement.textContentNormalized = 'mock description';
					td.when(mockMedia[0].findElementWithName('description')).thenReturn(mockDescriptionElement);
				});

				it('is has a title property set to the title content', () => {
					assert.strictEqual(feedItem.media[0].title, 'mock description');
				});

				describe('when the title does not have any text', () => {

					beforeEach(() => {
						mockDescriptionElement.textContentNormalized = '';
					});

					it('is has an title property set to `null`', () => {
						assert.strictEqual(feedItem.media[0].title, null);
					});

				});

			});

			describe('when a media:content has a sibling media:description element', () => {
				let mockDescriptionElement;

				beforeEach(() => {
					mockDescriptionElement = new MockElement();
					mockDescriptionElement.namespaceUri = 'http://search.yahoo.com/mrss/';
					mockDescriptionElement.textContentNormalized = 'mock description';
					mockMedia[0].parent = new MockElement();
					td.when(mockMedia[0].parent.findElementWithName('description')).thenReturn(mockDescriptionElement);
				});

				it('is has a title property set to the title content', () => {
					assert.strictEqual(feedItem.media[0].title, 'mock description');
				});

				describe('when the title does not have any text', () => {

					beforeEach(() => {
						mockDescriptionElement.textContentNormalized = '';
					});

					it('is has an title property set to `null`', () => {
						assert.strictEqual(feedItem.media[0].title, null);
					});

				});

			});

			describe('when a media:content does not have a URL', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttributeAsUrl('url')).thenReturn(null);
				});

				it('is not included in the media', () => {
					assert.deepEqual(feedItem.media, [
						{
							url: 'https://mock-media-2',
							image: null,
							title: null,
							length: 5678,
							type: 'mock-medium-2',
							mimeType: 'video/mp4'
						}
					]);
				});

			});

			describe('when a media:content does not have a valid numeric length', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttributeAsNumber('length')).thenReturn(null);
				});

				it('is has a length property set to the value of the filesize attribute', () => {
					assert.strictEqual(feedItem.media[0].length, 2345);
				});

			});

			describe('when a media:content does not have a valid numeric length or filesize', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttributeAsNumber('length')).thenReturn(null);
					td.when(mockMedia[0].getAttributeAsNumber('filesize')).thenReturn(null);
				});

				it('is has a length property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].length, null);
				});

			});

			describe('when a media:content does not have a medium', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttribute('medium')).thenReturn(null);
				});

				it('is has a type property set to the first part of the mimetype', () => {
					assert.strictEqual(feedItem.media[0].type, 'image');
				});

			});

			describe('when a media:content does not have a type', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttribute('type')).thenReturn(null);
				});

				it('is has a mimeType property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].mimeType, null);
				});

			});

			describe('when a media:content does not have a medium or type', () => {

				beforeEach(() => {
					td.when(mockMedia[0].getAttribute('medium')).thenReturn(null);
					td.when(mockMedia[0].getAttribute('type')).thenReturn(null);
				});

				it('is has a type property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].type, null);
				});

				it('is has a mimeType property set to `null`', () => {
					assert.strictEqual(feedItem.media[0].mimeType, null);
				});

			});

			describe('when no media elements exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('content')).thenReturn([]);
					td.when(mockItemElement.findElementsWithName('group')).thenReturn([]);
				});

				it('is set to an empty array', () => {
					assert.deepEqual(feedItem.media, []);
				});

			});

		});

		describe('.mediaAudio', () => {

			beforeEach(() => {
				Object.defineProperty(feedItem, 'media', {
					get: () => [
						{
							url: 'https://example-media-1',
							type: 'audio'
						},
						{
							url: 'https://example-media-2',
							type: 'image'
						},
						{
							url: 'https://example-media-3',
							type: 'video'
						}
					]
				});
			});

			it('returns an array containing only audio media items', () => {
				assert.deepEqual(feedItem.mediaAudio, [
					{
						url: 'https://example-media-1',
						type: 'audio'
					}
				]);
			});

		});

		describe('.mediaImages', () => {

			beforeEach(() => {
				Object.defineProperty(feedItem, 'media', {
					get: () => [
						{
							url: 'https://example-media-1',
							type: 'audio'
						},
						{
							url: 'https://example-media-2',
							type: 'image'
						},
						{
							url: 'https://example-media-3',
							type: 'video'
						}
					]
				});
			});

			it('returns an array containing only image media items', () => {
				assert.deepEqual(feedItem.mediaImages, [
					{
						url: 'https://example-media-2',
						type: 'image'
					}
				]);
			});

		});

		describe('.mediaVideos', () => {

			beforeEach(() => {
				Object.defineProperty(feedItem, 'media', {
					get: () => [
						{
							url: 'https://example-media-1',
							type: 'audio'
						},
						{
							url: 'https://example-media-2',
							type: 'image'
						},
						{
							url: 'https://example-media-3',
							type: 'video'
						}
					]
				});
			});

			it('returns an array containing only video media items', () => {
				assert.deepEqual(feedItem.mediaVideos, [
					{
						url: 'https://example-media-3',
						type: 'video'
					}
				]);
			});

		});

		describe('.toJSON()', () => {
			let mockFeedItem;
			let returnValue;

			beforeEach(() => {
				mockFeedItem = {
					id: 'mock-id',
					title: 'mock-title',
					description: 'mock-description',
					url: 'mock-url',
					published: new Date('2022-01-01T01:02:03.000Z'),
					updated: new Date('2022-01-01T04:05:06.000Z'),
					content: 'mock-content',
					image: 'mock-image',
					media: 'mock-media'
				};
				returnValue = feedItem.toJSON.call(mockFeedItem);
			});

			it('returns a JSON representation of the feed item', () => {
				assert.deepEqual(returnValue, {
					id: 'mock-id',
					title: 'mock-title',
					description: 'mock-description',
					url: 'mock-url',
					published: '2022-01-01T01:02:03.000Z',
					updated: '2022-01-01T04:05:06.000Z',
					content: 'mock-content',
					image: 'mock-image',
					media: 'mock-media'
				});
			});

			describe('when publish and updated dates are not set', () => {

				beforeEach(() => {
					mockFeedItem.published = null;
					mockFeedItem.updated = null;
					returnValue = feedItem.toJSON.call(mockFeedItem);
				});

				it('returns those properties as `null`', () => {
					assert.strictEqual(returnValue.published, null);
					assert.strictEqual(returnValue.updated, null);
				});

			});

		});

	});

});
