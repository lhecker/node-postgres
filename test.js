'use strict';

require('source-map-support/register');

const Bluebird = require('bluebird');
const postgres = require('./lib');

Bluebird.resolve()
    .then(() => {
        console.time('postgres');
    })
    .then(() => Bluebird.using(postgres.connect({
        database: 'lhecker',
    }), conn => {
        return conn.query(`SELECT * FROM generate_series(1, $1)`, [3]);
    }))
    .then(() => {
        console.timeEnd('postgres');
    });
