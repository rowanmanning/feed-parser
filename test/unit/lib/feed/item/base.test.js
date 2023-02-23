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

		describe('.title', () => {

			it('throws an error', () => {
				assert.throws(
					() => feedItem.title,
					'FeedItem.title must be implemented in an extending class'
				);
			});

		});

		describe('.toJSON()', () => {
			let mockFeedItem;
			let returnValue;

			beforeEach(() => {
				mockFeedItem = {
					title: 'mock-title'
				};
				returnValue = feedItem.toJSON.call(mockFeedItem);
			});

			it('returns a JSON representation of the feed item', () => {
				assert.deepEqual(returnValue, {
					title: 'mock-title'
				});
			});

		});

	});

});
