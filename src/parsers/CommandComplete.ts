import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'C';
export default function Parser$CommandComplete(conn: Connection, reader: MessageReader) {
    const value = reader.getCString();

    conn._currentResult.command = value;

    debug.enabled && debug('---', `Parser$CommandComplete value=${value}`);
}
