import Connection from '../Connection';
import MessageReader from '../MessageReader';
import Query from '../Query';
import debug from '../debug';

export const type = 'C';
export default function Parser$CommandComplete(conn: Connection, reader: MessageReader) {
    const value = reader.getCString();
    const msg = conn._queuePeek();

    if (msg instanceof Query) {
        msg.peekBack().command = value;
    } else {
        throw new Error('expected Query instance');
    }

    debug.enabled && debug('---', `Parser$CommandComplete value=${value}`);
}
