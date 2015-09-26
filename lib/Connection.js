'use strict';

const BufferAggregator = require('./BufferAggregator');
const ConnectionConfig = require('./ConnectionConfig');
const debug            = require('./debug');
const Deque            = require('double-ended-queue');
const EventEmitter     = require('events');
const net              = require('net');
const PacketReader     = require('./PacketReader');
const packets          = require('./packets');
const PacketTypes      = require('./PacketTypes');
const parsers          = require('./parsers');
const TransactionState = require('./TransactionState');

var Promise = require('bluebird');


const kHeaderSize     = 5; // type [Byte1] + size [Int32]
const kMaxMessageSize = 10 * 1024 * 1024; // 10MB


function Parser$Header(conn, reader) {
	const type   = reader.getUInt8();
	const size   = reader.getInt32() - 4;
	const parser = parsers.uint8[type];

	debug.enabled && debug(`Parser$Header type=${String.fromCharCode(type)} parserSize=${size} parser=${parser ? '"' + parser.name + '"' : 'undefined'}`);

	if (!parser || size < 0 || size > kMaxMessageSize) {
		throw new Error('invalid message header');
	}

	conn._needsHeader          = false;
	conn._currentParser        = parser;
	conn._currentParserLength  = size;
}

/*
 * TODO: Add connection state logic.
 *   (i.e.: When is query() allowed? When does it throw an error, or reject the promise? etc.)
 */
class Connection extends EventEmitter {
	static connect(options) {
		let conn;
		let connectTimeout = 0;

		let p = new Promise((resolve, reject) => {
			conn = new Connection(options);
			connectTimeout = conn.options.connectTimeout;

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
		this._workingQueue = new Deque(); // contains unresolved PacketTypes.DeferredPacket instances
		this._pendingQueue = new Deque(); // contains PacketTypes.Packet instances which are yet to be sent

		// parser state members
		this._aggregator          = new BufferAggregator();
		this._needsHeader         = true;
		this._currentParser       = Parser$Header;
		this._currentParserLength = kHeaderSize;

		// TCP client members
		this._socket = net.connect(this._options);
		this._socket.on('data',    this._recv.bind(this));
		this._socket.once('error', this._error.bind(this));

		// initiate the connection by sending the startup message
		const packet = packets.StartupMessage(this._options);

		packet.promise
			.then(this.emit.bind(this, 'connect'))
			.catch(this.emit.bind(this, 'error'));

		// do not use _pushPacket() since _authenticated is still false
		this._writePacket(packet);
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
				this._writePacket(packets.Terminate(this));
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

	query() {
		/*
		using the unnamed prepared statement and portal objects and no parameters
		Parse
		Bind
		portal Describe
		Execute
		Close
		Sync
		*/
	}

	/*
	 * TODO: add support for multiple statements in a query by adding a "blocking" flag to Query
	 * TODO: add support for cancelable queries by adding a "blocking" flag to Query
	 * The Query object should thus only be written if one ReadyForQuery packet has been received
	 * and get resolved if another one (after the query) has been received.
	 */
	queryMulti(sql) {
		debug.enabled && debug(`Connection.queryMulti(${sql})`);

		const query = packets.Query(sql);
		this._pushPacket(query);
		return query.promise;
	}

	_writePacket(packet) {
		const buffer = packet.buffer;

		debug.enabled && debug('<<<', buffer);

		if (buffer) {
			packet.buffer = null;

			this._socket.write(buffer);

			if (packet instanceof PacketTypes.DeferredPacket) {
				this._workingQueue.push(packet);
			}
		}
	}

	_pushPacket(packet) {
		if (this._authenticated) {
			const backEntry = this._workingQueue.peekBack();

			if (!backEntry || !backEntry.waitsForReady) {
				this._writePacket(packet);
				return;
			}
		}

		this._pendingQueue.push(packet);
	}

	/*
	 * Transfers entries from the pending to the working queue,
	 * until the next blocker is encountered.
	 *
	 * => 1.: After any kind of blocker the
	 */
	_processPendingQueue() {
		if (this._authenticated) {
			const backEntry = this._workingQueue.peekBack();

			if (!backEntry || !backEntry.waitsForReady) {
				let packet;

				while (packet = this._pendingQueue.shift()) {
					this._writePacket(packet);

					if (packet.waitsForReady) {
						break;
					}
				}

				return !!packet;
			}
		}

		return false;
	}

	_queuePeek(optional) {
		const query = this._workingQueue.peekFront();

		if (!query && !optional) {
			throw new Error('entry not found');
		}

		return query;
	}

	_queueShift(optional) {
		const query = this._workingQueue.shift();

		if (!query && !optional) {
			throw new Error('entry not found');
		}

		return query;
	}

	_clear() {
		this._workingQueue.clear();
		this._pendingQueue.clear();
		this._aggregator.clear();
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
