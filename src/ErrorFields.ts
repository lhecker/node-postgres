/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

export const uint8 = new Array(256);

const perIdentifier = {
    S: 'severity',
    C: 'code',
    M: 'message',
    D: 'detail',
    H: 'hint',
    P: 'position',
    p: 'internalPosition',
    q: 'internalQuery',
    W: 'where',
    s: 'schemaName',
    t: 'tableName',
    c: 'columnName',
    d: 'dataTypeName',
    n: 'constraintName',
    F: 'file',
    L: 'line',
    R: 'routine',
};

for (let key in perIdentifier) {
    const name = perIdentifier[key];
    uint8[key.charCodeAt(0)] = name;
}
