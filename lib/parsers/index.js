'use strict';

const fs = require('fs');
const path = require('path');


exports.uint8 = new Array(256);


const dirname = __dirname + path.sep;
let id = 1;

fs.readdirSync(dirname).forEach((basename) => {
	if (basename.slice(-3) === '.js' && basename !== 'index.js') {
		const filename = dirname + basename;
		const parser = require(filename);
		const type = parser.type;

		exports[path.basename(basename, '.js')] = parser;

		if (type) {
			console.assert(id <= (1 << 30));
			parser.id = id;

			id <<= 1;

			exports.uint8[type.charCodeAt(0)] = parser;
		}
	}
});
