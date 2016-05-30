'use strict';

const Connection = require('./lib/Connection');
const pg = require('pg');

var Promise = require('bluebird');



console.time('pg');

pg.connect('postgres://postgres:qyce-zhju@localhost/eucstats', function (err, conn, done) {
    conn.query("SELECT * FROM test", function (err, result) {
        console.timeEnd('pg');
        done();
    });
});

setTimeout(() => {
    console.time('postgres');

    Promise.using(Connection.connect({
        user    : 'postgres',
        password: 'qyce-zhju',
        database: 'eucstats',
    }), (conn) => {
        return conn.query({
                name: 'test',
                text: "SELECT * FROM test",
            })
            //.then((results) => console.log(require('util').inspect(results, {depth:null, colors:true})))
            .then((results) => console.timeEnd('postgres'))
    });
}, 30000);

setTimeout(console.log.bind(console, 1), 1000);
setTimeout(console.log.bind(console, 2), 2000);

setTimeout(()=>{}, 600000);
