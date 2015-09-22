'use strict';


EmptyQueryResponseParser.type = 'I';
function EmptyQueryResponseParser(conn, reader) {
	console.log('EmptyQueryResponseParser');
	console.log(reader);
	console.log();
}


module.exports = EmptyQueryResponseParser;
