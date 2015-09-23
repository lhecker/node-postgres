'use strict';

const BufferAggregator = require('./BufferAggregator');
const ConnectionConfig = require('./ConnectionConfig');
const debug            = require('./debug');
const Deque            = require('double-ended-queue');
const EventEmitter     = require('events');
const net              = require('net');
const PacketReader     = require('./PacketReader');
const packets          = require('./packets');
const parsers          = require('./parsers');
const Query            = require('./Query');
const TransactionState = require('./TransactionState');

var Promise = require('bluebird');


const kHeaderSize     = 5; // type [Byte1] + size [Int32]
const kMaxMessageSize = 10 * 1024 * 1024; // 10MB


class Connection extends EventEmitter {
	static connect(options) {
		let conn;
		let connectTimeout = 0;

		let p = new Promise((resolve, reject) => {
			conn = new Connection(options);
			connectTimeout = conn.options.connectTimeout;

			conn.once('error', reject);
			conn.once('drain', () => {
				resolve(conn);
				conn.removeListener('error', reject);
			});
		});

		if (connectTimeout > 0) {
			p = p.timeout(connectTimeout);
		}

		return p
			.catch(Promise.TimeoutError, Promise.CancellationError, (err) => {
				if (conn) {
					return conn.destroy();
				}

				throw err;
			})
			.disposer(() => {
				if (conn) {
					conn.end();
				}
			});
	}

	constructor(options) {
		super();

		// parameter members
		this._options = Object.freeze(new ConnectionConfig(options));

		// postgres frontend state members
		this._terminated       = false;
		this._authenticated    = false;
		this._serverParameters = {};
		this._serverProcessId  = undefined;
		this._serverSecretKey  = undefined;
		this._transactionState = TransactionState.IDLE;

		// API state members
		this._pendingQueryPackets = []; // Buffers queries until after authentication - ONLY to be used for that!
		this._pendingQueriesQueue = new Deque();

		// parser state members
		this._aggregator           = new BufferAggregator();
		this._currentParser        = null;
		this._currentMessageLength = -1;

		// TCP client members
		this._socket = net.connect(this._options);
		this._socket.on('data',    this._recv.bind(this));
		this._socket.once('error', this._error.bind(this));

		// initiate the connection by sending a startup message
		this._write(packets.StartupMessage(this._options));
	}

	get options() {
		return this._options;
	}

	destroy() {
		debug.enabled && debug('Connection.destroy()');

		return new Promise((resolve, reject) => {
			this._socket.destroy();
			this._socket.once('close', resolve);
			this._clear();
		});
	}

	end() {
		debug.enabled && debug('Connection.end()');

		return new Promise((resolve, reject) => {
			if (this._socket.writable !== true) {
				return resolve();
			}

			if (this._authenticated) {
				this._write(packets.Terminate(this));
				this._terminated = true;
			}

			this._socket.end();
			this._socket.once('close', resolve);
		});
	}

	pause() {
		debug.enabled && debug('Connection.pause()');

		this._socket.pause();
	}

	resume() {
		debug.enabled && debug('Connection.resume()');

		this._socket.resume();
	}

	query(sql) {
		debug.enabled && debug(`Connection.query(${sql})`);

		return new Promise((resolve, reject) => {
			if (typeof sql !== 'string' || sql.length === 0) {
				throw new TypeError('invalid query');
			}

			const query = new Query(resolve, reject);
			const buffer = packets.Query(sql);

			if (this._authenticated) {
				this._write(buffer);
			} else {
				this._pendingQueryPackets.push(buffer);
			}

			this._pendingQueriesQueue.push(query);
		});
	}

	get _activeQuery() {
		const query = this._pendingQueriesQueue.peekFront();

		if (!query) {
			throw new Error('active query not found');
		}

		return query;
	}

	_popActiveQuery() {
		const query = this._pendingQueriesQueue.shift();

		if (!query) {
			throw new Error('active query not found');
		}

		return query;
	}

	_resolveActiveQuery() {
		const query = this._popActiveQuery();
		query._resolve(query);
	}

	_rejectActiveQuery(err) {
		return this._popActiveQuery()._reject(err);
	}

	_clear() {
		this._pendingQueryPackets = null;
		this._pendingQueriesQueue.clear();
		this._aggregator.clear();
	}

	_write(data) {
		debug.enabled && debug('<<<', data);

		this._socket.write(data);
	}

	_recv(data) {
		this._aggregator.push(data);

		/*
		 * If there is currently no message being processed and
		 * if enough bytes have been received to parse the message header,
		 * the header will be parsed and the message type and length extracted.
		 */
		if (this._currentMessageLength === -1 && this._aggregator.length >= kHeaderSize) {
			const buffer = this._aggregator.join();
			const type   = buffer.readUInt8(0, true);
			const size   = buffer.readInt32BE(1, true) + 1; // the "size" doesn't include the Byte1 "type" before it
			const parser = parsers.uint8[type];

			if (!parser || size < kHeaderSize || size > kMaxMessageSize) {
				this._error(new Error('invalid message header'));
				return;
			}

			// set members to signal an ongoing message
			this._currentParser = parser;
			this._currentMessageLength = size;
		}

		/*
		 * If a message header has been parsed and it's length extracted and
		 * if at least the whole message has been received,
		 * the message will be sliced out of the acculumated buffer and get parsed.
		 */
		if (this._currentMessageLength > 0 && this._aggregator.length >= this._currentMessageLength) {
			const buffer = this._aggregator.joinAndClear();
			const parser = this._currentParser;

			// slice out the message
			const messageBuffer = buffer.slice(0, this._currentMessageLength);

			// slice out the remaining data
			const remainingBuffer = buffer.slice(this._currentMessageLength);

			// reset class members for the next message
			this._currentParser = null;
			this._currentMessageLength = -1;

			try {
				debug.enabled && debug('>>>', parser.name, messageBuffer);

				const reader = new PacketReader(messageBuffer);
				reader.advance(kHeaderSize); // skip the message header
				parser(this, reader); // parse!
			} catch (e) {
				this._error(e);
			}

			// recursively parse possibly remaining messages
			if (remainingBuffer.length) {
				this._recv(remainingBuffer);
			}
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
