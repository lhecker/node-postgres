/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as TypeReaders from './TypeReaders';
import Field from './Field';
import MessageReader from './MessageReader';

type RowParser = (reader: MessageReader) => { [key: string]: any };

// By creating a "JIT" parser for each query we improve performance by about 30-35%.
function createRowParser(fields: Field[]): RowParser {
    const p = fields.map(field => (TypeReaders.types[field.typeId] || TypeReaders.DEFAULT)[field.formatCode]);
    const row = fields.map((field, idx) => `'${field.name}':r.parseDataColumn(p[${idx}])`).join(',');
    const body = `return function Parser$DataRow$Custom(r) { return {${row}}; }`;
    const generator = new Function('p', body);
    return generator(p);
}

export default class Result {
    public command: string | undefined;
    public fields: Field[];
    public rows: { [key: string]: any }[];

    private _parser: RowParser;

    public constructor(fields?: Field[]) {
        this.command = undefined;
        this.fields = fields || [];
        this.rows = [];

        if (fields && fields.length) {
            this._parser = createRowParser(fields);
        }
    }

    // must be accessible by Parser$DataRow
    public _parse(reader: MessageReader) {
        this.rows.push(this._parser(reader));
    }
}
