#!/usr/bin/env node
'use strict';

const path = require('node:path');
const writeJSON = require('../helpers/write-json');

const request = async (url) => {
	const response = await fetch(new URL(url, 'https://sample-feeds.rowanmanning.com'));
	return response.json();
};

(async () => {
	try {
		const [examples, realWorld] = await Promise.all([
			request('/examples/list.json'),
			request('/real-world/list.json')
		]);
		await Promise.all([
			writeJSON(path.join(__dirname, 'examples.json'), examples),
			writeJSON(path.join(__dirname, 'real-world.json'), realWorld)
		]);
	} catch (error) {
		// biome-ignore lint/nursery/noConsole: only used in the tests
		console.error('Error loading fixtures:', error.message);
	}
})();
