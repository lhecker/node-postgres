/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as Bluebird from 'bluebird';
import * as Deque from 'double-ended-queue';
import * as QueryTypes from './QueryTypes';
import * as net from 'net';
import BufferAggregator from './BufferAggregator';
import ConnectionState from './ConnectionState';
import Field from './Field';
import MessageReader from './MessageReader';
import MessageWriter from './MessageWriter';
import Result from './Result';
import TransactionState from './TransactionState';
import debug from './debug';
import { EventEmitter } from 'events';
import { default as ConnectionConfig, Options } from './ConnectionConfig';
import { default as parsers, Parser } from './parsers';

import './TypeAssert';

const HEADER_SIZE = 5; // type [Byte1] + size [Int32]

/*
 * NOTE:
 *  Some of the methods and members of this class cannot be declared as private,
 *  because the parsers need to access and modify them,
 *  since they basically act as an extension to it.
 */
export default class Connection extends EventEmitter {
    // Publicly exposed members
    public config: ConnectionConfig;

    // Messaging queues and states
    private _aggregator: BufferAggregator;
    private _queue: Deque<QueryTypes.Query<any>>;
    _currentResult: Result | null;

    // Connection information
    _serverParameters: { [key: string]: string };
    _serverProcessId: number;
    _serverSecretKey: number;

    // Connection state
    _currentParser: Parser;
    _currentParserLength: number;
    _needsHeader: boolean;
    _transactionState: number;

    // Networking members
    private _connectTimeout: NodeJS.Timer | null;
    private _disconnectQueue: (() => void)[];
    private _socket: net.Socket;
    private _state: ConnectionState;

    constructor(opts: string | Options) {
        super();

        debug.enabled && debug('Connection.constructor opts=%o', opts);

        // Public members
        Object.defineProperty(this, 'config', {
            value: new ConnectionConfig(opts),
            enumerable: true,
        });
        Object.freeze(this.config.options);
        Object.freeze(this.config);

        // Messaging queues and states
        this._aggregator = new BufferAggregator();
        this._currentResult = null;
        this._queue = new Deque<QueryTypes.Query<any>>();

        // Connection information
        this._serverParameters = {};
        this._serverProcessId = -1;
        this._serverSecretKey = -1;

        // Connection state
        this._currentParser = parsers.Header;
        this._currentParserLength = HEADER_SIZE;
        this._needsHeader = true;
        this._transactionState = TransactionState.Idle;

        // Networking members
        this._connectTimeout = setTimeout(() => {
            this._connectTimeout = null;
            this._error(new Error('connection timeout'));
        }, this.config.connectTimeout);

        this._socket = net.connect({
            path: this.config.path,
            host: this.config.host,
            port: this.config.port,
        } as any);
        this._socket.on('data', this._recv.bind(this));
        this._socket.on('error', this._error.bind(this));
        this._socket.on('close', () => {
            this._setState(ConnectionState.Disconnected);
        });

        this._disconnectQueue = [];
        this._state = ConnectionState.Connecting;

        // Initiate the connection by sending the startup message
        this._sendQuery(QueryTypes.StartupQuery.create(this.config), true)
            .then(() => {
                clearTimeout(<any>this._connectTimeout);
                this._connectTimeout = null;

                this._setState(ConnectionState.Connected);

                this.emit('connect');
            });
    }

    public query(query: string): Bluebird<Result>;
    public query(query: string, vals: any[]): Bluebird<Result>;
    public query(opts: QueryTypes.QueryOptions): Bluebird<Result>;
    public query(arg1: any, arg2?: any[]): Bluebird<Result> {
        const opts: QueryTypes.ExtendedQueryOptions = {
            text: typeof arg1 === 'string' ? arg1 : (arg1.text || ''),
            values: arg2 || arg1.values || [],
            types: arg1.types || [],
            name: arg1.name || '',
        };

        debug.enabled && debug('Connection.query opts=%o', opts);

        if (opts.name === '' && opts.values.length === 0) {
            return this.queryText(opts.text).then(results => results[0]);
        } else {
            return this._sendQuery(QueryTypes.ExtendedQuery.create(opts));
        }
    }

    public queryText(text: string): Bluebird<Result[]> {
        debug.enabled && debug('Connection.queryText text=%o', text);

        return this._sendQuery(QueryTypes.SimpleQuery.create(text));
    }

    public end(): Bluebird<void> {
        debug.enabled && debug('Connection.end');
        return this._end(false);
    }

    public destroy(): Bluebird<void> {
        debug.enabled && debug('Connection.destroy');
        return this._end(true);
    }

    public pause() {
        debug.enabled && debug('Connection.pause');
        this._socket.pause();
    }

    public resume() {
        debug.enabled && debug('Connection.resume');
        this._socket.resume();
    }

    public get state() {
        return this._state;
    }

    private _setState(state: ConnectionState) {
        if (state < this.state) {
            throw RangeError(`invalid state transition from ${ConnectionState[this.state]} to ${ConnectionState[state]}`);
        }

        if (state !== this.state) {
            this._state = state;

            switch (state) {
                case ConnectionState.Connected:
                    clearTimeout(<any>this._connectTimeout);
                    this._connectTimeout = null;
                    break;
                case ConnectionState.Disconnected:
                    for (let cb of this._disconnectQueue) {
                        cb();
                    }

                    this._aggregator.clear();
                    this._queue.clear();
                    this._currentResult = null;

                    this._disconnectQueue = [];
                    break;
            }
        }
    }

    private _throwQueueMismatch(): QueryTypes.Query<any> {
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

    _send(data: Buffer[]) {
        (<any>this._socket).cork();

        for (let buf of data) {
            this._socket.write(buf);
        }

        process.nextTick(() => (<any>this._socket).uncork());
    }

    private _sendQuery<T>(bundle: QueryTypes.QueryWithData<T>, force?: boolean): Bluebird<T> {
        if (!force && this.state !== ConnectionState.Connected) {
            throw new Error('sending a query in an unconnected state');
        }

        this._queue.push(bundle.query);
        this._send(bundle.data.finish());

        return bundle.query.promise;
    }

    private _recv(data: Buffer) {
        this._aggregator.push(data);

        if (this._aggregator.length < this._currentParserLength) {
            return;
        }

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

    // performance gain of 5% by seperating the unoptimizable try/catch
    private _recv_catch(parser: Parser, reader: MessageReader): any {
        try {
            parser(this, reader);
        } catch (err) {
            return err;
        }
    }

    private _error(err: any) {
        // ECONNRESET will be raised after a Terminate message has been sent
        if (this.state === ConnectionState.Disconnecting && err.code === 'ECONNRESET') {
            return;
        }

        debug.enabled && debug('--- Connection._error err=%o', err);

        this.destroy().catch(err => void 0);
        this.emit('error', err);
    }

    private _end(destroy: boolean): Bluebird<void> {
        return new Bluebird<void>((resolve, reject) => {
            if (this.state === ConnectionState.Disconnected) {
                return resolve();
            }

            this._disconnectQueue.push(resolve);

            if (this.state !== ConnectionState.Disconnecting) {
                // NOTE: Only the Connecting or Connected states reach this closure
                this._setState(ConnectionState.Disconnecting);

                if (destroy) {
                    this._socket.destroy();
                } else {
                    if (this.state === ConnectionState.Connected) {
                        const msg = new MessageWriter();
                        msg.addTerminate();
                        this._send(msg.finish());
                    }

                    this._socket.end();
                }
            }
        });
    }
}
