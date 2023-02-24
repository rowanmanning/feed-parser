'use strict';

const {assert} = require('chai');
const td = require('testdouble');

class MockFeedItem {

	constructor(feed, element) {
		this.feed = feed;
		this.element = element;
	}

}

describe('lib/feed/item/rss', () => {
	let FeedItem;
	let MockElement;
	let RssFeedItem;

	beforeEach(() => {
		MockElement = require('../../../mock/lib/xml/element.mock')();
		FeedItem = td.replace('../../../../../lib/feed/item/base', MockFeedItem);
		RssFeedItem = require('../../../../../lib/feed/item/rss');
	});

	it('is a class constructor', () => {
		assert.isFunction(RssFeedItem);
		assert.isFunction(RssFeedItem.prototype.constructor);
	});

	describe('new RssFeedItem(feed, element)', () => {
		let feedItem;
		let mockItemElement;
		let mockFeed;

		beforeEach(() => {
			mockFeed = {};
			mockItemElement = new MockElement();
			feedItem = new RssFeedItem(mockFeed, mockItemElement);
		});

		it('is an instance of the FeedItem class', () => {
			assert.instanceOf(feedItem, FeedItem);
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

				it('is set to `null`', () => {
					assert.isNull(feedItem.id);
				});

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
			let mockDescriptionElement;

			beforeEach(() => {
				mockDescriptionElement = new MockElement();
				mockDescriptionElement.textContentNormalized = 'mock description text';
				td.when(mockItemElement.findElementWithName('description')).thenReturn(mockDescriptionElement);
			});

			it('is set to the text of the first description element found in the feed item', () => {
				assert.strictEqual(feedItem.description, 'mock description text');
			});

			describe('when a description element does not exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('description')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.description);
				});

			});

		});

		describe('.url', () => {
			let mockLinks;

			beforeEach(() => {
				mockLinks = [
					new MockElement(),
					new MockElement(),
					new MockElement()
				];

				// Link with no text
				mockLinks[0].textContentNormalized = '';
				mockLinks[0].textContentAsUrl = '';

				// Link with text
				mockLinks[1].textContentNormalized = 'mock-text-1';
				mockLinks[1].textContentAsUrl = 'mock-url-1';

				// Link with text
				mockLinks[2].textContentNormalized = 'mock-text-2';
				mockLinks[2].textContentAsUrl = 'mock-url-2';

				td.when(mockItemElement.findElementsWithName('link')).thenReturn(mockLinks);
			});

			it('is set to text of the first link element with text content found in the feed', () => {
				assert.strictEqual(feedItem.url, 'mock-url-1');
			});

			describe('when no links have text content', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([
						mockLinks[0]
					]);
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.url);
				});

			});

			describe('when no link elements exists', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementsWithName('link')).thenReturn([]);
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.url);
				});

			});

		});

	});

});
