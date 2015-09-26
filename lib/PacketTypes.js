'use strict';

var Promise = require('bluebird');


function noop() {}


class Packet {
	constructor(buffer, waitsForReady) {
		this.buffer    = buffer;
		this.waitsForReady = !!waitsForReady;
	}
}

class DeferredPacket extends Packet {
	constructor(buffer, waitsForReady) {
		super(buffer, waitsForReady);

		this._promise = null;

		this._resolve = noop;
		this._reject  = noop;
	}

	get promise() {
		if (!this._promise) {
			this._promise = new Promise((resolve, reject) => {
				this._resolve = resolve;
				this._reject  = reject;
			});
		}

		return this._promise;
	}

	resolve(res) {
		this._resolve(res);
	}

	reject(err) {
		this._reject(err);
	}
}

class Query extends DeferredPacket {
	constructor(buffer, waitsForReady) {
		super(buffer, waitsForReady);

		this.results = [];
	}

	_resultsBack() {
		return this.results[this.results.length - 1];
	}

	resolve() {
		super.resolve(this.results);
	}
}


exports.Packet         = Packet;
exports.DeferredPacket = DeferredPacket;
exports.Query          = Query;
