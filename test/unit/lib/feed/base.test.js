'use strict';

const {assert} = require('chai');

describe('lib/feed/base', () => {
	let Feed;

	beforeEach(() => {
		Feed = require('../../../../lib/feed/base');
	});

	it('is a class constructor', () => {
		assert.isFunction(Feed);
		assert.isFunction(Feed.prototype.constructor);
	});

	describe('new Feed(document)', () => {
		let feed;

		beforeEach(() => {
			feed = new Feed('mock-document');
		});

		describe('.document', () => {

			it('is set to the passed in document', () => {
				assert.strictEqual(feed.document, 'mock-document');
			});

		});

		describe('.element', () => {

			it('is set to the passed in document', () => {
				assert.strictEqual(feed.element, 'mock-document');
			});

		});

		describe('.meta', () => {

			it('is set to an unknown meta object', () => {
				assert.deepEqual(feed.meta, {
					type: 'unknown',
					version: '0'
				});
			});

		});

		describe('.language', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.language);
			});

		});

		describe('.title', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.title);
			});

		});

		describe('.description', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.description);
			});

		});

		describe('.copyright', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.copyright);
			});

		});

		describe('.url', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.url);
			});

		});

		describe('.self', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.self);
			});

		});

		describe('.published', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.published);
			});

		});

		describe('.updated', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.updated);
			});

		});

		describe('.generator', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.generator);
			});

		});

		describe('.image', () => {

			it('is set to `null`', () => {
				assert.isNull(feed.image);
			});

		});

		describe('.items', () => {

			it('is set to an empty array', () => {
				assert.deepEqual(feed.items, []);
			});

		});

		describe('.toJSON()', () => {
			let mockFeed;
			let returnValue;

			beforeEach(() => {
				mockFeed = {
					meta: 'mock-meta',
					language: 'mock-language',
					title: 'mock-title',
					description: 'mock-description',
					copyright: 'mock-copyright',
					url: 'mock-url',
					self: 'mock-self',
					published: new Date('2022-01-01T01:02:03.000Z'),
					updated: new Date('2022-01-01T04:05:06.000Z'),
					generator: 'mock-generator',
					image: 'mock-image',
					items: [{toJSON: () => 'mock-item'}]
				};
				returnValue = feed.toJSON.call(mockFeed);
			});

			it('returns a JSON representation of the feed and content items', () => {
				assert.deepEqual(returnValue, {
					meta: 'mock-meta',
					language: 'mock-language',
					title: 'mock-title',
					description: 'mock-description',
					copyright: 'mock-copyright',
					url: 'mock-url',
					self: 'mock-self',
					published: '2022-01-01T01:02:03.000Z',
					updated: '2022-01-01T04:05:06.000Z',
					generator: 'mock-generator',
					image: 'mock-image',
					items: ['mock-item']
				});
			});

			describe('when publish and updated dates are not set', () => {

				beforeEach(() => {
					mockFeed.published = null;
					mockFeed.updated = null;
					returnValue = feed.toJSON.call(mockFeed);
				});

				it('returns those properties as `null`', () => {
					assert.isNull(returnValue.published);
					assert.isNull(returnValue.updated);
				});

			});

		});

	});

});
