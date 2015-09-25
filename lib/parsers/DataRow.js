'use strict';

const debug        = require('../debug');
const PacketReader = require('../PacketReader');
const Types        = require('../Types');


Parser$DataRow.type = 'D';
function Parser$DataRow(conn, reader) {
	const query = conn._activeQuery;
	const result = query.results[0];
	const fieldCount = reader.getInt16();

	debug.enabled && debug('---', `Parser$DataRow fieldCount=${fieldCount}`);

	if (fieldCount !== result.fields.length) {
		throw new Error('invalid field count');
	}

	result.rows.push(result._parser(reader));
}


module.exports = Parser$DataRow;
