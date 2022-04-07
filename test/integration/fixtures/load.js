#!/usr/bin/env node
'use strict';

const axios = require('axios').default;
const path = require('path');
const writeJSON = require('../helpers/write-json');

const request = axios.create({
	baseURL: 'https://sample-feeds.rowanmanning.com',
	timeout: 200
});

(async () => {
	try {
		const [{data: examples}, {data: realWorld}] = await Promise.all([
			request('/examples/list.json'),
			request('/real-world/list.json')
		]);
		await Promise.all([
			writeJSON(path.join(__dirname, 'examples.json'), examples),
			writeJSON(path.join(__dirname, 'real-world.json'), realWorld)
		]);
	} catch (error) {
		console.error('Error loading fixtures', error);
	}
})();
