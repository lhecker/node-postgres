'use strict';

const debug = require('../debug');


ParameterStatusParser.type = 'S';
function ParameterStatusParser(conn, reader) {
	const name  = reader.getString();
	const value = reader.getString();

	debug.enabled && debug('>>>', `ParameterStatusParser name=${name} value="${value}"`);

	conn._serverParameters[name] = value;
}


module.exports = ParameterStatusParser;
