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

function checkInt(val: any, lo: number, hi: number) {
    if (typeof val !== 'number' || val < lo || val > hi) {
        throw new TypeError('value is out of bounds');
    }
}

const TYPE_UINT8: TypeOp = (buffer, offset, data) => void buffer.writeUInt8(data as number, offset, true);
const TYPE_INT8: TypeOp = (buffer, offset, data) => void buffer.writeInt8(data as number, offset, true);
const TYPE_UINT16: TypeOp = (buffer, offset, data) => void buffer.writeUInt16BE(data as number, offset, true);
const TYPE_INT16: TypeOp = (buffer, offset, data) => void buffer.writeInt16BE(data as number, offset, true);
const TYPE_UINT32: TypeOp = (buffer, offset, data) => void buffer.writeUInt32BE(data as number, offset, true);
const TYPE_INT32: TypeOp = (buffer, offset, data) => void buffer.writeInt32BE(data as number, offset, true);
const TYPE_FLOAT: TypeOp = (buffer, offset, data) => void buffer.writeFloatBE(data as number, offset, true);
const TYPE_DOUBLE: TypeOp = (buffer, offset, data) => void buffer.writeDoubleBE(data as number, offset, true);
const TYPE_BUFFER: TypeOp = (buffer, offset, data) => void (data as Buffer).copy(buffer, offset);

type TypeOp = (buffer: Buffer, offset: number, data: any) => void;
type AccData = [TypeOp, number | string | Buffer];
type ChunkData = Buffer | [AccData[], number];

class MessageWriter {
    private _chunks: ChunkData[];

    // The main "ACCumulator". In _flushAcc() the pieces contained
    // in here will be merged into a single Buffer.
    private _acc: AccData[];

    // Contains the total length of all pieces in _acc.
    // This field is only updated sporadically in _endPacket().
    private _accSize: number;

    // Contains the current message length.
    // _flushAcc() does not necessarely reset this to 0.
    private _messageLength: number;

    // A backreference to the length field in the last message header.
    // This is used to retroactively set the correct message length.
    private _messageLengthField: null | AccData;

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

            // Since the type field is NOT counted towards
            // the message length we have to trick a bit.
            this._accSize++;
            this._messageLength = 0;
        }

        this.putInt32(0);
        this._messageLengthField = this._acc[this._acc.length - 1];
    }

    public finish(): Buffer[] {
        this._endPacket();
        this._flushAcc();

        const buffers = this._chunks;

        this._clear();

        for (let i = 0; i < buffers.length; i++) {
            const chunk = buffers[i];

            if (!(chunk instanceof Buffer)) {
                buffers[i] = MessageWriter._accToBuff(chunk[0], chunk[1]);
            }
        }

        return buffers as Buffer[];
    }

    public putFloat(data: number) {
        this._acc.push([TYPE_FLOAT, data]);
        this._messageLength += 4;
    }

    public putDouble(data: number) {
        this._acc.push([TYPE_DOUBLE, data]);
        this._messageLength += 8;
    }

    public putChar(data: string) {
        this.putUInt8(data.charCodeAt(0));
    }

    public putBytes(data: string | Buffer, sizePrefix?: boolean) {
        if (typeof data === 'string') {
            data = Buffer.from(data, 'utf8');
        }

        if (sizePrefix) {
            this.putInt32(length);
        }

        // Prevent copying around large buffers
        // Testing showed that copying buffers with sizes between 0
        // and 1024 bytes is almost always of similar performance,
        // while dropping off sharply starting at sizes of 2048 bytes.
        if (data.length > 1024) {
            this._flushAcc();
            this._chunks.push(data);
        } else {
            this._acc.push([TYPE_BUFFER, data]);
        }

        this._messageLength += length;
    }

    public putCString(data: string) {
        this.putBytes(data);
        this.putUInt8(0);
    }

    private _clear() {
        this._chunks = [];
        this._acc = [];
        this._accSize = 0;
        this._messageLength = 0;
        this._messageLengthField = null;
    }

    private _endPacket() {
        const length = this._messageLength;

        if (length > 0) {
            this._messageLengthField![1] = length;
            this._accSize += length;
            this._messageLength = 0;
        }
    }

    private _flushAcc() {
        if (this._accSize > 0) {
            this._chunks.push([this._acc, this._accSize]);
            this._acc = [];
            this._accSize = 0;
        }
    }

    private static _accToBuff(acc: AccData[], accSize: number): Buffer {
        const buffer = (<any>Buffer).allocUnsafe(accSize);
        let offset = 0;

        for (let chunk of acc) {
            chunk[0](buffer, offset, chunk[1]);
            offset += length;
        }

        return buffer;
    }
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

// Dynamically generate put(U?)Int(8|16|32) member methods
(() => {
    const members: [string, number, number][] = [
        ['putUInt8', 0x00, 0xff],
        ['putInt8', -0x80, 0x7f],
        ['putUInt16', 0x0000, 0xffff],
        ['putInt16', -0x8000, 0x7fff],
        ['putUInt32', 0x00000000, 0xffffffff],
        ['putInt32', -0x80000000, 0x7fffffff],
    ];

    members.forEach(([name, lower, upper]) => {
        let fn = function (data: number) {
            checkInt(data, lower, upper);
            this._acc.push([TYPE_INT8, data]);
            this._messageLength += length;
        };

        Object.defineProperty(fn, 'name', { value: `MessageWriter.${name}` });
        MessageWriter.prototype[name] = fn;
    });
})();

// Dynamically generate packet methods
(() => {
    function apply(name: string, fn: Function) {
        MessageWriter.prototype['add' + name] = fn;
    }

    function prodApply(name: string) {
        apply(name, packets[name]);
    }

    function debugApply(name: string) {
        const packetFn: Function = packets[name];
        const m = packetFn.toString().match(/^[^(]+\(([^)]+)/);
        const paramNames = m ? m[1].split(', ') : [];

        apply(name, function debugProxy() {
            const args = paramNames.map((name, idx) => ` ${name}=${inspect(arguments[idx])}`).join('');
            debug('<<<', `Packet$${name}${args}`);
            packetFn.apply(this, arguments);
        });
    }

    Object.keys(packets).forEach(debug.enabled ? debugApply : prodApply);
})();

export default MessageWriter;
