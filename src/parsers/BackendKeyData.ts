import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'K';
export default function Parser$BackendKeyData(conn: Connection, reader: MessageReader) {
    conn._serverProcessId = reader.getInt32();
    conn._serverSecretKey = reader.getInt32();

    debug.enabled && debug('>>>', `Parser$BackendKeyData processId="${conn._serverProcessId}" secretKey="${conn._serverSecretKey}"`);
}
