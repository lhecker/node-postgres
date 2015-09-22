'use strict';

const Connection = require('./lib/Connection');

const conn = new Connection({
	username: 'postgres',
	password: 'qyce-zhju',
	database: 'eucstats',
});
