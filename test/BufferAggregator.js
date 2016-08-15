/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */
require('source-map-support').install();

const BufferAggregator = require('../lib/BufferAggregator').default;
const expect = require('chai').expect;

describe('BufferAggregator', function () {
    let aggregator;

    beforeEach(function () {
        aggregator = new BufferAggregator();
    });

    it('have the expected members', function () {
        expect(aggregator._buffers).to.be.an('array');
        expect(aggregator._totalSize).to.be.an('number');
    });

    describe('#length', function () {
        it('should be the sum', function () {
            aggregator.push(new Buffer('bb'));
            aggregator.push(new Buffer('ccc'));

            expect(aggregator.length).to.equal(5);
        });
    });

    describe('#clear()', function () {
        it('should clear the content', function () {
            aggregator.push(new Buffer('bb'));
            aggregator.push(new Buffer('ccc'));
            aggregator.clear();

            expect(aggregator._buffers).to.be.empty;
            expect(aggregator._totalSize).to.be.empty;
            expect(aggregator.length).to.be.empty;
        });
    });

    describe('#join()', function () {
        it('should result in a single buffer', function () {
            aggregator.push(new Buffer('bb'));
            aggregator.push(new Buffer('ccc'));

            const ret = aggregator.join();

            expect(ret.equals(new Buffer('bbccc'))).to.be.true;
            expect(aggregator._buffers[0]).to.equal(ret);
            expect(aggregator._buffers.length).to.equal(1);
            expect(aggregator._totalSize).to.equal(ret.length);
        });

        it('should no-op if possible', function () {
            const buf = new Buffer('bb');

            aggregator.push(buf);

            const ret = aggregator.join();

            expect(ret).to.equal(buf);
            expect(aggregator._buffers[0]).to.equal(buf);
        });
    });
});
