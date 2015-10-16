'use strict';

const debug   = require('../debug');
const parsers = require('./');


/*
 * This is a special Parser:
 * It reads the uniform 5 Byte header which all other Parsers have in common and
 * sets the necessary private members of the associated Connection instance below.
 * In the next _recv() loop the actual _currentParser will be called.
 */
function Parser$Header(conn, reader) {
	const type   = reader.getUInt8();
	const size   = reader.getInt32() - 4;
	const parser = parsers.uint8[type];

	debug.enabled && debug(`Parser$Header type=${String.fromCharCode(type)} parserSize=${size} parser=${parser ? '"' + parser.name + '"' : 'undefined'}`);

	if (!parser || size < 0 || size > conn.options.maxMessageSize) {
		throw new Error('invalid message header');
	}

	conn._needsHeader         = false;
	conn._currentParser       = parser;
	conn._currentParserLength = size;
}


module.exports = Parser$Header;
