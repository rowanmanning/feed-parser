'use strict';

const { writeFile } = require('node:fs/promises');

module.exports = function writeJSON(filePath, data) {
	return writeFile(filePath, JSON.stringify(data, null, '\t'));
};
