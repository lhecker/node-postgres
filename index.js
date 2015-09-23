'use strict';

const Connection = require('./lib/Connection');

var Promise = require('bluebird');


Promise.using(Connection.connect({
	user    : 'postgres',
	password: 'qyce-zhju',
	database: 'eucstats',
}), (conn) => {
	return conn.query('SELECT now()')
		.then(console.log.bind(console));
});
