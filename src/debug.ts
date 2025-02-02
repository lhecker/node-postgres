/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

const debug = require('debug');

export interface Debugger {
    (arg1: any, ...args: any[]): void;
    enabled: boolean;
    namespace: string;
}

export default debug('postgres') as Debugger;
