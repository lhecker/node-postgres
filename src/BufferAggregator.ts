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

        return this._buffers[0] || new Buffer(0);
    }

    joinAndClear(): Buffer {
        const buffer = this.join();
        this.clear();
        return buffer;
    }
}
