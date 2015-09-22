'use strict';


function checkInt(val, lo, hi) {
	if (typeof val !== 'number' || val < lo || val > hi) {
		throw new TypeError('value is out of bounds');
	}
}


class PacketBuilder {
	constructor(type) {
		this._hasType = !!type;
		this._parts = [];
		this._totalSize = 0;

		if (type) {
			this.putInt8(type.charCodeAt(0));
		}

		this._totalSize += 4;
	}

	putBytes(data) {
		const offset = this._totalSize;
		let length;
		let cb;

		if (Buffer.isBuffer(data)) {
			length = data.length;
			cb = (buffer) => {
				data.copy(buffer, offset);
			};
		} else {
			data = String(data);
			length = Buffer.byteLength(data);
			cb = (buffer) => {
				buffer.write(data, offset, length, 'binary');
			};
		}

		this._parts.push(cb);
		this._totalSize += length;
	}

	putInt8(data) {
		checkInt(data, -0x80, 0x7f);

		const offset = this._totalSize;
		this._parts.push((buffer) => {
			buffer.writeInt8(data, offset, true);
		});
		this._totalSize += 1;
	}

	putInt16(data) {
		checkInt(data, -0x8000, 0x7fff);

		const offset = this._totalSize;
		this._parts.push((buffer) => {
			buffer.writeInt16BE(data, offset, true);
		});
		this._totalSize += 2;
	}

	putInt32(data) {
		checkInt(data, -0x80000000, 0x7fffffff);

		const offset = this._totalSize;
		this._parts.push((buffer) => {
			buffer.writeInt32BE(data, offset, true);
		});
		this._totalSize += 4;
	}

	putString(data) {
		data = String(data);

		const offset = this._totalSize;
		const length = Buffer.byteLength(data);

		this._parts.push((buffer) => {
			buffer.write(data, offset, length, 'utf8');
			buffer.writeInt8(0, offset + length, true);
		});
		this._totalSize += length + 1;
	}

	finish() {
		const buffer = new Buffer(this._totalSize);
		const typeOffset = this._hasType ? 1 : 0;

		buffer.writeInt32BE(this._totalSize - typeOffset, typeOffset, true);

		for (let i = 0; i < this._parts.length; i++) {
			this._parts[i](buffer);
		}

		this._totalSize = 0;
		this._parts = [];

		return buffer;
	}
}


module.exports = PacketBuilder;
