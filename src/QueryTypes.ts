import * as Bluebird from 'bluebird';
import Connection from './Connection';
import MessageWriter from './MessageWriter';
import Result from './Result';

type SettleFn = (val: any) => void;

export abstract class Query<T> {
    public results: Result[];

    protected _resolve: SettleFn | null;
    protected _reject: SettleFn | null;

    public constructor() {
        this.results = [];
        this._resolve = null;
        this._reject = null;
    }

    public promise(): Bluebird<any> {
        return new Bluebird<any>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public abstract resolve(): void;

    public reject(err: any) {
        this._settle(this._reject, err);
    }

    protected _settle(fn: SettleFn | null, val: any) {
        if (fn) {
            fn(val);
            this._resolve = null;
            this._reject = null;
        }
    }
}

export class StartupQuery extends Query<void> {
    public constructor(conn: Connection) {
        super();

        const msg = new MessageWriter();
        msg.addStartupMessage(conn.options);
        conn._send(msg, this);
    }

    public resolve() {
        this._settle(this._resolve, undefined);
    }
}

export class SimpleQuery extends Query<Result[]> {
    public constructor(conn: Connection, text: string) {
        super();

        const msg = new MessageWriter();
        msg.addQuery(text);
        conn._send(msg, this);
    }

    public resolve() {
        this._settle(this._resolve, this.results);
    }
}

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

export class ExtendedQuery extends Query<Result> {
    public constructor(conn: Connection, opts: ExtendedQueryOptions) {
        super();

        const msg = new MessageWriter();
        msg.addParse(opts);
        msg.addBind(opts);
        msg.addDescribe(opts.name, true);
        msg.addExecute(opts.name);
        msg.addClose(opts.name, true);
        msg.addSync();
        conn._send(msg, this);
    }

    public resolve() {
        this._settle(this._resolve, this.results[0]);
    }
}
