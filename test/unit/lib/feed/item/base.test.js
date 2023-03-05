'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed/item/base', () => {
	let FeedItem;
	let MockElement;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock')();
		FeedItem = require('../../../../../lib/feed/item/base');
	});

	it('is a class constructor', () => {
		assert.isFunction(FeedItem);
		assert.isFunction(FeedItem.prototype.constructor);
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
				assert.isNull(feedItem.id);
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
					assert.isNull(feedItem.title);
				});

			});

		});

		describe('.description', () => {

			it('is set to `null`', () => {
				assert.isNull(feedItem.description);
			});

		});

		describe('.url', () => {

			it('is set to `null`', () => {
				assert.isNull(feedItem.url);
			});

		});

		describe('.published', () => {

			it('is set to `null`', () => {
				assert.isNull(feedItem.published);
			});

		});

		describe('.updated', () => {

			it('is set to `null`', () => {
				assert.isNull(feedItem.updated);
			});

		});

		describe('.content', () => {

			it('is set to `null`', () => {
				assert.isNull(feedItem.content);
			});

		});

		describe('.image', () => {

			it('is set to `null`', () => {
				assert.isNull(feedItem.image);
			});

		});

		describe('.media', () => {

			it('is set to an empty array', () => {
				assert.deepEqual(feedItem.media, []);
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
					assert.isNull(returnValue.published);
					assert.isNull(returnValue.updated);
				});

			});

		});

	});

});
