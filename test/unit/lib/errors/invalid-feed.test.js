'use strict';

const assert = require('node:assert/strict');

describe('lib/errors/invalid-feed', () => {
	let InvalidFeedError;

	beforeEach(() => {
		InvalidFeedError = require('../../../../lib/errors/invalid-feed');
	});

	describe('new InvalidFeedError(message)', () => {
		let error;

		beforeEach(() => {
			error = new InvalidFeedError('mock message');
		});

		it('is an instance of the Error class', () => {
			assert.ok(error instanceof Error);
		});

		describe('.message', () => {

			it('is set to the passed in message', () => {
				assert.strictEqual(error.message, 'mock message');
			});

		});

		describe('.code', () => {

			it('is set to "INVALID_FEED"', () => {
				assert.strictEqual(error.code, 'INVALID_FEED');
			});

		});

		describe('when `message` is not defined', () => {

			beforeEach(() => {
				error = new InvalidFeedError();
			});

			describe('.message', () => {

				it('is set to a default invalid feed message', () => {
					assert.strictEqual(error.message, 'The XML document could not be parsed as a feed');
				});

			});

		});

	});

});
