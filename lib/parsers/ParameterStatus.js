'use strict';


ParameterStatusParser.type = 'S';
function ParameterStatusParser(conn, reader) {
	const name  = reader.getString();
	const value = reader.getString();

	conn._serverParameters[name] = value;
}


module.exports = ParameterStatusParser;
