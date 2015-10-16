'use strict';

const debug = require('../debug');


Parser$DataRow.type = 'D';
function Parser$DataRow(conn, reader) {
	reader.advance(2); // skip the field count

	const result = conn._queuePeek().resultsBack();
	result.rows.push(result._parser(reader));
}


module.exports = Parser$DataRow;
