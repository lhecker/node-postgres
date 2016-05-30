import * as TypeReaders from './TypeReaders';
import Field from './Field';


// By creating a "JIT" parser for each query we improve performance by about 30-35%.
function createRowParser(fields: Field[]): Function {
    const p = fields.map(field => (TypeReaders.types[field.typeId] || TypeReaders.DEFAULT)[field.formatCode]);
    const row = fields.map((field, idx) => `${field.name}:r.parseDataColumn(p[${idx}])`).join(',');
    const body = `return function Parser$DataRow$Custom(r) { return {${row}}; }`;
    const generator = new Function('p', body);
    return generator(p);
}


export default class Result {
    command: string;
    fields: Field[];
    rows: { [key: string]: any }[];

    _parser: Function;

    constructor(fields?: Field[]) {
        this.command = undefined;
        this.fields = fields || [];
        this.rows = [];

        if (fields && fields.length) {
            this._parser = createRowParser(fields);
        }
    }
}
