'use strict';

const {assert} = require('chai');

describe('lib/feed/item/base', () => {
	let FeedItem;

	beforeEach(() => {
		FeedItem = require('../../../../../lib/feed/item/base');
	});

	it('is a class constructor', () => {
		assert.isFunction(FeedItem);
		assert.isFunction(FeedItem.prototype.constructor);
	});

	describe('new FeedItem(feed, element)', () => {
		let feedItem;

		beforeEach(() => {
			feedItem = new FeedItem('mock-feed', 'mock-element');
		});

		describe('.feed', () => {

			it('is set to the passed in feed', () => {
				assert.strictEqual(feedItem.feed, 'mock-feed');
			});

		});

		describe('.element', () => {

			it('is set to the passed in element', () => {
				assert.strictEqual(feedItem.element, 'mock-element');
			});

		});

		describe('.id', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.id,
					'FeedItem.id must be implemented in an extending class'
				);
			});

		});

		describe('.title', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.title,
					'FeedItem.title must be implemented in an extending class'
				);
			});

		});

		describe('.description', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.description,
					'FeedItem.description must be implemented in an extending class'
				);
			});

		});

		describe('.url', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.url,
					'FeedItem.url must be implemented in an extending class'
				);
			});

		});

		describe('.published', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.published,
					'FeedItem.published must be implemented in an extending class'
				);
			});

		});

		describe('.updated', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.updated,
					'FeedItem.updated must be implemented in an extending class'
				);
			});

		});

		describe('.content', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.content,
					'FeedItem.content must be implemented in an extending class'
				);
			});

		});

		describe('.image', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.image,
					'FeedItem.image must be implemented in an extending class'
				);
			});

		});

		describe('.media', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.media,
					'FeedItem.media must be implemented in an extending class'
				);
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
