'use strict';

const {assert} = require('chai');
const td = require('testdouble');

class MockFeedItem {

	constructor(feed, element) {
		this.feed = feed;
		this.element = element;
	}

}

describe('lib/feed/item/atom', () => {
	let AtomFeedItem;
	let FeedItem;
	let MockElement;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock')();
		FeedItem = td.replace('../../../../../lib/feed/item/base', MockFeedItem);
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

	});

});
