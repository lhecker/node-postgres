'use strict';

const Result = require('../Result');


Parser$EmptyQueryResponse.type = 'I';
function Parser$EmptyQueryResponse(conn, reader) {
	const query = conn._activeQuery;
	query.results.push(new Result());
	conn._resolveActiveQuery();
}


module.exports = Parser$EmptyQueryResponse;
