'use strict';


class BufferAggregator {
	constructor() {
		this.clear();
	}

	get length() {
		return this._totalSize;
	}

	push(buffer) {
		this._buffers.push(buffer);
		this._totalSize += buffer.length;
		this._aggregate = null;
	}

	clear() {
		this._buffers   = [];
		this._totalSize = 0;
		this._aggregate = null;
	}

	join() {
		if (!this._aggregate) {
			this._aggregate = this._buffers.length === 1 ? this._buffers[0] : Buffer.concat(this._buffers, this._totalSize);
		}

		return this._aggregate;
	}

	joinAndClear() {
		const buffer = this.join();
		this.clear();
		return buffer;
	}
}


module.exports = BufferAggregator;
