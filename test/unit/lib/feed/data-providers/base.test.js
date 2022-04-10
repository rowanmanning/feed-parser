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

		describe('.toJSON()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = dataProvider.toJSON.call({
					meta: 'mock-meta',
					language: 'mock-language',
					title: 'mock-title',
					description: 'mock-description',
					link: 'mock-link',
					self: 'mock-self'
				});
			});

			it('returns a JSON representation of the data provider', () => {
				assert.deepEqual(returnValue, {
					meta: 'mock-meta',
					language: 'mock-language',
					title: 'mock-title',
					description: 'mock-description',
					link: 'mock-link',
					self: 'mock-self'
				});
			});

		});

	});

});
