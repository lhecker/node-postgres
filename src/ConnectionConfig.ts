/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as url from 'url';
import objectEntries from './Object.entries';

export interface Options {
    path?: string;

    host?: string;
    port?: number;

    username?: string;
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

    public username: string;
    public password: string | undefined;
    public database: string | undefined;

    public connectTimeout: number;
    public maxMessageSize: number;

    public options: { [key: string]: string };

    public constructor(opts: string | Options) {
        if (typeof opts === 'string') {
            opts = fromURI(opts);
        }

        const copy = (key: string, requiredType: string, defaultValue: any) => {
            const value = check(`config.${key}`, opts[key], requiredType, defaultValue);

            if (typeof value === 'string' && value.length === 0) {
                throw new TypeError('invalid zero-length string');
            }

            this[key] = value;
        };

        if (opts.path) {
            copy('path', 'string', NO_DEFAULT);
            this.host = undefined;
            this.port = undefined;
        } else {
            copy('host', 'string', 'localhost');
            copy('port', 'number', 5432);
            this.path = undefined;
        }

        copy('username', 'string', () => process.env.LOGNAME || require('os').userInfo().username || 'postgres');
        copy('password', 'string', undefined);
        copy('database', 'string', undefined);

        copy('connectTimeout', 'number', 10000); // 10 seconds
        copy('maxMessageSize', 'number', 10 * 1024 * 1024); // 10 MiB

        copy('options', 'object', {});

        for (let [key, val] of objectEntries(this.options)) {
            check(`config.options.${key}`, val, 'string', NO_DEFAULT);
        }

        this.options['client_encoding'] = 'UTF8';
        this.options['DateStyle'] = 'ISO, MDY';
    }
}

const NO_DEFAULT = Symbol();

function check<T>(name: string, value: any, requiredType: string, defaultValue: any): T {
    if (value === undefined && defaultValue !== NO_DEFAULT) {
        value = typeof defaultValue !== 'function' ? defaultValue : defaultValue();
    } else {
        const type = typeof value;

        if (type !== requiredType) {
            throw new TypeError(`${name} is of type "${type}" but should be a "${requiredType}"`);
        }

        if (type === 'object') {
            value = JSON.parse(JSON.stringify(value));
        }
    }

    return value;
}

function fromURI(uri: string): Options {
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

        username: undefined,
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
        const m = uriObj.auth.match(/^([^:]+)(?::(.+))?$/);

        if (m && m[1]) {
            options.username = decodeURIComponent(m[1]);

            if (m[2]) {
                options.password = decodeURIComponent(m[2]);
            }
        }
    }

    if (uriObj.pathname) {
        options.database = decodeURIComponent(uriObj.pathname).slice(1) || undefined;
    }

    return options;
}
