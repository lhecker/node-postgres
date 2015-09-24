'use strict';

class Query {
	constructor(resolve, reject) {
		this._resolve = resolve;
		this._reject  = reject;
		this.results = [];
	}
}


module.exports = Query;
