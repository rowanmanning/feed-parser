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

		describe('.meta', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.meta,
					'Feed.meta must be implemented in an extending class'
				);
			});

		});

		describe('.language', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.language,
					'Feed.language must be implemented in an extending class'
				);
			});

		});

		describe('.title', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.title,
					'Feed.title must be implemented in an extending class'
				);
			});

		});

		describe('.description', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.description,
					'Feed.description must be implemented in an extending class'
				);
			});

		});

		describe('.copyright', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.copyright,
					'Feed.copyright must be implemented in an extending class'
				);
			});

		});

		describe('.url', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.url,
					'Feed.url must be implemented in an extending class'
				);
			});

		});

		describe('.self', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.self,
					'Feed.self must be implemented in an extending class'
				);
			});

		});

		describe('.published', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.published,
					'Feed.published must be implemented in an extending class'
				);
			});

		});

		describe('.updated', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.updated,
					'Feed.updated must be implemented in an extending class'
				);
			});

		});

		describe('.generator', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.generator,
					'Feed.generator must be implemented in an extending class'
				);
			});

		});

		describe('.image', () => {

			it('throws an error', () => {
				assert.throws(
					() => feed.image,
					'Feed.image must be implemented in an extending class'
				);
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
					image: 'mock-image'
				};
				returnValue = feed.toJSON.call(mockFeed);
			});

			it('returns a JSON representation of the feed', () => {
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
					image: 'mock-image'
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
