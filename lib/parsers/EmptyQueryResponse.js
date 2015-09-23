'use strict';


EmptyQueryResponseParser.type = 'I';
function EmptyQueryResponseParser(conn, reader) {
	conn._resolveActiveQuery();
}


module.exports = EmptyQueryResponseParser;
