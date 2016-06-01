function checkInt(val: any, lo: number, hi: number) {
    if (typeof val !== 'number' || val < lo || val > hi) {
        throw new TypeError('value is out of bounds');
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
    private _size: number;
    private _chunks: Chunk[];
    private _currentSize: number;
    private _currentSizeChunk: Chunk;

    public static createHeaderOnlyBuffer(type: string) {
        return new Buffer([type.charCodeAt(0), 0x00, 0x00, 0x00, 0x04]);
    }

    public constructor() {
        this._clear();
    }

    public beginPacket(type?: string) {
        this._endPacket();

        if (type !== undefined) {
            this.putChar(type);
        }

        this.putInt32(0);
        this._currentSizeChunk = this._chunks[this._chunks.length - 1];
    }

    public finish(): Buffer {
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

    public putUInt8(data: number) {
        checkInt(data, 0x00, 0xff);

        const length = 1;
        this._chunks.push([Type.UInt8, length, data]);
        this._currentSize += length;
    }

    public putInt8(data: number) {
        checkInt(data, -0x80, 0x7f);

        const length = 1;
        this._chunks.push([Type.Int8, length, data]);
        this._currentSize += length;
    }

    public putInt16(data: number) {
        checkInt(data, -0x8000, 0x7fff);

        const length = 2;
        this._chunks.push([Type.Int16, length, data]);
        this._currentSize += length;
    }

    public putInt32(data: number) {
        checkInt(data, -0x80000000, 0x7fffffff);

        const length = 4;
        this._chunks.push([Type.Int32, length, data]);
        this._currentSize += length;
    }

    public putChar(data: string) {
        this.putUInt8(data.charCodeAt(0));
    }

    public putBytes(data: string | Buffer, sizePrefix?: boolean) {
        const isString = typeof data === 'string';
        const length = Buffer.byteLength(<string>data);

        if (sizePrefix) {
            this.putInt32(length);
        }

        this._chunks.push([isString ? Type.String : Type.Buffer, length, data]);
        this._currentSize += length;
    }

    public putCString(data: string) {
        this.putBytes(data);
        this.putUInt8(0);
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
}
