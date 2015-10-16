'use strict';

const BufferAggregator = require('./BufferAggregator');
const ConnectionConfig = require('./ConnectionConfig');
const debug            = require('./debug');
const Deque            = require('double-ended-queue');
const EventEmitter     = require('events');
const Message          = require('./Message');
const MessageReader    = require('./MessageReader');
const net              = require('net');
const packets          = require('./packets');
const parsers          = require('./parsers');
const Query            = require('./Query');
const Result           = require('./Result');
const TransactionState = require('./TransactionState');

var Promise = require('bluebird');


require('./TypeAssert');


const kHeaderSize     = 5; // type [Byte1] + size [Int32]
const kMaxMessageSize = 10 * 1024 * 1024; // 10MB


/*
 * TODO:
 *   Reject all DeferredPacket instances if _error() is called.
 *   Make it impossible to add more packets etc. Pairs with the following TODO:
 *
 * TODO:
 *   Add connection state logic.
 *   (i.e.: When is query() allowed? When does it throw an error, or reject the promise? etc.)
 */
class Connection extends EventEmitter {
	static connect(options) {
		let conn;

		const p =
			new Promise((resolve, reject) => {
				conn = new Connection(options);

				function onError(err) {
					conn.removeListener('connect', onConnected);
					reject(err);
				}

				function onConnected() {
					conn.removeListener('error', onError);
					resolve(conn);
				}

				conn.once('error', onError);
				conn.once('connect', onConnected);
			})
			.disposer(() => {
				if (conn) {
					conn.end();
				}
			});

		return p;
	}

	constructor(options) {
		super();

		// parameter members
		Object.defineProperty(this, 'options', {
			value: Object.freeze(new ConnectionConfig(options)),
		});

		// postgres frontend state members
		this._terminated       = false;
		this._authenticated    = false;
		this._serverParameters = {};
		this._serverProcessId  = undefined;
		this._serverSecretKey  = undefined;
		this._transactionState = TransactionState.IDLE;

		// API state members
		this._queue = new Deque();

		// parser state members
		this._aggregator          = new BufferAggregator();
		this._needsHeader         = true;
		this._currentParser       = parsers.Header;
		this._currentParserLength = kHeaderSize;

		// TCP client members
		this._socket = net.connect(this.options);
		this._socket.on('data',    this._recv.bind(this));
		this._socket.once('error', this._error.bind(this));

		setTimeout(this.emit.bind('error', new Error('timeout')), this.options.connectTimeout);

		// initiate the connection by sending the startup message
		const msg = new Message();
		msg.addStartupMessage(this.options);
		this._writeMessage(msg).promise
			.then(this.emit.bind(this, 'connect'))
			.catch(this.emit.bind(this, 'error'));
	}

	destroy() {
		debug.enabled && debug('Connection..destroy()');

		return new Promise((resolve, reject) => {
			this._socket.destroy();
			this._socket.once('close', resolve);
			this._clear();
		});
	}

	end() {
		debug.enabled && debug('Connection..end()');

		return new Promise((resolve, reject) => {
			if (this._socket.writable !== true) {
				return resolve();
			}

			if (this._authenticated) {
				const msg = new Message();
				msg.addTerminate();
				this._writeMessage(msg);

				this._terminated = true;
			}

			this._socket.end();
			this._socket.once('close', resolve);
		});
	}

	pause() {
		debug.enabled && debug('Connection..pause()');
		this._socket.pause();
	}

	resume() {
		debug.enabled && debug('Connection..resume()');
		this._socket.resume();
	}

	query(query, vals) {
		if (typeof query !== 'object') {
			query = {
				text  : query,
				values: vals,
			};
		}

		debug.enabled && debug(`Connection..query(${query})`);

		const name   = query.name   || '';
		const text   = query.text   || '';
		const values = query.values || [];
		const types  = query.types  || [];
		let promise;

		if (name === '' && values.length === 0) {
			promise = this.queryText(query.text);
		} else {
			const msg = new Query();
			msg.addParse(name, text, values, types);
			msg.addBind(name, values, types);
			msg.addDescribe(name, true);
			msg.addExecute(name);
			msg.addClose(name, false);
			msg.addSync();
			promise = this._writeMessage(msg).promise;
		}

		return promise.then(results => results[0]);
	}

	queryText(text) {
		debug.enabled && debug(`Connection..queryMulti(${text})`);

		const msg = new Query();
		msg.addQuery(text);
		return this._writeMessage(msg).promise;
	}

	_writeMessage(msg, unshift) {
		const buffer = msg.finish();

		debug.enabled && debug('<<<', msg.constructor.name, buffer);

		this._socket.write(buffer);

		if (unshift) {
			this._queue.unshift(msg);
		} else {
			this._queue.push(msg);
		}

		return msg;
	}

	_throwQueueMismatch() {
		throw new Error('packet queue is empty');
	}

	_queuePeekMaybe() {
		return this._queue.peekFront();
	}

	_queuePeek() {
		return this._queuePeekMaybe() || this._throwQueueMismatch();
	}

	_queueShiftMaybe() {
		return this._queue.shift();
	}

	_queueShift() {
		return this._queueShiftMaybe() || this._throwQueueMismatch();
	}

	_clear() {
		this._queue.clear();
		this._aggregator.clear();
	}

	_recv(data) {
		this._aggregator.push(data);

		if (this._aggregator.length >= this._currentParserLength) {
			const aggregate       = this._aggregator.joinAndClear();
			const aggregateReader = new MessageReader(aggregate);

			do {
				const needsHeader = this._needsHeader;
				const parser      = this._currentParser;
				const length      = this._currentParserLength;
				const reader      = aggregateReader.getReader(length);

				debug.enabled && debug('>>>', parser.name, reader.toBuffer());

				const err = this._recv_catch(parser, reader);

				if (err) {
					this._error(err);
					return;
				}

				if (!needsHeader) {
					this._needsHeader          = true;
					this._currentParser        = parsers.Header;
					this._currentParserLength  = kHeaderSize;
				}
			} while (aggregateReader.remaining >= this._currentParserLength);

			if (aggregateReader.remaining > 0) {
				this._aggregator.push(aggregateReader.getRemaining());
			}
		}
	}

	// performance gain of 5% by seperating the unoptimizable try/catch
	_recv_catch(parser, reader) {
		try {
			parser(this, reader);
		} catch (err) {
			return err;
		}
	}

	_error(err) {
		// ECONNRESET will be raised after a Terminate message has been sent
		if (this._terminated && err.code === 'ECONNRESET') {
			return;
		}

		this.destroy().catch((err) => {});
		this.emit('error', err);
	}
}


module.exports = Connection;
