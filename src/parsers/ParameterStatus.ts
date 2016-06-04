import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'S';
export default function Parser$ParameterStatus(conn: Connection, reader: MessageReader) {
    const name = reader.getCString();
    const value = reader.getCString();

    debug.enabled && debug('---', `Parser$ParameterStatus name='${name}' value='${value}'`);

    conn._serverParameters[name] = value;
}
