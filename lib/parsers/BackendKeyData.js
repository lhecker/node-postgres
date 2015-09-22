'use strict';


BackendKeyDataParser.type = 'K';
function BackendKeyDataParser(conn, reader) {
	const processId = reader.getInt32();
	const secretKey = reader.getInt32();

	conn._serverProcessId = processId;
	conn._serverSecretKey = secretKey;
}


module.exports = BackendKeyDataParser;
