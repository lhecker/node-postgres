/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as packets from './packets';
import ConnectionConfig from './ConnectionConfig';
import debug from './debug';
import { ExtendedQueryOptions } from './QueryTypes';
import { inspect } from 'util';

function TYPE_UINT8(buffer: Buffer, offset: number, data: number)  { buffer.writeUInt8(data, offset, true);    return 1;           }
function TYPE_INT8(buffer: Buffer, offset: number, data: number)   { buffer.writeInt8(data, offset, true);     return 1;           }
function TYPE_UINT16(buffer: Buffer, offset: number, data: number) { buffer.writeUInt16BE(data, offset, true); return 2;           }
function TYPE_INT16(buffer: Buffer, offset: number, data: number)  { buffer.writeInt16BE(data, offset, true);  return 2;           }
function TYPE_UINT32(buffer: Buffer, offset: number, data: number) { buffer.writeUInt32BE(data, offset, true); return 4;           }
function TYPE_INT32(buffer: Buffer, offset: number, data: number)  { buffer.writeInt32BE(data, offset, true);  return 4;           }
function TYPE_FLOAT(buffer: Buffer, offset: number, data: number)  { buffer.writeFloatBE(data, offset, true);  return 4;           }
function TYPE_DOUBLE(buffer: Buffer, offset: number, data: number) { buffer.writeDoubleBE(data, offset, true); return 8;           }
function TYPE_BUFFER(buffer: Buffer, offset: number, data: Buffer) { (data as Buffer).copy(buffer, offset);    return data.length; }

function checkInt(val: any, lo: number, hi: number) {
    if (typeof val !== 'number' || val < lo || val > hi) {
        throw new TypeError('value is out of bounds');
    }
}

// See docs for Buffer.poolSize at https://nodejs.org/api/buffer.html#buffer_class_method_buffer_allocunsafe_size
const MAX_FAST_BUFFER_SIZE = ((<any>Buffer).poolSize || 8192) >>> 1;

type TypeOp = (buffer: Buffer, offset: number, data: any) => number;
type AccChunkData = number | string | Buffer;

interface AccChunk {
    op: TypeOp;
    data: AccChunkData;
}

interface Acc {
    acc: AccChunk[];
    size: number;
}

type Chunk = Buffer | Acc;

class MessageWriter {
    private _chunks: Chunk[];

    // The main "ACCumulator". In _flushAcc() the pieces contained
    // in here will be merged into a single Buffer.
    private _acc: AccChunk[];

    // Contains the total length of all pieces in _acc.
    // This field is only updated sporadically in _endPacket().
    private _accSize: number;

    // Contains the current message length.
    // _flushAcc() does not necessarely reset this to 0.
    private _messageLength: number;

    // A backreference to the length field in the last message header.
    // This is used to retroactively set the correct message length.
    private _messageLengthField: null | AccChunk;

    public static createHeaderOnlyBuffer(type: string) {
        return Buffer.from([type.charCodeAt(0), 0x00, 0x00, 0x00, 0x04]);
    }

    public constructor() {
        this._clear();
    }

    public get messageLength() {
        return this._messageLength;
    }

    public beginPacket(type?: string) {
        this._endPacket();

        if (type !== undefined) {
            this.putChar(type);

            // Since the type field is NOT counted towards
            // the message length we have to trick a bit.
            this._messageLength = 0;
        }

        const ret = this.putLengthField();
        this._messageLengthField = ret;
    }

    public finish(): Buffer[] {
        this._endPacket();
        this._flushAcc();

        const buffers = this._chunks;

        this._clear();

        for (let i = 0; i < buffers.length; i++) {
            const chunk = buffers[i];

            if (!(chunk instanceof Buffer)) {
                buffers[i] = accChunkToBuffer(chunk);
            }
        }

        return buffers as Buffer[];
    }

    public putLengthField(): AccChunk {
        this._pushAcc(TYPE_INT32, 0, 4);
        return this._acc[this._acc.length - 1];
    }

    public putFloat(data: number) {
        this._pushAcc(TYPE_FLOAT, data, 4);
    }

    public putDouble(data: number) {
        this._pushAcc(TYPE_DOUBLE, data, 8);
    }

    public putChar(data: string) {
        this.putUInt8(data.charCodeAt(0));
    }

    public putCString(data: string) {
        this.putBytes(data);
        this.putUInt8(0);
    }

    public putBytes(data: string | Buffer, sizePrefix?: boolean) {
        if (data.length === 0) {
            return;
        }

        if (typeof data === 'string') {
            data = Buffer.from(data, 'utf8');
        }

        const length = data.length;

        // Here we prevent copying around large buffers:
        // Testing showed that copying buffers with sizes between 0
        // and 1024 bytes is almost always of similar performance,
        // while dropping off sharply starting at sizes of about 2048 bytes.
        if (length < 1024) {
            this._pushAcc(TYPE_BUFFER, data, length);
        } else {
            this._pushChunk(data, length);
        }
    }

