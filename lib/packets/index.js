'use strict';

const fs = require('fs');
const path = require('path');

const dirname = __dirname + path.sep;

for (let basename of fs.readdirSync(dirname)) {
	if (basename !== 'index.js') {
		const packet = require(dirname + basename);

		exports[path.basename(basename, '.js')] = packet;
	}
}
