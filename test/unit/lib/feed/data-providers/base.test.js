'use strict';

const {assert} = require('chai');

describe('lib/feed/data-providers/base', () => {
	let DataProvider;

	beforeEach(() => {
		DataProvider = require('../../../../../lib/feed/data-providers/base');
	});

	it('is a class constructor', () => {
		assert.isFunction(DataProvider);
		assert.isFunction(DataProvider.prototype.constructor);
	});

	describe('new DataProvider(document)', () => {
		let dataProvider;

		beforeEach(() => {
			dataProvider = new DataProvider('mock-document');
		});

		describe('.document', () => {

			it('is set to the passed in document', () => {
				assert.strictEqual(dataProvider.document, 'mock-document');
			});

		});

		describe('.meta', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.meta,
					'DataProvider.meta must be implemented in an extending class'
				);
			});

		});

		describe('.language', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.language,
					'DataProvider.language must be implemented in an extending class'
				);
			});

		});

		describe('.title', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.title,
					'DataProvider.title must be implemented in an extending class'
				);
			});

		});

		describe('.description', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.description,
					'DataProvider.description must be implemented in an extending class'
				);
			});

		});

		describe('.copyright', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.copyright,
					'DataProvider.copyright must be implemented in an extending class'
				);
			});

		});

		describe('.link', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.link,
					'DataProvider.link must be implemented in an extending class'
				);
			});

		});

		describe('.self', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.self,
					'DataProvider.self must be implemented in an extending class'
				);
			});

		});

		describe('.published', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.published,
					'DataProvider.published must be implemented in an extending class'
				);
			});

		});

		describe('.updated', () => {

			it('throws an error', () => {
				assert.throws(
					() => dataProvider.updated,
					'DataProvider.updated must be implemented in an extending class'
				);
			});

		});

		describe('.toJSON()', () => {
			let mockDataProvider;
			let returnValue;

			beforeEach(() => {
				mockDataProvider = {
					meta: 'mock-meta',
					language: 'mock-language',
					title: 'mock-title',
					description: 'mock-description',
					copyright: 'mock-copyright',
					link: 'mock-link',
					self: 'mock-self',
					published: new Date('2022-01-01T01:02:03.000Z'),
					updated: new Date('2022-01-01T04:05:06.000Z')
				};
				returnValue = dataProvider.toJSON.call(mockDataProvider);
			});

			it('returns a JSON representation of the data provider', () => {
				assert.deepEqual(returnValue, {
					meta: 'mock-meta',
					language: 'mock-language',
					title: 'mock-title',
					description: 'mock-description',
					copyright: 'mock-copyright',
					link: 'mock-link',
					self: 'mock-self',
					published: '2022-01-01T01:02:03.000Z',
					updated: '2022-01-01T04:05:06.000Z'
				});
			});

			describe('when publish and updated dates are not set', () => {

				beforeEach(() => {
					mockDataProvider.published = null;
					mockDataProvider.updated = null;
					returnValue = dataProvider.toJSON.call(mockDataProvider);
				});

				it('returns those properties as `null`', () => {
					assert.isNull(returnValue.published);
					assert.isNull(returnValue.updated);
				});

			});

		});

	});

});
