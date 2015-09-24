'use strict';

const Result = require('../Result');


EmptyQueryResponseParser.type = 'I';
function EmptyQueryResponseParser(conn, reader) {
	const query = conn._activeQuery;
	query.results.push(new Result());
	conn._resolveActiveQuery();
}


module.exports = EmptyQueryResponseParser;
