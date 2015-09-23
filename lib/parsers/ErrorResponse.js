'use strict';

const ErrorFields = require('../ErrorFields');


ErrorResponseParser.type = 'E';
function ErrorResponseParser(conn, reader) {
	const error = new Error('ErrorResponse');

	do {
		const type  = reader.getUInt8();
		const value = reader.getString();

		const key = ErrorFields.UINT8[type];

		if (key) {
			error[key] = value;
		}
	} while (reader.remaining > 1);

	conn.emit('error', error);
}


module.exports = ErrorResponseParser;
