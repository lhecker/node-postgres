/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as Bluebird from 'bluebird';
import Connection from './Connection';
import ConnectionConfig from './ConnectionConfig'
import MessageWriter from './MessageWriter';
import Result from './Result';
import { typeOf } from './TypeWriters';

export interface QueryOptions {
    text: string;
    values?: any[];
    types?: any[];
    name?: string;
}

export interface ExtendedQueryOptions extends QueryOptions {
    text: string;
    values: any[];
    types: any[];
    name: string;
}

export interface QueryWithData<T> {
    data: Buffer,
    query: Query<T>,
}

export abstract class Query<T> {
    public results: Result[];
    public promise: Bluebird<T>;
    public reject: (err: any) => void;

    protected _resolve: (val: T) => void;

    public constructor() {
        this.results = [];

        this.promise = new Bluebird<T>((resolve, reject) => {
            this._resolve = resolve;
            this.reject = reject;
        });
    }

    public abstract resolve(): void;
}

export class StartupQuery extends Query<void> {
    public static create(opts: ConnectionConfig): QueryWithData<void> {
        const msg = new MessageWriter();
        msg.addStartupMessage(opts);

        return {
            data: msg.finish(),
            query: new StartupQuery(),
        };
    }

    public resolve() {
        this._resolve(undefined);
    }
}

export class SimpleQuery extends Query<Result[]> {
    public static create(text: string): QueryWithData<Result[]> {
        const msg = new MessageWriter();
        msg.addQuery(text);

        return {
            data: msg.finish(),
            query: new SimpleQuery(),
        };
    }

    public resolve() {
        this._resolve(this.results);
    }
}

export class ExtendedQuery extends Query<Result> {
    public static create(opts: ExtendedQueryOptions): QueryWithData<Result> {
        for (let i = opts.types.length; i < opts.values.length; i++) {
            opts.types.push(typeOf(opts.values[i]));
        }

        const msg = new MessageWriter();
        msg.addParse(opts);
        msg.addBind(opts);
        msg.addDescribe(opts.name, true);
        msg.addExecute(opts.name);
        msg.addClose(opts.name, true);
        msg.addSync();

        return {
            data: msg.finish(),
            query: new ExtendedQuery(),
        };
    }

    public resolve() {
        this._resolve(this.results[0]);
    }
}