    private _pushAcc(op: TypeOp, data: AccChunkData, length: number) {
        // Here we prevent creating buffers larger than (Buffer.poolSize >>> 1).
        // Allocations greater than or equal to that do not use the
        // fast internal buffer pool. See here for more information:
        // https://github.com/nodejs/node/blob/8f90dcc1b8e4ac3d8597ea2ee3927f325cc980d3/lib/buffer.js#L173
        if (this._accSize + length >= MAX_FAST_BUFFER_SIZE) {
            this._flushAcc();
        }

        this._acc.push({ op, data });
        this._accSize += length;
        this._messageLength += length;
    }

    private _pushChunk(chunk: Chunk, length: number) {
        this._flushAcc();
        this._chunks.push(chunk);
        this._messageLength += length;
    }

    private _endPacket() {
        if (this._messageLengthField) {
            this._messageLengthField.data = this._messageLength;
            this._messageLengthField = null;
            this._messageLength = 0;
        }
    }

    private _flushAcc() {
        if (this._accSize > 0) {
            this._chunks.push({ acc: this._acc, size: this._accSize });
            this._acc = [];
            this._accSize = 0;
        }
    }

    private _clear() {
        this._chunks = [];
        this._acc = [];
        this._accSize = 0;
        this._messageLength = 0;
        this._messageLengthField = null;
    }
}

function accChunkToBuffer(accChunk: Acc): Buffer {
    const buffer = Buffer.allocUnsafe(accChunk.size);
    let offset = 0;

    for (let chunk of accChunk.acc) {
        offset += chunk.op(buffer, offset, chunk.data);
    }

    return buffer;
}

interface MessageWriter {
    putUInt8(data: number): void;
    putInt8(data: number): void;
    putUInt16(data: number): void;
    putInt16(data: number): void;
    putUInt32(data: number): void;
    putInt32(data: number): void;

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

// Dynamically add the methods listed in the interface above
(() => {
    function setProto(key: string, val: any) {
        Object.defineProperty(MessageWriter.prototype, key, {
            configurable: true,
            value: val,
            writable: true,
        });
    }

    const intMembers: [string, TypeOp, number, number, number][] = [
        ['putUInt8',  TYPE_UINT8,  1,  0x00,       0xff      ],
        ['putInt8',   TYPE_INT8,   1, -0x80,       0x7f      ],
        ['putUInt16', TYPE_UINT16, 2,  0x0000,     0xffff    ],
        ['putInt16',  TYPE_INT16,  2, -0x8000,     0x7fff    ],
        ['putUInt32', TYPE_UINT32, 4,  0x00000000, 0xffffffff],
        ['putInt32',  TYPE_INT32,  4, -0x80000000, 0x7fffffff],
    ];

    intMembers.forEach(([name, op, length, lower, upper]) => {
        const fn = function (this: any, data: number) {
            checkInt(data, lower, upper);
            this._pushAcc(op, data, length);
        };

        Object.defineProperty(fn, 'name', { value: `MessageWriter.${name}` });
        setProto(name, fn);
    });

    for (let name of Object.keys(packets)) {
        setProto('add' + name, packets[name]);
    }

    // Proxy and log calls to member methods in debug mode
    if (debug.enabled) {
        // If a put method
        let preventLogging = false;

        const apply = function (key: string, alwaysLog: boolean) {
            const fn = MessageWriter.prototype[key] as Function;
            const m = fn.toString().match(/^[^(]+\(([^)]+)/);
            let fmtString = alwaysLog ? '<<<' : '---';
            let paramCount = 0;

            fmtString += ' MessageWriter.' + key;

            if (m) {
                const paramNames = m[1].split(/,\s*/g);
                fmtString += ' ' + paramNames.map(name => name + '=%o').join(' ');
                paramCount = paramNames.length;
            }

            setProto(key, function debugProxy(this: MessageWriter) {
                const setPreventLogging = !alwaysLog && !preventLogging;

                if (setPreventLogging) {
                    preventLogging = true;
                }

                if (alwaysLog || setPreventLogging) {
                    const args = new Array(paramCount + 1);

                    args[0] = fmtString;

                    for (let i = 0; i < arguments.length; i++) {
                        args[i + 1] = arguments[i];
                    }

                    debug.apply(null, args);
                }

                const ret = fn.apply(this, arguments);

                if (setPreventLogging) {
                    preventLogging = false;
                }

                return ret;
            });
        }

        for (let key of Object.getOwnPropertyNames(MessageWriter.prototype)) {
            const startsWithAdd = key.startsWith('add');
            const startsWithPut = key.startsWith('put');

            if (startsWithAdd || startsWithPut) {
                apply(key, startsWithAdd);
            }
        }
    }
})();

export default MessageWriter;
