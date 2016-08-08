/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

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
