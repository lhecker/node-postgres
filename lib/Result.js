'use strict';

class Result {
	constructor(resolve, reject) {
		this.command = undefined;
		this.fields = [];
		this.rows = [];
	}
}


module.exports = Result;
