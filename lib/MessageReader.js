'use strict';


class MessageReader {
	constructor(data, beg, end) {
		if (!isFinite(beg) || beg < 0) {
			beg = 0;
		}

		if (!isFinite(end) || end < 0) {
			end = Infinity;
		}

		let maxEnd = 0;

		if (data instanceof MessageReader) {
			this._buf = data.backing;

			beg += data.backingBegin;
			end += data.backingBegin;

			maxEnd = data.backingEnd;
		} else {
			this._buf = data;

			maxEnd = data.length;
		}

		this._beg = Math.min(beg, maxEnd);
		this._off = this._beg;
		this._end = Math.min(Math.max(end, this._beg), maxEnd);
	}

	get backing() {
		return this._buf;
	}

	get backingBegin() {
		return this._beg;
	}

	get backingOffset() {
		return this._off;
	}

	get backingEnd() {
		return this._end;
	}

	get length() {
		return this._end - this._beg;
	}

	get offset() {
		return this._off - this._beg;
	}

	get remaining() {
		return this._end - this._off;
	}

	toBuffer() {
		return this._buf.slice(this._beg, this._end);
	}

	toString(type) {
		return this._buf.toString(type || 'utf8', this._beg, this._end);
	}

	advance(n) {
		this._off += n;

		if (this._off > this._end) {
			throw new RangeError('index out of range');
		}
	}

	getReader(n) {
		const offset = this.offset;
		this.advance(n);
		return new MessageReader(this, offset, offset + n);
	}

	getRemaining() {
		return this._buf.slice(this._off, this._end);
	}

	getBytes(n) {
		const off = this._off;
		this.advance(n);
		return this._buf.slice(off, off + n);
	}

	getUInt8() {
		const off = this._off;
		this.advance(1);
		return this._buf.readUInt8(off, true);
	}

	getInt8() {
		const off = this._off;
		this.advance(1);
		return this._buf.readInt8(off, true);
	}

	getUInt16() {
		const off = this._off;
		this.advance(2);
		return this._buf.readUInt16BE(off, true);
	}

	getInt16() {
		const off = this._off;
		this.advance(2);
		return this._buf.readInt16BE(off, true);
	}

	getUInt32() {
		const off = this._off;
		this.advance(4);
		return this._buf.readUInt32BE(off, true);
	}

	getInt32() {
		const off = this._off;
		this.advance(4);
		return this._buf.readInt32BE(off, true);
	}

	getUInt64() {
		const off = this._off;
		this.advance(8);
		return (this._buf.readUInt32BE(off, true) * 4294967296) + this._buf.readUInt32BE(off + 4, true);
	}

	getInt64() {
		const off = this._off;
		this.advance(8);
		return (this._buf.readInt32BE(off, true) * 4294967296) + this._buf.readUInt32BE(off + 4, true);
	}

	getFloat() {
		const off = this._off;
		this.advance(4);
		return this._buf.readFloatBE(off, true);
	}

	getDouble() {
		const off = this._off;
		this.advance(8);
		return this._buf.readDoubleBE(off, true);
	}

	getCString() {
		const off = this._off;
		const idx = this._buf.indexOf(0x0, off);

		if (idx === -1 || idx >= this._end) {
			throw new RangeError('terminating null char not found');
		}

		this._off = idx + 1;
		return this._buf.toString('utf8', off, idx);
	}

	/*
	 * This is specifically for the Parser$DataRow$Custom parser.
	 */
	parseDataColumn(typeParser) {
		const length = this.getInt32();
		return length > 0 ? typeParser(this.getReader(length)) : null;
	}
}


module.exports = MessageReader;
