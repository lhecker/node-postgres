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

export const type = 's';
export default function Parser$PortalSuspended(conn: Connection, reader: MessageReader) {
    // This message type is generated if the row count limit of a Execute message is reached.
    // This limit is currently infinite though.
    throw new Error('unimplemented');
}
