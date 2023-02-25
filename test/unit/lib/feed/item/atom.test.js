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

				it('is set to `null`', () => {
					assert.isNull(feedItem.published);
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

				it('is set to `null`', () => {
					assert.isNull(feedItem.updated);
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

			describe('when a content element does not exist', () => {

				beforeEach(() => {
					td.when(mockItemElement.findElementWithName('content')).thenReturn(null);
				});

				it('is set to `null`', () => {
					assert.isNull(feedItem.content);
				});

			});

		});

	});

});
