import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';
import {uint8 as ErrorFieldsUint8} from '../ErrorFields';

export const type = 'E';
export default function Parser$ErrorResponse(conn: Connection, reader: MessageReader) {
    const query = conn._queuePeekMaybe();
    const error = new Error('ErrorResponse');

    do {
        const type = reader.getUInt8();
        const value = reader.getCString();

        const key = ErrorFieldsUint8[type];

        if (key) {
            error[key] = value;
        }

        debug.enabled && debug('---', `Parser$ErrorResponse ${String.fromCharCode(type)}='${value}'`);
    } while (reader.remaining > 1);

    if (query) {
        query.reject(error);
    } else {
        conn.emit('error', error);
    }
}
