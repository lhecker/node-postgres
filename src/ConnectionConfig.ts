export interface Options {
    path?: string;
    host?: string;
    port?: number;
    connectTimeout?: number;
    maxMessageSize?: number;
    user?: string;
    password?: string;
    database?: string;
}

export default class ConnectionConfig {
    path: string | undefined;
    host: string | undefined;
    port: number | undefined;
    connectTimeout: number;
    maxMessageSize: number;
    user: string;
    password: string;
    database: string | undefined;

    constructor(options: Options) {
        if ('path' in options) {
            this.copy(options, 'path', 'string');
            this.host = undefined;
            this.port = undefined;
        } else {
            this.copy(options, 'host', 'string', 'localhost');
            this.copy(options, 'port', 'number', 5432);
            this.path = undefined;
        }

        this.copy(options, 'connectTimeout', 'number', 10000); // 10 seconds
        this.copy(options, 'maxMessageSize', 'number', 10 * 1024 * 1024); // 10 MiB

        this.copy(options, 'user', 'string');
        this.copy(options, 'password', 'string');
        this.copy(options, 'database', 'string', undefined);
    }

    copy(options: Options, key: string, requiredType: string, defaultValue?: any) {
        let value = options[key];

        if (value === undefined && arguments.length === 4) {
            value = defaultValue;
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
}
