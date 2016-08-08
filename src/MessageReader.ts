/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

class MessageReader {
    private _buf: Buffer;
    private _beg: number;
    private _off: number;
    private _end: number;

    constructor(data: MessageReader | Buffer, beg: number = 0, end: number = Infinity) {
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

        this._beg = Math.min(Math.max(beg, 0), maxEnd);
        this._off = this._beg;
        this._end = Math.min(Math.max(end, this._beg), maxEnd);
    }

    get backing(): Buffer {
        return this._buf;
    }

    get backingBegin(): number {
        return this._beg;
    }

    get backingOffset(): number {
        return this._off;
    }

    get backingEnd(): number {
        return this._end;
    }

    get length(): number {
        return this._end - this._beg;
    }

    get offset(): number {
        return this._off - this._beg;
    }

    get remaining(): number {
        return this._end - this._off;
    }

    toBuffer(): Buffer {
        return this._buf.slice(this._beg, this._end);
    }

    advance(n: number): MessageReader {
        this._off += n;

        if (this._off > this._end) {
            throw new RangeError('index out of range');
        }

        return this;
    }

    getReader(n: number): MessageReader {
        const offset = this.offset;
        this.advance(n);
        return new MessageReader(this, offset, offset + n);
    }

    getRemaining(): Buffer {
        return this._buf.slice(this._off, this._end);
    }

    getBytes(n: number): Buffer {
        const off = this._off;
        this.advance(n);
        return this._buf.slice(off, off + n);
    }

    getUInt8(): number {
        const off = this._off;
        this.advance(1);
        return this._buf.readUInt8(off, true);
    }

    getInt8(): number {
        const off = this._off;
        this.advance(1);
        return this._buf.readInt8(off, true);
    }

    getUInt16(): number {
        const off = this._off;
        this.advance(2);
        return this._buf.readUInt16BE(off, true);
    }

    getInt16(): number {
        const off = this._off;
        this.advance(2);
        return this._buf.readInt16BE(off, true);
    }

    getUInt32(): number {
        const off = this._off;
        this.advance(4);
        return this._buf.readUInt32BE(off, true);
    }

    getInt32(): number {
        const off = this._off;
        this.advance(4);
        return this._buf.readInt32BE(off, true);
    }

    getUInt64(): number {
        const off = this._off;
        this.advance(8);
        return (this._buf.readUInt32BE(off, true) * 4294967296) + this._buf.readUInt32BE(off + 4, true);
    }

    getInt64(): number {
        const off = this._off;
        this.advance(8);
        return (this._buf.readInt32BE(off, true) * 4294967296) + this._buf.readUInt32BE(off + 4, true);
    }

    getFloat(): number {
        const off = this._off;
        this.advance(4);
        return this._buf.readFloatBE(off, true);
    }

    getDouble(): number {
        const off = this._off;
        this.advance(8);
        return this._buf.readDoubleBE(off, true);
    }

    getString(type?: string): string {
        return this._buf.toString(type || 'utf8', this._off, this._end);
    }

    getCString(type?: string): string {
        const off = this._off;
        const idx = this._buf.indexOf(0x0, off);

        if (idx === -1 || idx >= this._end) {
            throw new RangeError('terminating null char not found');
        }

        this._off = idx + 1;
        return this._buf.toString(type || 'utf8', off, idx);
    }

    // This method exists specifically for Parser$DataRow$Custom.
    parseDataColumn(typeParser: Function) {
        const length = this.getInt32();
        return length > 0 ? typeParser(this.getReader(length)) : null;
    }
}


export default MessageReader;
