'use strict';


class PacketReader {
	constructor(buffer) {
		this._buffer = buffer;
		this._offset = 0;
	}

	get bufferLength() {
		return this._buffer.length;
	}

	get remaining() {
		return this._buffer.length - this._offset;
	}

	ensureExactLength(n) {
		if (n !== this.bufferLength) {
			throw new Error('buffer length does not match');
		}
	}

	ensureMinLength(n) {
		if (n > this.bufferLength) {
			throw new Error('buffer length too small');
		}
	}

	advance(n) {
		n = n >>> 0;

		this._offset += n;

		if (this._offset >= this._buffer.length) {
			throw new RangeError('offset out of range');
		}
	}

	getBytes(n) {
		n = n >>> 0;

		const buffer = this._buffer.slice(this._offset, this._offset + n);

		if (buffer.length !== n) {
			throw new RangeError('index out of range');
		}

		return buffer;
	}

	getInt8() {
		const offset = this._offset;
		this._offset += 1;
		return this._buffer.readInt8(offset);
	}

	getInt16() {
		const offset = this._offset;
		this._offset += 2;
		return this._buffer.readInt16BE(offset);
	}

	getInt32() {
		const offset = this._offset;
		this._offset += 4;
		return this._buffer.readInt32BE(offset);
	}

	getString() {
		const offset = this._offset;
		const idx = this._buffer.indexOf(0x0, offset);

		if (idx === -1) {
			throw new RangeError('terminating null char not found');
		}

		this._offset = idx + 1;
		return this._buffer.toString('utf8', offset, idx);
	}
}


module.exports = PacketReader;
