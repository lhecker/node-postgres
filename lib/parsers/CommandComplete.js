'use strict';

const debug = require('../debug');


CommandCompleteParser.type = 'C';
function CommandCompleteParser(conn, reader) {
	const query = conn._activeQuery;
	const value = reader.getString();

	query.command = value;
	conn._resolveActiveQuery();

	debug.enabled && debug('>>>', `CommandCompleteParser value=${value}`);
}


module.exports = CommandCompleteParser;
