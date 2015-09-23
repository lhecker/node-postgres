'use strict';

class Query {
	constructor(resolve, reject) {
		this._resolve = resolve;
		this._reject  = reject;

		this.command = undefined;
		this.fields = [];
		this.rows = [];
	}
}


module.exports = Query;
