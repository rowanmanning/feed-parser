'use strict';

const { writeFile } = require('node:fs/promises');

function writeJSON(filePath, data) {
	return writeFile(filePath, JSON.stringify(data, null, '\t'));
}

exports.writeJSON = writeJSON;
