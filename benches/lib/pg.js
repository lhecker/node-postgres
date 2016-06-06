'use strict';

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
