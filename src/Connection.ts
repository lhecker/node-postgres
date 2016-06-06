import * as Bluebird from 'bluebird';
import * as Deque from 'double-ended-queue';
import * as QueryTypes from './QueryTypes';
import * as net from 'net';
import * as util from 'util';
import BufferAggregator from './BufferAggregator';
import ConnectionState from './ConnectionState';
import Field from './Field';
import MessageReader from './MessageReader';
import MessageWriter from './MessageWriter';
import Result from './Result';
import TransactionState from './TransactionState';
import debug from './debug';
import {EventEmitter} from 'events';
import {default as ConnectionConfig, Options} from './ConnectionConfig';
import {default as parsers, Parser} from './parsers';

import './TypeAssert';

const HEADER_SIZE = 5; // type [Byte1] + size [Int32]

/*
 * NOTE:
 *  Connection's methods and members cannot be declared as private,
 *  because the parsers need to access and modify them,
 *  since they basically act as an extension to it.
 */
export default class Connection extends EventEmitter {
    options: ConnectionConfig;

    _currentParser: Parser;
    _currentParserLength: number;
    _needsHeader: boolean;
    _state: ConnectionState;
    _transactionState: number;

    _serverParameters: { [key: string]: string };
    _serverProcessId: number;
    _serverSecretKey: number;

    _aggregator: BufferAggregator;
    _currentResult: Result | null;
    _queue: Deque<QueryTypes.Query<any>>;

    _connectTimeout: NodeJS.Timer | null;
    _socket: net.Socket;

    constructor(opts: string | Options) {
        super();

        // Public members
        this.options = Object.freeze(new ConnectionConfig(opts));

        // Connection state
        this._currentParser = parsers.Header;
        this._currentParserLength = HEADER_SIZE;
        this._needsHeader = true;
        this._state = ConnectionState.Connecting;
        this._transactionState = TransactionState.Idle;

        // Connection information
        this._serverParameters = {};
        this._serverProcessId = -1;
        this._serverSecretKey = -1;

        // Messaging queues and states
        this._aggregator = new BufferAggregator();
        this._currentResult = null;
        this._queue = new Deque<QueryTypes.Query<any>>();

        this._connectTimeout = setTimeout(() => {
            this._connectTimeout = null;
            this.emit('timeout');
            this._error(new Error('timeout'));
        }, this.options.connectTimeout);

        // Networking members
        this._socket = net.connect(this.options as any);
        this._socket.on('data', this._recv.bind(this));
        this._socket.on('error', this._error.bind(this));
        this._socket.on('close', () => {
            this._state = ConnectionState.Disconnected;
        });

        // Initiate the connection by sending the startup message
        const query = new QueryTypes.StartupQuery(this);
        query.promise().then(() => {
            clearTimeout(<any>this._connectTimeout);

            this._state = ConnectionState.Connected;
            this._connectTimeout = null;

            this.emit('connect');
        });
    }

    destroy(): Bluebird<void> {
        debug.enabled && debug('Connection#destroy()');

        this._state = ConnectionState.Disconnecting;

        return new Bluebird<void>((resolve, reject) => {
            this._socket.once('close', resolve);
            this._socket.destroy();
        });
    }

    end(): Bluebird<void> {
        debug.enabled && debug('Connection#end()');

        return new Bluebird<void>((resolve, reject) => {
            if (!this._socket.writable) {
                return resolve(undefined);
            }

            if (this._state === ConnectionState.Connected) {
                this._state = ConnectionState.Disconnecting;

                const msg = new MessageWriter();
                msg.addTerminate();
                this._send(msg);
            }

            this._socket.once('close', resolve);
            this._socket.end();
        });
    }

    pause() {
        debug.enabled && debug('Connection#pause()');
        this._socket.pause();
    }

    resume() {
        debug.enabled && debug('Connection#resume()');
        this._socket.resume();
    }

    query(query: string): Bluebird<Result>;
    query(query: string, vals: any[]): Bluebird<Result>;
    query(opts: QueryTypes.QueryOptions): Bluebird<Result>;

    query(arg1: any, arg2?: any[]): Bluebird<Result> {
        const opts: QueryTypes.ExtendedQueryOptions = {
            text: typeof arg1 === 'string' ? arg1 : (arg1.text || ''),
            values: arg2 || arg1.values || [],
            types: arg1.types || [],
            name: arg1.name || '',
        };

        debug.enabled && debug(`Connection#query(${util.inspect(opts, <any>{ depth: 1, maxArrayLength: 3 })})`);

        if (opts.name === '' && opts.values.length === 0) {
            return this.queryText(opts.text).then(results => results[0]);
        } else {
            const query = new QueryTypes.ExtendedQuery(this, opts);
            return query.promise();
        }
    }

    queryText(text: string): Bluebird<Result[]> {
        debug.enabled && debug(`Connection#queryText(${text})`);

        const query = new QueryTypes.SimpleQuery(this, text);
        return query.promise();
    }

    _throwQueueMismatch(): QueryTypes.Query<any> {
        throw new Error('packet queue is empty');
    }

    _queuePeekMaybe(): QueryTypes.Query<any> | undefined {
        return this._queue.peekFront();
    }

    _queuePeek(): QueryTypes.Query<any> {
        return this._queuePeekMaybe() || this._throwQueueMismatch();
    }

    _queueShiftMaybe(): QueryTypes.Query<any> | undefined {
        return this._queue.shift();
    }

    _queueShift(): QueryTypes.Query<any> {
        return this._queueShiftMaybe() || this._throwQueueMismatch();
    }

    _pushNewResult(fields?: Field[]) {
        const result = new Result(fields);
        this._queuePeek().results.push(result);
        this._currentResult = result;
    }

    _send(msg: MessageWriter, query?: QueryTypes.Query<any>) {
        this._socket.write(msg.finish());

        if (query) {
            this._queue.push(query);
        }
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
    _recv_catch(parser: Parser, reader: MessageReader): any {
        try {
            parser(this, reader);
        } catch (err) {
            return err;
        }
    }

    _error(err: any) {
        // ECONNRESET will be raised after a Terminate message has been sent
        if (this._state === ConnectionState.Disconnecting && err.code === 'ECONNRESET') {
            return;
        }

        this.destroy().catch(err => void 0);
        this.emit('error', err);
    }
}
