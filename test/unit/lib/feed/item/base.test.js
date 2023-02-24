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

		describe('.toJSON()', () => {
			let mockFeedItem;
			let returnValue;

			beforeEach(() => {
				mockFeedItem = {
					id: 'mock-id',
					title: 'mock-title',
					description: 'mock-description',
					url: 'mock-url'
				};
				returnValue = feedItem.toJSON.call(mockFeedItem);
			});

			it('returns a JSON representation of the feed item', () => {
				assert.deepEqual(returnValue, {
					id: 'mock-id',
					title: 'mock-title',
					description: 'mock-description',
					url: 'mock-url'
				});
			});

		});

	});

});
