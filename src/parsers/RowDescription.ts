import Connection from '../Connection';
import Field from '../Field';
import MessageReader from '../MessageReader';
import Query from '../Query';
import Result from '../Result';
import debug from '../debug';

export const type = 'T';
export default function Parser$RowDescription(conn: Connection, reader: MessageReader) {
    const fieldCount = reader.getInt16();
    const fields: Field[] = new Array(fieldCount);

    debug.enabled && debug('---', `Parser$RowDescription fieldCount=${fieldCount}`);

    for (let i = 0; i < fieldCount; i++) {
        // NOTE: The order of the keys below is obviously important
        const field = {
            name: reader.getCString(),
            objectId: reader.getInt32(),
            attributeNumber: reader.getInt16(),
            typeId: reader.getInt32(),
            typeSize: reader.getInt16(),
            typeModifier: reader.getInt32(),
            formatCode: reader.getInt16(),
        };

        fields.push(field);
        debug.enabled && debug('---', `Parser$RowDescription ${Object.keys(field).map(key => `${key}=${field[key]}`)}`);
    }

    const msg = conn._queuePeek();

    if (msg instanceof Query) {
        msg.results.push(new Result(fields));
    } else {
        throw new Error('expected Query instance');
    }
}
