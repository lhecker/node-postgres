'use strict';

const fs = require('fs');
const path = require('path');

const dirname = __dirname + path.sep;

exports.UINT8 = new Array(256);

for (let basename of fs.readdirSync(dirname)) {
	if (basename !== 'index.js') {
		const parser = require(dirname + basename);
		const type = parser.type.charCodeAt(0);

		exports[path.basename(basename, '.js')] = parser;
		exports.UINT8[type] = parser;
	}
}
