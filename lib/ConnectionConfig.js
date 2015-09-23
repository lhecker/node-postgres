'use strict';

class ConnectionConfig {
	constructor(options) {
		if ('path' in options) {
			this.copy(options, 'path', 'string');
		} else {
			this.copy(options, 'host', 'string', 'localhost');
			this.copy(options, 'port', 'number', 5432);
		}

		this.copy(options, 'connectTimeout', 'number', 10000); // 10s

		this.copy(options, 'user',     'string');
		this.copy(options, 'password', 'string');
		this.copy(options, 'database', 'string', undefined);
	}

	copy(options, key, requiredType, defaultValue) {
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


module.exports = ConnectionConfig;
