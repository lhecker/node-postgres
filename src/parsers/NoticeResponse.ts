import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';
import {uint8 as ErrorFieldsUint8} from '../ErrorFields';

export const type = 'N';
export default function Parser$NoticeResponse(conn: Connection, reader: MessageReader) {
    if (conn.listenerCount('notice') === 0) {
        return;
    }

    const notice = new Error('NoticeResponse');

    do {
        const type = reader.getUInt8();
        const value = reader.getCString();

        const key = ErrorFieldsUint8[type];

        if (key) {
            notice[key] = value;
        }

        debug.enabled && debug('---', `Parser$NoticeResponse ${String.fromCharCode(type)}='${value}'`);
    } while (reader.remaining > 1);

    conn.emit('notice', notice);
}
