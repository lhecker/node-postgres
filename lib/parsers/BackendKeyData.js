'use strict';

const debug = require('../debug');


BackendKeyDataParser.type = 'K';
function BackendKeyDataParser(conn, reader) {
	const processId = reader.getInt32();
	const secretKey = reader.getInt32();

	debug.enabled && debug('>>>', `BackendKeyDataParser processId="${processId}" secretKey="${secretKey}"`);

	conn._serverProcessId = processId;
	conn._serverSecretKey = secretKey;
}


module.exports = BackendKeyDataParser;
