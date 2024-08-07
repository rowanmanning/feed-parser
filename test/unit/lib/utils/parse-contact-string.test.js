'use strict';

const assert = require('node:assert/strict');
const { beforeEach, describe, it } = require('node:test');
const contactStringTestCases = require('./parse-contact-string.data').testCases;

describe('lib/utils/parse-contact-string', () => {
	let parseContactString;

	beforeEach(() => {
		parseContactString =
			require('../../../../lib/utils/parse-contact-string').parseContactString;
	});

	it('is a function', () => {
		assert.strictEqual(typeof parseContactString, 'function');
	});

	describe('parseContactString(value)', () => {
		for (const { description, expectedOutput, input } of contactStringTestCases) {
			describe(`when \`value\` is ${description}`, () => {
				it('returns the expected contact details', () => {
					assert.deepEqual(parseContactString(input), expectedOutput);
				});
			});
		}
	});
});
