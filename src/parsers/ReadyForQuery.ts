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

    debug.enabled && debug('---', `Parser$ReadyForQuery state=${status}`);
}
