import Connection from '../Connection';
import MessageReader from '../MessageReader';
import debug from '../debug';

export const type = 'D';
export default function Parser$DataRow(conn: Connection, reader: MessageReader) {
    reader.advance(2); // skip the field count (which we already know)
    conn._currentResult._parse(reader);
}
