/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */
require('source-map-support').install();

const MessageWriter = require('../lib/MessageWriter').default;
const expect = require('chai').expect;

describe('MessageWriter', function () {
    let writer;

    beforeEach(function () {
        writer = new MessageWriter();
    });

    it('should handle the empty state', function () {
        expect(writer.finish()).to.deep.equal([]);
    });

    it('should handle non-messages', function () {
        writer.putUInt32(1234);

        expect(writer.finish()).to.deep.equal([Buffer.from([
            0x00, 0x00, 0x04, 0xd2,
        ])]);
    });

    it('should handle empty messages', function () {
        writer.beginPacket('a');

        expect(writer.finish()).to.deep.equal([Buffer.from([
            0x61,
            0x00, 0x00, 0x00, 0x04,
        ])]);
    });

    it('should handle integers', function () {
        writer.putUInt8(0x12);
        writer.putInt8(-0x12);
        writer.putUInt16(0x1234);
        writer.putInt16(-0x1234);
        writer.putUInt32(0x12345678);
        writer.putInt32(-0x12345678);

        expect(writer.finish()).to.deep.equal([Buffer.from([
            0x12,
            0xee,
            0x12, 0x34,
            0xed, 0xcc,
            0x12, 0x34, 0x56, 0x78,
            0xed, 0xcb, 0xa9, 0x88,
        ])]);
    });

    it('should handle floats', function () {
        writer.putFloat(123);
        writer.putDouble(-123);

        expect(writer.finish()).to.deep.equal([Buffer.from([
            0x42, 0xf6, 0x0, 0x0,
            0xc0, 0x5e, 0xc0, 0x0, 0x0, 0x0, 0x0, 0x0,
        ])]);
    });

    it('should handle buffers and strings', function () {
        writer.putBytes(Buffer.from([0x61, 0x62, 0x63]));
        writer.putBytes('def');
        writer.putCString('ghi');

        expect(writer.finish()).to.deep.equal([Buffer.from([
            0x61, 0x62, 0x63,
            0x64, 0x65, 0x66,
            0x67, 0x68, 0x69, 0x00,
        ])]);
    });

    it('should not create slow buffers', function () {
        const maxPoolSize = (Buffer.poolSize || 8192) >>> 1;
        const iterations = maxPoolSize / 4 + 1;

        for (let i = 0; i < iterations; i++) {
            writer.putUInt32(0x12345678);
        }

        const data = writer.finish();

        expect(data.length).to.equal(2);
        expect(data[0].length).to.equal(maxPoolSize - 4);
        expect(data[1].length).to.equal(8);
    });

    it('should not copy large buffers', function () {
        const buf = Buffer.allocUnsafe(1234);

        writer.beginPacket('b');
        writer.putUInt32(0x12345678);
        writer.putBytes(buf);
        writer.putUInt32(0x87654321);
        writer.beginPacket('a');

        const data = writer.finish();

        expect(data.length).to.equal(3);

        expect(data[0]).to.deep.equal(Buffer.from([
            0x62,
            0x00, 0x00, 0x04, 0xde,
            0x12, 0x34, 0x56, 0x78,
        ]));
        expect(data[1]).to.equal(buf);
        expect(data[2]).to.deep.equal(Buffer.from([
            0x87, 0x65, 0x43, 0x21,
            0x61,
            0x00, 0x00, 0x00, 0x04,
        ]));
    });
});
