import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'K';
export default function Parser$BackendKeyData(conn: Connection, reader: MessageReader) {
    const processId = reader.getInt32();
    const secretKey = reader.getInt32();

    debug.enabled && debug('>>>', `Parser$BackendKeyData processId="${processId}" secretKey="${secretKey}"`);

    conn._serverProcessId = processId;
    conn._serverSecretKey = secretKey;
}
