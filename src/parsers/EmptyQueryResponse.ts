import Connection from '../Connection';
import MessageReader from '../MessageReader';

export const type = 'I';
export default function Parser$EmptyQueryResponse(conn: Connection, reader: MessageReader) {
    // TODO: Is it necessary to add this?
    //   conn._pushNewResult();
}
