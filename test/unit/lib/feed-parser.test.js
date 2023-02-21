'use strict';

const {assert} = require('chai');

describe('lib/feed-parser', () => {
	let parseFeed;

	beforeEach(() => {
		parseFeed = require('../../../lib/feed-parser');
	});

	it('is a function', () => {
		assert.isFunction(parseFeed);
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(parseFeed, parseFeed.default);
		});
	});

});
