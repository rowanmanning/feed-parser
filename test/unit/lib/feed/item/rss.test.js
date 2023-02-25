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

				it('is set to `null`', () => {
					assert.isNull(feedItem.published);
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

			describe('when a modified element does not exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('date')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.updated);
				});

			});

		});

		describe('.content', () => {
			let mockContentEncodedElement;

			beforeEach(() => {
				mockContentEncodedElement = new MockElement();
				mockContentEncodedElement.namespace = 'content';
				mockContentEncodedElement.textContentNormalized = 'mock content text';
				td.when(mockItemElement.findElementWithName('encoded')).thenReturn(mockContentEncodedElement);
			});

			it('is set to the text of the first content:encoded element found in the feed item', () => {
				assert.strictEqual(feedItem.content, 'mock content text');
			});

			describe('when the content:encoded element has no content', () => {

				beforeEach(() => {
					mockContentEncodedElement.textContentNormalized = '';
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.content);
				});

			});

			describe('when an encoded element exists but with no content namespace', () => {

				beforeEach(() => {
					mockContentEncodedElement.namespace = 'nope';
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.content);
				});

			});

			describe('when a content:encoded element does not exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('encoded')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.content);
				});

			});

		});

	});

});
