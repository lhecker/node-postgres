import * as fs from 'fs';
import Connection from '../Connection';
import MessageReader from '../MessageReader';

export interface Parser {
    id: number;
    type: string;

    (conn: Connection, reader: MessageReader): void;
}

interface Parsers {
    uint8: Parser[];

    Authentication: Parser;
    BackendKeyData: Parser;
    BindComplete: Parser;
    CloseComplete: Parser;
    CommandComplete: Parser;
    CopyBothResponse: Parser;
    CopyData: Parser;
    CopyDone: Parser;
    CopyInResponse: Parser;
    CopyOutResponse: Parser;
    DataRow: Parser;
    EmptyQueryResponse: Parser;
    ErrorResponse: Parser;
    FunctionCallResponse: Parser;
    Header: Parser;
    NoData: Parser;
    NoticeResponse: Parser;
    NotificationResponse: Parser;
    ParameterDescription: Parser;
    ParameterStatus: Parser;
    ParseComplete: Parser;
    PortalSuspended: Parser;
    ReadyForQuery: Parser;
    RowDescription: Parser;
}

export default (() => {
    const uint8: Parser[] = new Array(256);
    const parsers = {
        uint8,
    };
    let id = 1;

    for (let basename of fs.readdirSync(__dirname)) {
        if (basename.slice(-3) !== '.js' || basename === 'index.js') {
            continue;
        }

        const parser: Parser = require('./' + basename);
        const name = basename.slice(0, -3);
        const type = parser.type.charCodeAt(0);

        console.assert(id <= (1 << 30));
        parser.id = id;

        parsers[name] = parser;
        exports.uint8[type] = parser;

        id <<= 1;
    }

    return parsers as Parsers;
})();
