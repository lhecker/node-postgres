'use strict';

const fs = require('fs');
const path = require('path');

const dirname = __dirname + path.sep;


exports.uint8 = new Array(256);

for (let basename of fs.readdirSync(dirname)) {
	if (basename.slice(-3) === '.js' && basename !== 'index.js') {
		const filename = dirname + basename;
		const parser = require(filename);
		const type = parser.type.charCodeAt(0);

		exports[path.basename(basename, '.js')] = parser;
		exports.uint8[type] = parser;
	}
}
