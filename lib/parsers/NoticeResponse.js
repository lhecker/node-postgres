'use strict';

const ErrorFields = require('../ErrorFields');


NoticeResponseParser.type = 'N';
function NoticeResponseParser(conn, reader) {
	if (conn.listenerCount('notice')) {
		const error = new Error('NoticeResponse');

		do {
			const type  = reader.getUInt8();
			const value = reader.getString();

			const key = ErrorFields.UINT8[type];

			if (key) {
				error[key] = value;
			}
		} while (reader.remaining > 1);

		conn.emit('notice', error);
	}
}


module.exports = NoticeResponseParser;
