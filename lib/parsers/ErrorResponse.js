'use strict';

const debug = require('../debug');
const ErrorFields = require('../ErrorFields');


function ErrorResponseParser_emit(conn, error) {
	try {
		conn._rejectActiveQuery(error);
	} catch (e) {
		conn.emit('error', error);
	}
}


ErrorResponseParser.type = 'E';
function ErrorResponseParser(conn, reader) {
	const error = new Error('ErrorResponse');

	do {
		const type  = reader.getUInt8();
		const value = reader.getString();

		const key = ErrorFields.uint8[type];

		if (key) {
			error[key] = value;
		}

		debug.enabled && debug('---', `ErrorResponseParser ${String.fromCharCode(type)}="${value}"`);
	} while (reader.remaining > 1);

	ErrorResponseParser_emit(conn, error);
}


module.exports = ErrorResponseParser;
