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
import TransactionState from '../TransactionState';
import debug from '../debug';

export const type = 'Z';
export default function Parser$ReadyForQuery(conn: Connection, reader: MessageReader) {
    const status = reader.getUInt8();

    if (!(status in TransactionState)) {
        throw new Error('invalid transaction status');
    }

    conn._transactionState = status as TransactionState;
    conn._queueShift().resolve();

    debug.enabled && debug('---', `Parser$ReadyForQuery state=${TransactionState[status]}`);
}
