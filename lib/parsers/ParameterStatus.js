'use strict';

const debug = require('../debug');


Parser$ParameterStatus.type = 'S';
function Parser$ParameterStatus(conn, reader) {
	const name  = reader.getCString();
	const value = reader.getCString();

	debug.enabled && debug('>>>', `Parser$ParameterStatus name=${name} value="${value}"`);

	conn._serverParameters[name] = value;
}


module.exports = Parser$ParameterStatus;
