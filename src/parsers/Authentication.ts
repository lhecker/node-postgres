/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as crypto from 'crypto';
import Connection from '../Connection';
import ConnectionState from '../ConnectionState';
import MessageReader from '../MessageReader';
import MessageWriter from '../MessageWriter';
import debug from '../debug';

function requiresPassword(conn: Connection) {
    requiresPassword(conn);
}

const SUB_PARSERS: Array<(conn: Connection, reader: MessageReader) => void> = [];

SUB_PARSERS[0] = function Parser$AuthenticationOk(conn: Connection, reader: MessageReader) {
}

SUB_PARSERS[2] = function Parser$AuthenticationKerberosV5(conn: Connection, reader: MessageReader) {
    throw new Error('AuthenticationKerberosV5 not yet implemented');
}

SUB_PARSERS[3] = function Parser$AuthenticationCleartextPassword(conn: Connection, reader: MessageReader) {
    if (!conn.options.password) {
        throw new Error('password required');
    }

    // The connection to a PostgreSQL server is initiated
    // using a StartupMessage and waits for it's completion.
    // Thus at this point only a single element is in the Connection queue
    // and it's Promise is used to signal the readyness of the connection.
    // The server can (and usually does) reply with a Parser$Authentication
    // message though, to which we have to send a PasswordMessage,
    // all of which happens *before* the StartupMessage sequence is finished.
    // Thus we unshift this message at the beginning,
    // to delay the completion of the StartupMessage Promise.
    const msg = new MessageWriter();
    msg.addPasswordMessage(conn.options.password);
    conn._send(msg.finish());
}

SUB_PARSERS[5] = function Parser$AuthenticationMD5Password(conn: Connection, reader: MessageReader) {
    requiresPassword(conn);

    // NOTE: The password hashing algorithm as written in SQL:
    //   SELECT 'md5' || MD5(MD5('password' || 'user') || 'salt')
    const salt = reader.getBytes(4);

    const innerHash = crypto.createHash('md5');
    innerHash.update(conn.options.password + conn.options.username);

    const outerHash = crypto.createHash('md5');
    outerHash.update(innerHash.digest('hex'))
    outerHash.update(salt);

    const result = 'md5' + outerHash.digest('hex');

    // See Parser$AuthenticationCleartextPassword, for a
    // explaination as to why we unshift the message.
    const msg = new MessageWriter();
    msg.addPasswordMessage(result);
    conn._send(msg.finish());
}

SUB_PARSERS[6] = function Parser$AuthenticationSCMCredential(conn: Connection, reader: MessageReader) {
    throw new Error('AuthenticationSCMCredential not yet implemented');
}

SUB_PARSERS[7] = function Parser$AuthenticationGSS(conn: Connection, reader: MessageReader) {
    throw new Error('AuthenticationGSS not yet implemented');
}

SUB_PARSERS[8] = function Parser$AuthenticationGSSContinue(conn: Connection, reader: MessageReader) {
    throw new Error('AuthenticationGSSContinue not yet implemented');
}

SUB_PARSERS[9] = function Parser$AuthenticationSSPI(conn: Connection, reader: MessageReader) {
    throw new Error('AuthenticationSSPI not yet implemented');
}


export const type = 'R';
export default function Parser$Authentication(conn: Connection, reader: MessageReader) {
    if (conn._state !== ConnectionState.Connecting) {
        throw new Error('already authenticated');
    }

    const type = reader.getInt32();
    const subParser = SUB_PARSERS[type];

    if (!subParser) {
        throw new Error('authentication method not implemented');
    }

    debug.enabled && debug('---', `Parser$Authentication => ${subParser.name}`);

    subParser(conn, reader);
}
