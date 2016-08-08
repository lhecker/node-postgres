/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

require('source-map-support/register');

const Bluebird = require('bluebird');

global.Bluebird = Bluebird;

const Connection = require('./lib/Connection').default;
const pg = require('pg');

const query = `SELECT generate_series(1, $1) AS id, md5(random()::text) AS descr`;
const args = [1 * 1000 * 1000];

function pgQuery() {
    return new Bluebird((resolve, reject) => {
        const conn = new pg.Client('postgres://postgres:qyce-zhju@localhost/fieldfucker');
        conn.connect(err => {
            if (err) {
                return reject(err);
            }

            conn.query(query, args, (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result);
                conn.end();
            });
        });
    });
}

Bluebird.resolve()
    .then(() => console.time('pg'))
    .then(() => pgQuery())
    .then(() => {
        console.timeEnd('pg');
    })
    .then(() => console.time('postgres'))
    .then(() => {
        return Bluebird.using(Connection.connect({
            user    : 'postgres',
            password: 'qyce-zhju',
            database: 'fieldfucker',
        }), conn => {
            return conn.query(query, args);
        });
    })
    .then(() => {
        console.timeEnd('postgres');
    });
