'use strict';

const debug = require('../debug');


Parser$CommandComplete.type = 'C';
function Parser$CommandComplete(conn, reader) {
	const query = conn._queuePeek();
	const value = reader.getString();

	query._resultsBack().command = value;

	if (!query.waitsForReady) {
		query.resolve();
		conn._queueShift();
	}

	debug.enabled && debug('>>>', `Parser$CommandComplete value=${value}`);
}


module.exports = Parser$CommandComplete;
