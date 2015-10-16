'use strict';

const debug = require('../debug');


Parser$CommandComplete.type = 'C';
function Parser$CommandComplete(conn, reader) {
	const value = reader.getCString();

	conn._queuePeek().resultsBack().command = value;

	debug.enabled && debug('---', `Parser$CommandComplete value=${value}`);
}


module.exports = Parser$CommandComplete;
