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

const debugField = (() => {
    if (!debug.enabled) {
        return undefined;
    }

    const fieldMembers = [
        'name',
        'objectId',
        'attributeNumber',
        'typeId',
        'typeSize',
        'typeModifier',
        'formatCode',
    ];

    const fmts = fieldMembers.map(name => name + '=%o').join(', ');
    const args = fieldMembers.map(name => 'field.' + name).join(', ');
    const fn = new Function('debug', `return function debugField(field) { debug('--- Parser$RowDescription ${fmts}', ${args}); }`);
    return fn(debug) as (field: Field) => void;
})();

export const type = 'T';
export default function Parser$RowDescription(conn: Connection, reader: MessageReader) {
    const fieldCount = reader.getInt16();
    const fields: Field[] = new Array(fieldCount);

    debug.enabled && debug('--- Parser$RowDescription fieldCount=%o', fieldCount);

    for (let i = 0; i < fieldCount; i++) {
        // NOTE: The order of the keys below is obviously important
        const field = {
            name:            reader.getCString(), // field name
            objectId:        reader.getInt32(),   // object id of the table if it's one, otherwise 0
            attributeNumber: reader.getInt16(),   // attribute number of the field if it's one, otherwise 0
            typeId:          reader.getInt32(),   // object id of the data type
            typeSize:        reader.getInt16(),   // size (in bytes) of the data type; negative values denote variable sized types
            typeModifier:    reader.getInt32(),   // type specific modifier
            formatCode:      reader.getInt16(),   // 0 for text, 1 for binary
        };

        fields[i] = field;

        if (debugField) {
            debugField(field);
        }
    }

    conn._pushNewResult(fields);
}
