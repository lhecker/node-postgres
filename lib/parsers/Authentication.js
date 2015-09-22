'use strict';

const crypto  = require('crypto');
const packets = require('../packets');


AuthenticationOkParser.type = 0;
function AuthenticationOkParser(conn, reader) {
	conn._authenticated = true;
}

AuthenticationKerberosV5Parser.type = 2;
function AuthenticationKerberosV5Parser(conn, reader) {
	reader.ensureExactLength(9);
	throw new Error('AuthenticationKerberosV5 not yet implemented');
}

AuthenticationCleartextPasswordParser.type = 3;
function AuthenticationCleartextPasswordParser(conn, reader) {
	if (!conn.options.password) {
		throw new Error('password not provided');
	}

	conn._write(packets.PasswordMessage(conn, conn.options.password));
}

AuthenticationMD5PasswordParser.type = 5;
function AuthenticationMD5PasswordParser(conn, reader) {
	if (!conn.options.password) {
		throw new Error('password not provided');
	}

	/*
	 * The password hashing algorithm:
	 * SELECT 'md5' || MD5(MD5('password' || 'username') || 'salt')
	 */
	const salt = reader.getBytes(4);

	const innerHash = crypto.createHash('md5');
	innerHash.update(conn.options.password + conn.options.username);

	const outerHash = crypto.createHash('md5');
	outerHash.update(innerHash.digest('hex'))
	outerHash.update(salt);

	const result = 'md5' + outerHash.digest('hex');

	conn._write(packets.PasswordMessage(conn, result));
}

AuthenticationSCMCredentialParser.type = 6;
function AuthenticationSCMCredentialParser(conn, reader) {
	throw new Error('AuthenticationSCMCredential not yet implemented');
}

AuthenticationGSSParser.type = 7;
function AuthenticationGSSParser(conn, reader) {
	throw new Error('AuthenticationGSS not yet implemented');
}

AuthenticationGSSContinueParser.type = 8;
function AuthenticationGSSContinueParser(conn, reader) {
	throw new Error('AuthenticationGSSContinue not yet implemented');
}

AuthenticationSSPIParser.type = 9;
function AuthenticationSSPIParser(conn, reader) {
	throw new Error('AuthenticationSSPI not yet implemented');
}


const SUB_PARSERS = (() => {
	const subParsers = [];

	[
		AuthenticationOkParser,
		AuthenticationKerberosV5Parser,
		AuthenticationCleartextPasswordParser,
		AuthenticationMD5PasswordParser,
		AuthenticationSCMCredentialParser,
		AuthenticationGSSParser,
		AuthenticationGSSContinueParser,
		AuthenticationSSPIParser,
	].forEach((subParser) => {
		subParsers[subParser.type] = subParser;
	});

	return subParsers;
})();


AuthenticationParser.type = 'R';
function AuthenticationParser(conn, reader) {
	if (conn._authenticated) {
		throw new Error('already authenticated');
	}

	const type = reader.getInt32();
	const subParser = SUB_PARSERS[type];

	if (!subParser) {
		throw new Error('authentication method not implemented');
	}

	subParser(conn, reader);
}


module.exports = AuthenticationParser;
