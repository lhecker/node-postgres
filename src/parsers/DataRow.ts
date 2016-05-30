import Connection from '../Connection';
import MessageReader from '../MessageReader';
import Query from '../Query';
import debug from '../debug';

export const type = 'D';
export default function Parser$DataRow(conn: Connection, reader: MessageReader) {
    reader.advance(2); // skip the field count

    const msg = conn._queuePeek();

    if (msg instanceof Query) {
        const result = msg.peekBack();
        result.rows.push(result._parser(reader));
    } else {
        throw new Error('expected Query instance');
    }
}
