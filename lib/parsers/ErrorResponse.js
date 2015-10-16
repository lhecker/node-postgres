'use strict';

const debug       = require('../debug');
const ErrorFields = require('../ErrorFields');


Parser$ErrorResponse.type = 'E';
function Parser$ErrorResponse(conn, reader) {
	const msg = conn._queueShiftMaybe();
	const error = new Error('ErrorResponse');

	do {
		const type  = reader.getUInt8();
		const value = reader.getCString();

		const key = ErrorFields.uint8[type];

		if (key) {
			error[key] = value;
		}

		debug.enabled && debug('---', `Parser$ErrorResponse ${String.fromCharCode(type)}="${value}"`);
	} while (reader.remaining > 1);

	if (msg) {
		msg.reject(error);
	} else {
		conn.emit('error', error);
	}
}


module.exports = Parser$ErrorResponse;
