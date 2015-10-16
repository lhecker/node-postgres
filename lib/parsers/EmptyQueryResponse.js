'use strict';

const Result = require('../Result');


Parser$EmptyQueryResponse.type = 'I';
function Parser$EmptyQueryResponse(conn, reader) {
	conn._queuePeek().results.push(new Result());
}


module.exports = Parser$EmptyQueryResponse;
