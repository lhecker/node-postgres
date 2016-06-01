import Connection from '../Connection';
import MessageReader from '../MessageReader';

export const type = 's';
export default function Parser$PortalSuspended(conn: Connection, reader: MessageReader) {
    // This message type is generated if the row count limit of a Execute message is reached.
    // This limit is currently infinite though.
    throw new Error('unimplemented');
}
