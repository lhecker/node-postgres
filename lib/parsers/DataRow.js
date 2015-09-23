'use strict';

const debug = require('../debug');


DataRowParser.type = 'D';
function DataRowParser(conn, reader) {
	const query = conn._activeQuery;
	const fieldCount = reader.getInt16();

	debug.enabled && debug('---', `DataRowParser fieldCount=${fieldCount}`);

	if (fieldCount !== query.fields.length) {
		throw new Error('invalid field count');
	}

	const row = {};

	for (let i = 0; i < fieldCount; i++) {
		const length = reader.getInt32();
		let value = null;

		if (length >= 0) {
			value = reader.getBytes(length);
		}

		row[query.fields[i].name] = value;

		debug.enabled && debug('---', `DataRowParser field=${i} value=${value}`);
	}

	query.rows.push(row);
}


module.exports = DataRowParser;
