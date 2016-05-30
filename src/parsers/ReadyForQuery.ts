import Connection from '../Connection';
import MessageReader from '../MessageReader';
import TransactionState from '../TransactionState';
import debug from '../debug';

export const type = 'Z';
export default function Parser$ReadyForQuery(conn: Connection, reader: MessageReader) {
    const status = reader.getUInt8();
    let stateName: string;

    switch (status) {
        case 0x49 /* I */: stateName = 'IDLE'; break;
        case 0x54 /* T */: stateName = 'ONGOING'; break;
        case 0x45 /* E */: stateName = 'FAILED'; break;
        default:
            throw new Error('invalid transaction state');
    }

    conn._transactionState = TransactionState[stateName];
    conn._queueShift().resolve();

    debug.enabled && debug('>>>', `Parser$ReadyForQuery state=${stateName}`);
}
