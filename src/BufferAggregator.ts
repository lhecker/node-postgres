/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

export default class BufferAggregator {
    private _buffers: Buffer[];
    private _totalSize: number;

    constructor() {
        this.clear();
    }

    get length(): number {
        return this._totalSize;
    }

    push(buffer: Buffer) {
        this._buffers.push(buffer);
        this._totalSize += buffer.length;
    }

    clear() {
        this._buffers = [];
        this._totalSize = 0;
    }

    join(): Buffer {
        if (this._buffers.length > 1) {
            this._buffers = [Buffer.concat(this._buffers, this._totalSize)];
        }

        return this._buffers[0] || Buffer.allocUnsafe(0);
    }

    joinAndClear(): Buffer {
        const buffer = this.join();
        this.clear();
        return buffer;
    }
}
