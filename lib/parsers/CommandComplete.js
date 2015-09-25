'use strict';

const debug = require('../debug');


Parser$CommandComplete.type = 'C';
function Parser$CommandComplete(conn, reader) {
	const query = conn._activeQuery;
	const value = reader.getString();

	query.command = value;
	conn._resolveActiveQuery();

	debug.enabled && debug('>>>', `Parser$CommandComplete value=${value}`);
}


module.exports = Parser$CommandComplete;
