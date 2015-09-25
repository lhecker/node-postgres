'use strict';

class Query {
	constructor(resolve, reject) {
		Object.defineProperty(this, '_resolve', {value: resolve});
		Object.defineProperty(this, '_reject',  {value: reject});

		this.results = [];
	}
}


module.exports = Query;
