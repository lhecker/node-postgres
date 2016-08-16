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

    while (true) {
        const type = reader.getUInt8();

        if (type === 0) {
            break;
        }

        const value = reader.getCString();
        const key = ErrorFieldsUint8[type];

        if (key) {
            error[key] = value;
        }

        debug.enabled && debug('--- Parser$ErrorResponse %s(%s)=%o', String.fromCharCode(type), key, value);
    }

    if (query) {
        query.reject(error);
    } else {
        conn.emit('error', error);
    }
}
