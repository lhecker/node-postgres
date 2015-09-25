'use strict';

const debug = require('../debug');


Parser$BackendKeyData.type = 'K';
function Parser$BackendKeyData(conn, reader) {
	const processId = reader.getInt32();
	const secretKey = reader.getInt32();

	debug.enabled && debug('>>>', `Parser$BackendKeyData processId="${processId}" secretKey="${secretKey}"`);

	conn._serverProcessId = processId;
	conn._serverSecretKey = secretKey;
}


module.exports = Parser$BackendKeyData;
