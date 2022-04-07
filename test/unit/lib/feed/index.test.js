'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed', () => {
	let AtomDataProvider;
	let Feed;
	let feedModule;
	let InvalidFeedError;
	let RssDataProvider;
	let xml;

	beforeEach(() => {
		AtomDataProvider = td.constructor();
		RssDataProvider = td.constructor();
		td.replace('../../../../lib/feed/data-providers', {
			AtomDataProvider,
			RssDataProvider
		});
		InvalidFeedError = td.replace('../../../../lib/feed/errors/invalid-feed', td.constructor());
		xml = td.replace('../../../../lib/xml', {
			Document: require('../../mock/lib/xml/document.mock')()
		});
		feedModule = require('../../../../lib/feed');
		Feed = feedModule.Feed;
	});

	describe('.Feed', () => {

		it('is a class constructor', () => {
			assert.isFunction(Feed);
			assert.isFunction(Feed.prototype.constructor);
		});

		describe('new Feed(dataProvider)', () => {
			let feed;
			let mockDataProvider;

			beforeEach(() => {
				mockDataProvider = {
					toJSON: td.func()
				};
				td.when(mockDataProvider.toJSON()).thenReturn('mock-json');
				feed = new Feed(mockDataProvider);
			});

			describe('.dataProvider', () => {

				it('is set to the passed in data provider', () => {
					assert.strictEqual(feed.dataProvider, mockDataProvider);
				});

			});

			describe('.toJSON()', () => {
				let returnValue;

				beforeEach(() => {
					returnValue = feed.toJSON();
				});

				it('defers to the data provider toJSON method', () => {
					td.verify(mockDataProvider.toJSON(), {times: 1});
					assert.strictEqual(returnValue, 'mock-json');
				});

			});

		});

		describe('.fromString(xmlString)', () => {
			let mockDocument;
			let returnValue;
			let thrownError;

			beforeEach(() => {
				mockDocument = new xml.Document();
				td.when(mockDocument.hasElementWithName('feed')).thenReturn(false);
				td.when(mockDocument.hasElementWithName('rss')).thenReturn(false);
				td.when(xml.Document.fromString('mock-xml')).thenReturn(mockDocument);
				try {
					returnValue = Feed.fromString('mock-xml');
				} catch (error) {
					thrownError = error;
				}
			});

			it('creates a document from the XML string', () => {
				td.verify(xml.Document.fromString('mock-xml'), {times: 1});
			});

			it('throws an invalid feed error', () => {
				td.verify(new InvalidFeedError(), {times: 1});
				assert.instanceOf(thrownError, InvalidFeedError);
			});

			describe('when the XML string has a top level `feed` element', () => {

				beforeEach(() => {
					td.when(mockDocument.hasElementWithName('feed')).thenReturn(true);
					returnValue = Feed.fromString('mock-xml');
				});

				it('creates a new Atom data provider with the XML document', () => {
					td.verify(new AtomDataProvider(mockDocument), {times: 1});
				});

				it('Returns a new Feed instance created with the Atom data provider', () => {
					assert.instanceOf(returnValue, Feed);
					assert.instanceOf(returnValue.dataProvider, AtomDataProvider);
				});

			});

			describe('when the XML string has a top level `rdf` element', () => {

				beforeEach(() => {
					td.when(mockDocument.hasElementWithName('rdf')).thenReturn(true);
					returnValue = Feed.fromString('mock-xml');
				});

				it('creates a new Rss data provider with the XML document', () => {
					td.verify(new RssDataProvider(mockDocument), {times: 1});
				});

				it('Returns a new Feed instance created with the Rss data provider', () => {
					assert.instanceOf(returnValue, Feed);
					assert.instanceOf(returnValue.dataProvider, RssDataProvider);
				});

			});

			describe('when the XML string has a top level `rss` element', () => {

				beforeEach(() => {
					td.when(mockDocument.hasElementWithName('rss')).thenReturn(true);
					returnValue = Feed.fromString('mock-xml');
				});

				it('creates a new Rss data provider with the XML document', () => {
					td.verify(new RssDataProvider(mockDocument), {times: 1});
				});

				it('Returns a new Feed instance created with the Rss data provider', () => {
					assert.instanceOf(returnValue, Feed);
					assert.instanceOf(returnValue.dataProvider, RssDataProvider);
				});

			});

		});

	});

	describe('.AtomDataProvider', () => {

		it('aliases lib/feed/data-providers/atom', () => {
			assert.strictEqual(feedModule.AtomDataProvider, AtomDataProvider);
		});

	});

	describe('.RssDataProvider', () => {

		it('aliases lib/feed/data-providers/rss', () => {
			assert.strictEqual(feedModule.RssDataProvider, RssDataProvider);
		});

	});

	describe('.DATA_PROVIDER_BY_ROOT_ELEMENT', () => {

		it('contains key/value mappings of root elements to data provider classes', () => {
			assert.isObject(Feed.DATA_PROVIDER_BY_ROOT_ELEMENT);
			assert.strictEqual(Feed.DATA_PROVIDER_BY_ROOT_ELEMENT.feed, AtomDataProvider);
			assert.strictEqual(Feed.DATA_PROVIDER_BY_ROOT_ELEMENT.rdf, RssDataProvider);
			assert.strictEqual(Feed.DATA_PROVIDER_BY_ROOT_ELEMENT.rss, RssDataProvider);
		});

	});

});
