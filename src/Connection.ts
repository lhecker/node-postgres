import * as Bluebird from 'bluebird';
import * as Deque from 'double-ended-queue';
import * as net from 'net';
import * as packets from './packets';
import BufferAggregator from './BufferAggregator';
import Message from './Message';
import MessageReader from './MessageReader';
import Query from './Query';
import Result from './Result';
import TransactionState from './TransactionState';
import debug from './debug';
import {EventEmitter} from 'events';
import {default as ConnectionConfig, Options} from './ConnectionConfig';
import {default as parsers, Parser} from './parsers';

import './TypeAssert';

const HEADER_SIZE = 5; // type [Byte1] + size [Int32]


export type Options = Options;

export interface QueryOptions {
    text: string;
    values?: any[];
    types?: any[];
    name?: string;
}

/*
 * TODO:
 *   Reject all DeferredPacket instances if _error() is called.
 *   Make it impossible to add more packets etc. Pairs with the following TODO:
 *
 * TODO:
 *   Add connection state logic.
 *   (i.e.: When is query() allowed? When does it throw an error, or reject the promise? etc.)
 *
 * NOTE:
 *  Connection's methods and members cannot be declared as private,
 *  because the parsers need to access and modify them,
 *  since they basically act as an extension to it.
 */
class Connection extends EventEmitter {
    static connect(options: Options) {
        let conn: Connection;

        const p =
            new Bluebird((resolve, reject) => {
                conn = new Connection(options);

                function onError(err: any) {
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

    options: ConnectionConfig;
    _terminated: boolean;
    _authenticated: boolean;
    _serverParameters: {};
    _serverProcessId: number;
    _serverSecretKey: number;
    _transactionState: number;
    _queue: Deque<Message>;
    _aggregator: BufferAggregator;
    _needsHeader: boolean;
    _currentParser: Parser;
    _currentParserLength: number;
    _socket: net.Socket;

    constructor(options: Options) {
        super();

        // parameter members
        this.options = Object.freeze(new ConnectionConfig(options));

        // postgres frontend state members
        this._terminated = false;
        this._authenticated = false;
        this._serverParameters = {};
        this._serverProcessId = undefined;
        this._serverSecretKey = undefined;
        this._transactionState = TransactionState.IDLE;

        // API state members
        this._queue = new Deque<Message>();

        // parser state members
        this._aggregator = new BufferAggregator();
        this._needsHeader = true;
        this._currentParser = parsers.Header;
        this._currentParserLength = HEADER_SIZE;

        // TCP client members
        this._socket = net.connect(this.options as any);
        this._socket.on('data', this._recv.bind(this));
        this._socket.once('error', this._error.bind(this));

        setTimeout(this.emit.bind('error', new Error('timeout')), this.options.connectTimeout);

        // initiate the connection by sending the startup message
        const msg = new Message();
        msg.addStartupMessage(this.options);
        this._writeMessage(msg).promise
            .then(this.emit.bind(this, 'connect'))
            .catch(this.emit.bind(this, 'error'));
    }

    destroy(): Bluebird<void> {
        debug.enabled && debug('Connection..destroy()');

        return new Bluebird<void>((resolve, reject) => {
            this._socket.destroy();
            this._socket.once('close', resolve);
            this._clear();
        });
    }

    end(): Bluebird<void> {
        debug.enabled && debug('Connection..end()');

        return new Bluebird<void>((resolve, reject) => {
            if (this._socket.writable !== true) {
                return resolve(undefined);
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

    query(query: string): Bluebird<any>;
    query(query: string, vals: any[]): Bluebird<any>;
    query(query: QueryOptions): Bluebird<any>;
    query(query: string | QueryOptions, vals?: any[]): Bluebird<any> {
        if (typeof query !== 'object') {
            query = {
                text: query,
                values: vals,
            };
        }

        debug.enabled && debug(`Connection..query(${query})`);

        const name = query.name || '';
        const text = query.text || '';
        const values = query.values || [];
        const types = query.types || [];
        let promise: Bluebird<any>;

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

    queryText(text: string): Bluebird<any> {
        debug.enabled && debug(`Connection..queryMulti(${text})`);

        const msg = new Query();
        msg.addQuery(text);
        return this._writeMessage(msg).promise;
    }

    _writeMessage(msg: Message, unshift?: boolean): Message {
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

    _throwQueueMismatch(): Message {
        throw new Error('packet queue is empty');
    }

    _queuePeekMaybe(): Message {
        return this._queue.peekFront();
    }

    _queuePeek(): Message {
        return this._queuePeekMaybe() || this._throwQueueMismatch();
    }

    _queueShiftMaybe(): Message {
        return this._queue.shift();
    }

    _queueShift(): Message {
        return this._queueShiftMaybe() || this._throwQueueMismatch();
    }

    _clear() {
        this._queue.clear();
        this._aggregator.clear();
    }

    _recv(data: Buffer) {
        this._aggregator.push(data);

        if (this._aggregator.length >= this._currentParserLength) {
            const aggregate = this._aggregator.joinAndClear();
            const aggregateReader = new MessageReader(aggregate);

            do {
                const needsHeader = this._needsHeader;
                const parser = this._currentParser;
                const length = this._currentParserLength;
                const reader = aggregateReader.getReader(length);

                debug.enabled && debug('>>>', parser.name, reader.toBuffer());

                const err = this._recv_catch(parser, reader);

                if (err) {
                    this._error(err);
                    return;
                }

                if (!needsHeader) {
                    this._needsHeader = true;
                    this._currentParser = parsers.Header;
                    this._currentParserLength = HEADER_SIZE;
                }
            } while (aggregateReader.remaining >= this._currentParserLength);

            if (aggregateReader.remaining > 0) {
                this._aggregator.push(aggregateReader.getRemaining());
            }
        }
    }

    // performance gain of 5% by seperating the unoptimizable try/catch
    _recv_catch(parser: Parser, reader: MessageReader) {
        try {
            parser(this, reader);
        } catch (err) {
            return err;
        }
    }

    _error(err: any) {
        // ECONNRESET will be raised after a Terminate message has been sent
        if (this._terminated && err.code === 'ECONNRESET') {
            return;
        }

        this.destroy().catch((err) => { });
        this.emit('error', err);
    }
}


export default Connection;
