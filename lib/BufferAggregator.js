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
	}

	clear() {
		this._buffers   = [];
		this._totalSize = 0;
	}

	join() {
		if (this._buffers.length > 1) {
			this._buffers = [Buffer.concat(this._buffers, this._totalSize)];
		}

		return this._buffers[0] || new Buffer(0);
	}

	joinAndClear() {
		const buffer = this.join();
		this.clear();
		return buffer;
	}
}


module.exports = BufferAggregator;
