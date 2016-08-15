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
import { uint8 as ErrorFieldsUint8 } from '../ErrorFields';

export const type = 'E';
export default function Parser$ErrorResponse(conn: Connection, reader: MessageReader) {
    const query = conn._queuePeekMaybe();
    const error = new Error('ErrorResponse');

    do {
        const type = reader.getUInt8();
        const value = reader.getCString();

        const key = ErrorFieldsUint8[type];

        if (key) {
            error[key] = value;
        }

        debug.enabled && debug('--- Parser$ErrorResponse %o=%o', String.fromCharCode(type), value);
    } while (reader.remaining > 1);

    if (query) {
        query.reject(error);
    } else {
        conn.emit('error', error);
    }
}
