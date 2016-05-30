import * as Bluebird from 'bluebird';
import * as packets from './packets';
import ConnectionConfig from './ConnectionConfig';
import MessageWriter from './MessageWriter';
import debug from './debug';


function noop(val: any) {
}


class Message extends MessageWriter {
    private _promise: Bluebird<any>;
    private _resolve: (val: any) => void;
    private _reject: (err: Error) => void;

    constructor() {
        super();

        this._promise = null;
        this._resolve = noop;
        this._reject = noop;
    }

    get promise() {
        if (!this._promise) {
            this._promise = new Bluebird((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
            });
        }

        return this._promise;
    }

    resolve(val?: any) {
        debug.enabled && debug('MSG', `${this.constructor.name}..resolve(${typeof val})`);
        this._resolve(val);
    }

    reject(err: any) {
        debug.enabled && debug('MSG', `${this.constructor.name}..reject(${typeof err})`);
        this._reject(err);
    }
}

interface Message {
    addBind(name: string, values: any[], types: number[]): void;
    addClose(name: string, portalOnly: boolean): void;
    addCopyData(): void;
    addCopyDone(): void;
    addCopyFail(): void;
    addDescribe(name: string, isPortal: boolean): void;
    addExecute(name: string): void;
    addFlush(): void;
    addFunctionCall(): void;
    addParse(name: string, query: string, values: any[], types: number[]): void;
    addPasswordMessage(password: string): void;
    addQuery(query: string): void;
    addStartupMessage(config: ConnectionConfig): void;
    addSync(): void;
    addTerminate(): void;
}

Object.keys(packets).forEach((name) => {
    Message.prototype['add' + name] = packets[name];
});


export default Message;
