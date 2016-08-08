/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as url from 'url';

export interface Options {
    path?: string;

    host?: string;
    port?: number;

    user?: string;
    password?: string;
    database?: string;

    connectTimeout?: number;
    maxMessageSize?: number;

    options?: { [key: string]: string };
}

export default class ConnectionConfig {
    public path: string | undefined;
    public host: string | undefined;
    public port: number | undefined;
    public connectTimeout: number;
    public maxMessageSize: number;
    public user: string;
    public password: string | undefined;
    public database: string | undefined;

    public constructor(options: string | Options) {
        if (typeof options === 'string') {
            options = ConnectionConfig._fromURI(options);
        }

        if ('path' in options) {
            this._copy(options, 'path', 'string');
            this.host = undefined;
            this.port = undefined;
        } else {
            this._copy(options, 'host', 'string', 'localhost');
            this._copy(options, 'port', 'number', 5432);
            this.path = undefined;
        }

        this._copy(options, 'connectTimeout', 'number', 10000); // 10 seconds
        this._copy(options, 'maxMessageSize', 'number', 10 * 1024 * 1024); // 10 MiB

        this._copy(options, 'user', 'string', () => process.env.LOGNAME || require('os').userInfo().username);
        this._copy(options, 'password', 'string', undefined);
        this._copy(options, 'database', 'string', undefined);
    }

    private _copy(options: Options, key: string, requiredType: string, defaultValue?: any) {
        let value = options[key];

        if (value === undefined && arguments.length === 4) {
            value = typeof defaultValue !== 'function' ? defaultValue : defaultValue();
        } else {
            const type = typeof value;

            if (type !== requiredType) {
                throw new TypeError(`options.${key} is of type "${type}" but should be a "${requiredType}"`);
            }

            if (type === 'string' && value.length === 0) {
                throw new TypeError('invalid zero-length string');
            }
        }

        this[key] = value;
    }

    private static _fromURI(uri: string): Options {
        // IMPORTANT:
        //  Please note that we follow PostgreSQL's URI scheme, meaning that
        //  "triple-slash URIs" are NOT recognized as the path to a UNIX
        //  socket. Instead the hostname can contain the URL encoded path to
        //  the socket, while the pathname still refers to the database name.
        //  See: https://www.postgresql.org/docs/9.5/static/libpq-connect.html#LIBPQ-CONNSTRING

        const uriObj = url.parse(uri, true, true);
        const options: Options = {
            path: undefined,

            host: undefined,
            port: undefined,

            user: undefined,
            password: undefined,
            database: undefined,

            connectTimeout: undefined,
            maxMessageSize: undefined,

            options: undefined,
        };

        if (uriObj.protocol !== 'postgres:' && uriObj.protocol !== 'postgresql:') {
            throw new TypeError(`expected protocol "postgres:" or "postgresql:", but got "${uriObj.protocol}"`);
        }


        if (uriObj.hostname) {
            if (/^%2F/i.test(uriObj.hostname)) {
                options.path = decodeURIComponent(uriObj.hostname);
            } else {
                options.host = uriObj.hostname;
            }
        }

        if (uriObj.port) {
            const port = parseInt(uriObj.port);

            if (isNaN(port)) {
                throw new TypeError(`invalid port number "${uriObj.port}"`);
            }

            if (port < 0 || port > 65535) {
                throw new RangeError(`invalid port number "${uriObj.port}"`);
            }

            options.port = port;
        }

        if (uriObj.auth) {
            const m = /^[^:]+$/

            options.port = port;
        }

        if (uriObj.pathname) {
            options.database = decodeURIComponent(uriObj.pathname).slice(1) || undefined;
        }

        return options;
    }
}
