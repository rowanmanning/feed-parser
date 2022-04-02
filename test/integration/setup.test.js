'use strict';

const express = require('express');
const path = require('path');

let server;

before(done => {
	const app = global.app = express();
	app.use(express.static(path.join(__dirname, 'fixtures')));
	server = app.listen(() => {
		const {port} = global.server.address();
		global.fixtureBaseUrl = `http://localhost:${port}`;
		done();
	});
});

after(done => {
	server.close(done);
});
