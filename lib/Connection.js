'use strict';

const BufferAggregator = require('./BufferAggregator');
const Deque            = require('double-ended-queue');
const EventEmitter     = require('events');
const net              = require('net');
const PacketReader     = require('./PacketReader');
const packets          = require('./packets');
const parsers          = require('./parsers');
const TransactionState = require('./TransactionState');

var Promise = require('bluebird');


const kHeaderSize     = 5; // type [Byte1] + size [Int32]
const kMaxMessageSize = 10 * 1024 * 1024; // 10MB

class Connection extends EventEmitter {
	constructor(options) {
		if ('path' in options) {
			console.assert(typeof options.path === 'string' && options.path.length > 0);
		} else {
			console.assert(options.host === undefined || typeof options.host === 'string');
			console.assert(options.port === undefined || typeof options.port === 'number');
		}

		console.assert(typeof options.username === 'string' && options.username.length > 0);
		console.assert(options.port === undefined || (typeof options.password === 'string' && options.password.length > 0));
		console.assert(options.database === undefined || typeof options.database === 'string');

		super();

		// parameter members
		this._options = Object.freeze({
			host    : options.host || 'localhost',
			port    : options.port || 5432,
			username: options.username,
			password: options.password,
			database: options.database,
		});

		// postgres frontend state members
		this._authenticated    = false;
		this._serverParameters = {};
		this._serverProcessId  = undefined;
		this._serverSecretKey  = undefined;
		this._transactionState = TransactionState.IDLE;

		// API state members
		this._queryQueue = new Deque();

		// parser state members
		this._aggregator           = new BufferAggregator();
		this._currentParser        = null;
		this._currentMessageLength = -1;

		// TCP client members
		this._socket = net.connect(this._options);
		this._socket.on('data',  this._recv.bind(this));
		this._socket.on('end',   this._end.bind(this));
		this._socket.on('error', this._error.bind(this));

		// initiate the connection by sending a startup message
		this._write(packets.StartupMessage(this._options));
	}

	get options() {
		return this._options;
	}

	end() {
		this._write(packets.Terminate(this));
		this._socket.end();
	}

	pause() {
		this._socket.pause();
	}

	resume() {
		this._socket.resume();
	}

	query(query) {
		return new Promise((resolve, reject) => {
			if (typeof query !== 'string' || string.length === 0) {
				throw new TypeError('invalid query');
			}

			this._write(packets.Query(query));
			this._queryQueue.push({resolve, reject});
		});
	}

	_write(buffer) {
		this._socket.write(buffer);
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
			const parser = parsers.UINT8[type];

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
				// debug:
				// console.log(parser.name), console.log(messageBuffer), console.log();

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

	_end() {
		console.log('disconnected from server');
	}

	_error(err) {
		this._socket.destroy();
		this._aggregator.clear();
		console.error(err);
	}
}


module.exports = PacketReader;
