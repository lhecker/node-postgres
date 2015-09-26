'use strict';

const Result = require('../Result');


Parser$EmptyQueryResponse.type = 'I';
function Parser$EmptyQueryResponse(conn, reader) {
	const query = conn._queuePeek();

	query.results.push(new Result());

	if (!query.waitsForReady) {
		query.resolve();
		conn._queueShift();
	}
}


module.exports = Parser$EmptyQueryResponse;
