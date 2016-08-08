/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

const Bluebird = require('bluebird');
const pg = require('pg');

exports.connect = function connect(uri) {
    let conn;

    return new Bluebird((resolve, reject) => {
        const client = new pg.Client(uri);
        client.connect(err => {
            if (err) {
                return reject(err);
            }

            resolve(conn = client);
        });
    }).disposer(() => {
        if (conn) {
            conn.end();
        }
    });
};
