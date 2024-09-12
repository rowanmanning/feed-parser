'use strict';

const { afterEach, beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const td = require('testdouble');

td.config({ ignoreWarnings: true });

describe('lib/parse-feed', () => {
	let AtomFeed;
	let Document;
	let InvalidFeedError;
	let parseFeed;
	let RssFeed;

	beforeEach(() => {
		AtomFeed = td.replace('../../../lib/feed/atom', { AtomFeed: td.constructor() }).AtomFeed;
		Document = td.replace('../../../lib/xml/document', {
			Document: require('../mock/lib/xml/document.mock').createMock()
		}).Document;
		InvalidFeedError = td.replace('../../../lib/errors/invalid-feed', {
			InvalidFeedError: td.constructor()
		}).InvalidFeedError;
		RssFeed = td.replace('../../../lib/feed/rss', { RssFeed: td.constructor() }).RssFeed;
		parseFeed = require('../../../lib/parse-feed').parseFeed;
	});

	afterEach(() => td.reset());

	it('is a function', () => {
		assert.strictEqual(typeof parseFeed, 'function');
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
				td.verify(Document.fromString('mock-xml'), { times: 1 });
			});

			it('creates an Atom feed with the created XML document', () => {
				td.verify(new AtomFeed(mockDocument), { times: 1 });
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
				td.verify(Document.fromString('mock-xml'), { times: 1 });
			});

			it('creates an RSS feed with the created XML document', () => {
				td.verify(new RssFeed(mockDocument), { times: 1 });
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
				td.verify(Document.fromString('mock-xml'), { times: 1 });
			});

			it('creates an RSS feed with the created XML document', () => {
				td.verify(new RssFeed(mockDocument), { times: 1 });
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
				td.verify(Document.fromString('mock-xml'), { times: 1 });
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError(), { times: 1 });
				assert.ok(thrownError instanceof InvalidFeedError);
			});
		});
	});
});
