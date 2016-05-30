import Connection from '../Connection';
import MessageReader from '../MessageReader';
import Query from '../Query';
import Result from '../Result';

export const type = 'I';
export default function Parser$EmptyQueryResponse(conn: Connection, reader: MessageReader) {
    const msg = conn._queuePeek();

    if (msg instanceof Query) {
        msg.results.push(new Result());
    } else {
        throw new Error('expected Query instance');
    }
}
