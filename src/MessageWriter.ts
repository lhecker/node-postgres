function checkInt(val: any, lo: number, hi: number) {
    if (typeof val !== 'number' || val < lo || val > hi) {
        throw new TypeError('value is out of bounds');
    }
}

function checkBuffer(val: any) {
    if (Buffer.isBuffer(val)) {
        throw new TypeError('value is not a Buffer');
    }
}

function checkString(val: any) {
    if (typeof val !== 'string') {
        throw new TypeError('value is not a string');
    }
}


const enum Type {
    UInt8,
    Int8,
    Int16,
    Int32,
    String,
    Buffer,
}

type ChunkData = number | string | Buffer;
type Chunk = [Type, number, ChunkData];

export default class MessageWriter {
    static createHeaderOnlyBuffer(type: string) {
        return new Buffer([type.charCodeAt(0), 0x00, 0x00, 0x00, 0x04]);
    }

    private _size: number;
    private _chunks: Chunk[];
    private _currentSize: number;
    private _currentSizeChunk: Chunk;

    constructor() {
        this._clear();
    }

    private _clear() {
        this._size = 0;
        this._chunks = [];
        this._currentSize = 0;
        this._currentSizeChunk = null;
    }

    private _endPacket() {
        if (this._currentSize > 0) {
            this._currentSizeChunk[1] = this._currentSize;
            this._size += this._currentSize;
            this._currentSize = 0;
        }
    }

    beginPacket(type?: string) {
        this._endPacket();

        if (type !== undefined) {
            this.putChar(type);
        }

        this.putInt32(0);
        this._currentSizeChunk = this._chunks[this._chunks.length - 1];
    }

    finish() {
        this._endPacket();

        const buffer = new Buffer(this._size);
        let offset = 0;

        for (let i = 0; i < this._chunks.length; i++) {
            const [type, length, data] = this._chunks[i];

            switch (type) {
                case Type.UInt8:
                    buffer.writeUInt8(data as number, offset, true);
                    break;
                case Type.Int8:
                    buffer.writeInt8(data as number, offset, true);
                    break;
                case Type.Int16:
                    buffer.writeInt16BE(data as number, offset, true);
                    break;
                case Type.Int32:
                    buffer.writeInt32BE(data as number, offset, true);
                    break;
                case Type.Buffer:
                    (data as Buffer).copy(buffer, offset);
                    break;
                case Type.String:
                    buffer.write(data as string, offset, length, 'utf8');
                    break;
            }

            offset += length;
        }

        this._clear();

        return buffer;
    }

    putUInt8(data: number) {
        checkInt(data, 0x00, 0xff);

        const length = 1;
        this._chunks.push([Type.UInt8, length, data]);
        this._currentSize += length;
    }

    putInt8(data: number) {
        checkInt(data, -0x80, 0x7f);

        const length = 1;
        this._chunks.push([Type.Int8, length, data]);
        this._currentSize += length;
    }

    putInt16(data: number) {
        checkInt(data, -0x8000, 0x7fff);

        const length = 2;
        this._chunks.push([Type.Int16, length, data]);
        this._currentSize += length;
    }

    putInt32(data: number) {
        checkInt(data, -0x80000000, 0x7fffffff);

        const length = 4;
        this._chunks.push([Type.Int32, length, data]);
        this._currentSize += length;
    }

    putChar(data: string) {
        checkString(data);

        this.putUInt8(data.charCodeAt(0));
    }

    putBytes(data: Buffer, sizePrefix?: boolean) {
        checkBuffer(data);

        const length = data.length;

        if (sizePrefix) {
            this.putInt32(length);
        }

        this._chunks.push([Type.Buffer, length, data]);
        this._currentSize += length;
    }

    putString(data: string, sizePrefix?: boolean) {
        checkString(data);

        const length = Buffer.byteLength(data);

        if (sizePrefix) {
            this.putInt32(length);
        }

        this._chunks.push([Type.String, length, data]);
        this._currentSize += length;
    }

    putCString(data: string) {
        this.putString(data);
        this.putUInt8(0);
    }
}
