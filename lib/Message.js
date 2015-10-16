'use strict';

const debug         = require('./debug');
const MessageWriter = require('./MessageWriter');
const packets       = require('./packets');

var Promise = require('bluebird');


function noop(val) {}


class Message extends MessageWriter {
	constructor() {
		super();

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

	resolve(value) {
		debug.enabled && debug('MSG', `${this.constructor.name}..resolve(${typeof value})`);
		this._resolve(value);
	}

	reject(reason) {
		debug.enabled && debug('MSG', `${this.constructor.name}..reject(${typeof value})`);
		this._reject(reason);
	}
}

Object.keys(packets).forEach((name) => {
	Message.prototype['add' + name] = packets[name];
});


module.exports = Message;
