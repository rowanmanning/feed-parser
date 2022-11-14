'use strict';

const {assert} = require('chai');

describe('lib/feed-parser', () => {
	let feedParser;

	beforeEach(() => {
		feedParser = require('../../../lib/feed-parser');
	});

	it('is an object', () => {
		assert.isObject(feedParser);
	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(feedParser, feedParser.default);
		});
	});

});
