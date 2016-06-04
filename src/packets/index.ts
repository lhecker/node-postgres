import * as fs from 'fs';
import * as path from 'path';

const dirname = __dirname + path.sep;

fs.readdirSync(dirname).forEach((basename) => {
    if (basename.slice(-3) === '.js' && basename !== 'index.js') {
        const filename = dirname + basename;
        const packet = require(filename).default;

        exports[path.basename(basename, '.js')] = packet;
    }
});
