'use strict';

const assert = require('node:assert/strict');
const td = require('testdouble');

describe('lib/feed-parser', () => {
	let AtomFeed;
	let Document;
	let InvalidFeedError;
	let parseFeed;
	let RssFeed;

	beforeEach(() => {
		AtomFeed = td.replace('../../../lib/feed/atom', td.constructor());
		Document = td.replace('../../../lib/xml/document', require('../mock/lib/xml/document.mock')());
		InvalidFeedError = td.replace('../../../lib/errors/invalid-feed', td.constructor());
		RssFeed = td.replace('../../../lib/feed/rss', td.constructor());
		parseFeed = require('../../../lib/feed-parser');
	});

	it('is a function', () => {
		assert.strictEqual(typeof parseFeed, 'function');
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(parseFeed, parseFeed.default);
		});
	});

	describe('parseFeed(xmlString)', () => {
		let mockDocument;
		let returnValue;

		beforeEach(() => {
			mockDocument = new Document();
			td.when(Document.fromString('mock-xml')).thenReturn(mockDocument);
			td.when(mockDocument.hasElementWithName(td.matchers.anything())).thenReturn(false);
		});

		describe('when the XML document root element is "feed"', () => {

			beforeEach(() => {
				td.when(mockDocument.hasElementWithName('feed')).thenReturn(true);
				returnValue = parseFeed('mock-xml');
			});

			it('parses the raw XML', () => {
				td.verify(Document.fromString('mock-xml'), {times: 1});
			});

			it('creates an Atom feed with the created XML document', () => {
				td.verify(new AtomFeed(mockDocument), {times: 1});
			});

			it('returns the created Atom feed', () => {
				assert.ok(returnValue instanceof AtomFeed);
			});

		});

		describe('when the XML document root element is "rdf"', () => {

			beforeEach(() => {
				td.when(mockDocument.hasElementWithName('rdf')).thenReturn(true);
				returnValue = parseFeed('mock-xml');
			});

			it('parses the raw XML', () => {
				td.verify(Document.fromString('mock-xml'), {times: 1});
			});

			it('creates an RSS feed with the created XML document', () => {
				td.verify(new RssFeed(mockDocument), {times: 1});
			});

			it('returns the created RSS feed', () => {
				assert.ok(returnValue instanceof RssFeed);
			});

		});

		describe('when the XML document root element is "rss"', () => {

			beforeEach(() => {
				td.when(mockDocument.hasElementWithName('rss')).thenReturn(true);
				returnValue = parseFeed('mock-xml');
			});

			it('parses the raw XML', () => {
				td.verify(Document.fromString('mock-xml'), {times: 1});
			});

			it('creates an RSS feed with the created XML document', () => {
				td.verify(new RssFeed(mockDocument), {times: 1});
			});

			it('returns the created RSS feed', () => {
				assert.ok(returnValue instanceof RssFeed);
			});

		});

		describe('when the XML document root element is not recognised', () => {
			let thrownError;

			beforeEach(() => {
				try {
					parseFeed('mock-xml');
				} catch (error) {
					thrownError = error;
				}
			});

			it('parses the raw XML', () => {
				td.verify(Document.fromString('mock-xml'), {times: 1});
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError(), {times: 1});
				assert.ok(thrownError instanceof InvalidFeedError);
			});

		});

	});

});
