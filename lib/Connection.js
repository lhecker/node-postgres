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


function Parser$Header(conn, reader) {
	const type   = reader.getUInt8();
	const size   = reader.getInt32() - 4;
	const parser = parsers.uint8[type];

	debug.enabled && debug(`Parser$Header type=${String.fromCharCode(type)} parserSize=${size} parser=${parser ? '"' + parser.name + '"' : 'undefined'}`);

	if (!parser || size <= 0 || size > kMaxMessageSize) {
		throw new Error('invalid message header');
	}

	conn._needsHeader          = false;
	conn._currentParser        = parser;
	conn._currentParserLength  = size;
}


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
					conn.destroy();
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
		this._aggregator          = new BufferAggregator();
		this._needsHeader         = true;
		this._currentParser       = Parser$Header;
		this._currentParserLength = kHeaderSize;

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

	/*
	 * TODO: support multiple statements by adding a "blocking" flag to Query
	 * The Query object should thus only be written if one ReadyForQuery packet has been received
	 * and get resolved if another one (after the query) has been received.
	 */
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
		query._resolve(query.results);
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

		if (this._aggregator.length >= this._currentParserLength) {
			const aggregate = this._aggregator.joinAndClear();
			const aggregateReader = new PacketReader(aggregate);

			do {
				const needsHeader = this._needsHeader;

				try {
					const parser = this._currentParser;
					const reader = aggregateReader.getReader(this._currentParserLength);

					debug.enabled && debug('>>>', parser.name, reader.toBuffer());

					parser(this, reader);
				} catch (err) {
					return this._error(err);
				}

				if (!needsHeader) {
					this._needsHeader          = true;
					this._currentParser        = Parser$Header;
					this._currentParserLength  = kHeaderSize;
				}
			} while (aggregateReader.remaining >= this._currentParserLength);

			if (aggregateReader.remaining > 0) {
				this._aggregator.push(aggregateReader.getRemaining());
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
