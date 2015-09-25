'use strict';

const debug = require('../debug');
const Types = require('../Types');


class Row {
	constructor(reader, fields) {
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			const length = reader.getInt32();
			let value = null;

			if (length >= 0) {
				const parsers = Types[field.typeId] || Types.default;

				value = reader.getBytes(length);

				if (parsers) {
					value = parsers[field.formatCode](value);
				}
			}

			this[field.name] = value;

			debug.enabled && debug('---', `Parser$DataRow field=${i} length=${length}`);
		}
	}
}


Parser$DataRow.type = 'D';
function Parser$DataRow(conn, reader) {
	const query = conn._activeQuery;
	const result = query.results[0];
	const fieldCount = reader.getInt16();

	debug.enabled && debug('---', `Parser$DataRow fieldCount=${fieldCount}`);

	if (fieldCount !== result.fields.length) {
		throw new Error('invalid field count');
	}

	result.rows.push(new Row(reader, result.fields));
}


module.exports = Parser$DataRow;
