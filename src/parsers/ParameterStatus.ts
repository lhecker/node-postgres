/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'S';
export default function Parser$ParameterStatus(conn: Connection, reader: MessageReader) {
    const name = reader.getCString();
    const value = reader.getCString();

    debug.enabled && debug('---', `Parser$ParameterStatus name='${name}' value='${value}'`);

    conn._serverParameters[name] = value;
}
