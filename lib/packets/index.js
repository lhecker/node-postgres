'use strict';

const fs = require('fs');
const path = require('path');

const dirname = __dirname + path.sep;

for (let basename of fs.readdirSync(dirname)) {
	if (basename.slice(-3) === '.js' && basename !== 'index.js') {
		const filename = dirname + basename;
		const packet = require(filename);

		exports[path.basename(basename, '.js')] = packet;
	}
}
