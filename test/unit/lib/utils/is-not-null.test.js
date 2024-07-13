'use strict';

const assert = require('node:assert/strict');
const { beforeEach, describe, it } = require('node:test');

describe('lib/utils/is-not-null', () => {
	let isNotNull;

	beforeEach(() => {
		isNotNull = require('../../../../lib/utils/is-not-null').isNotNull;
	});

	it('is a function', () => {
		assert.strictEqual(typeof isNotNull, 'function');
	});

	describe('isNotNull(value)', () => {
		describe('when `value` is `null`', () => {
			it('returns `false`', () => {
				assert.strictEqual(isNotNull(null), false);
			});
		});

		describe('when `value` is not `null`', () => {
			it('returns `true`', () => {
				assert.strictEqual(isNotNull(undefined), true);
				assert.strictEqual(isNotNull(false), true);
				assert.strictEqual(isNotNull(0), true);
				assert.strictEqual(isNotNull(''), true);
				assert.strictEqual(isNotNull([]), true);
			});
		});
	});
});
