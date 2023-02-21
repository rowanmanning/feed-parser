'use strict';

const {assert} = require('chai');
const feed = require('../../lib/feed');
const fetch = require('../../lib/utils/fetch');
const path = require('path');
const writeJSON = require('./helpers/write-json');

const suites = [
	{
		name: 'Example feeds',
		snapshotPath: 'examples',
		tests: require('./fixtures/examples.json')
	},
	{
		name: 'Real-world feeds',
		snapshotPath: 'real-world',
		tests: require('./fixtures/real-world.json')
	}
];

for (const suite of suites) {
	describe(suite.name, () => {
		for (const test of suite.tests) {

			describe(test.title, () => {
				let actual;
				let expected;
				let xml;

				before(async () => {

					// Get the actual result
					actual = {
						title: test.title,
						hash: test.hash,
						url: test.urls.feed
					};
					try {
						const response = await fetch(test.urls.feed);
						xml = await response.text();
						actual.feed = feed.fromString(xml).toJSON();
					} catch (error) {
						actual.error = {
							code: error.code,
							message: error.message
						};
					}

					// Get the expected result
					const expectedFilePath = path.resolve(__dirname, 'snapshots', suite.snapshotPath, `${test.hash}.json`);
					try {
						if (process.env.OVERWRITE_SNAPSHOTS) {
							throw new Error('Overwriting Snapshots');
						}
						expected = require(expectedFilePath);
					} catch (error) {
						await writeJSON(expectedFilePath, actual);
						expected = actual;
					}

				});

				it('parses into the expected object', () => {
					assert.deepEqual(actual, expected);
				});

			});

		}
	});
}
