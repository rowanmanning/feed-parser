'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/feed/data-providers', () => {
	let dataProviders;

	beforeEach(() => {
		td.replace('../../../../../lib/feed/data-providers/atom', 'mock-atom');
		td.replace('../../../../../lib/feed/data-providers/base', 'mock-base');
		td.replace('../../../../../lib/feed/data-providers/rss', 'mock-rss');
		dataProviders = require('../../../../../lib/feed/data-providers');
	});

	it('is an object', () => {
		assert.isObject(dataProviders);
	});

	describe('.AtomDataProvider', () => {

		it('aliases lib/feed/data-providers/atom', () => {
			assert.strictEqual(dataProviders.AtomDataProvider, 'mock-atom');
		});

	});

	describe('.DataProvider', () => {

		it('aliases lib/feed/data-providers/base', () => {
			assert.strictEqual(dataProviders.DataProvider, 'mock-base');
		});

	});

	describe('.RssDataProvider', () => {

		it('aliases lib/feed/data-providers/rss', () => {
			assert.strictEqual(dataProviders.RssDataProvider, 'mock-rss');
		});

	});

});
