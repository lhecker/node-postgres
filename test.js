'use strict';

require('source-map-support/register');

const Bluebird = require('bluebird');

Bluebird.resolve()
    .then(() => Bluebird.using(Connection.connect({
        user    : 'postgres',
        password: 'qyce-zhju',
        database: 'fieldfucker',
    }), conn => {
        return conn.query(query, args);
    }))
    .then(() => {
        console.timeEnd('postgres');
    });
