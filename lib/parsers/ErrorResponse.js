'use strict';

const debug = require('../debug');
const ErrorFields = require('../ErrorFields');


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

	const query = this._pendingQueriesQueue.shift();

	if (query) {
		query._rejectActiveQuery(error);
	} else {
		conn.emit('error', error);
	}
}


module.exports = ErrorResponseParser;
