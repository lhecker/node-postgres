import * as packets from './packets';
import * as util from 'util';
import ConnectionConfig from './ConnectionConfig';
import debug from './debug';
import {ExtendedQueryOptions} from './QueryTypes';

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

class MessageWriter {
    private _size: number;
    private _chunks: Chunk[];
    private _currentChunkLength: number;
    private _currentLengthField: Chunk;

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

            // Since the type field is not counted towards
            // the chunk length we have to trick a bit.
            this._size++;
            this._currentChunkLength = 0;
        }

        this.putInt32(0);
        this._currentLengthField = this._chunks[this._chunks.length - 1];
    }

    public finish(): Buffer {
        this._endPacket();

        const buffer = new Buffer(this._size);
        let offset = 0;

        for (let [type, length, data] of this._chunks) {
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
        this._currentChunkLength += length;
    }

    public putInt8(data: number) {
        checkInt(data, -0x80, 0x7f);

        const length = 1;
        this._chunks.push([Type.Int8, length, data]);
        this._currentChunkLength += length;
    }

    public putInt16(data: number) {
        checkInt(data, -0x8000, 0x7fff);

        const length = 2;
        this._chunks.push([Type.Int16, length, data]);
        this._currentChunkLength += length;
    }

    public putInt32(data: number) {
        checkInt(data, -0x80000000, 0x7fffffff);

        const length = 4;
        this._chunks.push([Type.Int32, length, data]);
        this._currentChunkLength += length;
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
        this._currentChunkLength += length;
    }

    public putCString(data: string) {
        this.putBytes(data);
        this.putUInt8(0);
    }

    private _clear() {
        this._size = 0;
        this._chunks = [];
        this._currentChunkLength = 0;
        this._currentLengthField = null as any as Chunk;
    }

    private _endPacket() {
        if (this._currentChunkLength > 0) {
            this._currentLengthField[2] = this._currentChunkLength;
            this._size += this._currentChunkLength;
            this._currentChunkLength = 0;
        }
    }
}

interface MessageWriter {
    addBind(this: MessageWriter, opts: ExtendedQueryOptions): void;
    addClose(this: MessageWriter, name: string, both: boolean): void;
    addCopyData(this: MessageWriter): void;
    addCopyDone(this: MessageWriter): void;
    addCopyFail(this: MessageWriter): void;
    addDescribe(this: MessageWriter, name: string, isPortal: boolean): void;
    addExecute(this: MessageWriter, name: string): void;
    addFlush(this: MessageWriter): void;
    addFunctionCall(this: MessageWriter): void;
    addParse(this: MessageWriter, opts: ExtendedQueryOptions): void;
    addPasswordMessage(this: MessageWriter, password: string): void;
    addQuery(this: MessageWriter, query: string): void;
    addStartupMessage(this: MessageWriter, config: ConnectionConfig): void;
    addSync(this: MessageWriter): void;
    addTerminate(this: MessageWriter): void;
}

(() => {
    function apply(name: string, fn: Function) {
        MessageWriter.prototype['add' + name] = fn;
    }

    function prodApply(name: string) {
        apply(name, packets[name]);
    }

    function debugApply(name: string) {
        const packetFn: Function = packets[name];
        const paramNames = packetFn.toString().match(/^[^(]+\(([^)]*)/)[1].split(', ');

        apply(name, function debugProxy() {
            const args = paramNames.map((name, idx) => {
                const arg = util.inspect(arguments[idx], <any>{ depth: 1, maxArrayLength: 3 });
                return ` ${name}=${arg}`;
            }).join('');

            debug('<<<', `Packet$${name}${args}`);
            packetFn.apply(this, arguments);
        });
    }

    Object.keys(packets).forEach(debug.enabled ? debugApply : prodApply);
})();

export default MessageWriter;
