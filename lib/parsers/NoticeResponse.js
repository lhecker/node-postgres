'use strict';

const debug = require('../debug');
const ErrorFields = require('../ErrorFields');


Parser$NoticeResponse.type = 'N';
function Parser$NoticeResponse(conn, reader) {
	if (conn.listenerCount('notice')) {
		const notice = new Error('NoticeResponse');

		do {
			const type  = reader.getUInt8();
			const value = reader.getString();

			const key = ErrorFields.uint8[type];

			if (key) {
				notice[key] = value;
			}

			debug.enabled && debug('---', `Parser$NoticeResponse ${String.fromCharCode(type)}="${value}"`);
		} while (reader.remaining > 1);

		conn.emit('notice', notice);
	}
}


module.exports = Parser$NoticeResponse;
