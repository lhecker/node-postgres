'use strict';

const debug = require('../debug');
const ErrorFields = require('../ErrorFields');


Parser$ErrorResponse.type = 'E';
function Parser$ErrorResponse(conn, reader) {
	const query = conn._queuePeek(true);
	const error = new Error('ErrorResponse');

	do {
		const type  = reader.getUInt8();
		const value = reader.getString();

		const key = ErrorFields.uint8[type];

		if (key) {
			error[key] = value;
		}

		debug.enabled && debug('---', `Parser$ErrorResponse ${String.fromCharCode(type)}="${value}"`);
	} while (reader.remaining > 1);

	if (query) {
		query.reject(error);
		conn._queueShift();
	}
}


module.exports = Parser$ErrorResponse;
