'use strict';

const Message = require('./Message');


class Query extends Message {
	constructor(buffer) {
		super(buffer);

		this.results = [];
	}

	resultsBack() {
		return this.results[this.results.length - 1];
	}

	resolve() {
		super.resolve(this.results);
	}
}


module.exports = Query;
