/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import Connection from '../Connection';
import Field from '../Field';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'T';
export default function Parser$RowDescription(conn: Connection, reader: MessageReader) {
    const fieldCount = reader.getInt16();
    const fields: Field[] = new Array(fieldCount);

    debug.enabled && debug('---', `Parser$RowDescription fieldCount=${fieldCount}`);

    for (let i = 0; i < fieldCount; i++) {
        // NOTE: The order of the keys below is obviously important
        const field = {
            name: reader.getCString(),
            objectId: reader.getInt32(),
            attributeNumber: reader.getInt16(),
            typeId: reader.getInt32(),
            typeSize: reader.getInt16(),
            typeModifier: reader.getInt32(),
            formatCode: reader.getInt16(),
        };

        fields[i] = field;

        if (debug.enabled) {
            const props = Object.keys(field).map(key => `${key}=${field[key]}`).join(' ');
            debug('---', `Parser$RowDescription field ${props}`);
        }
    }

    conn._pushNewResult(fields);
}
