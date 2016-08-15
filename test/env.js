/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */
require('source-map-support').install();

const expect = require('chai').expect;

describe('Date', function () {
    it('should accept PostgreSQL dates with timezones', function () {
        const date = new Date('2015-01-01 15:16:17.567891+02');

        expect(date.toISOString()).to.be.oneOf([
            '2015-01-01T13:16:17.567Z',
            '2015-01-01T13:16:17.568Z',
        ]);
    });

    describe('#toISOString()', function () {
        it('should follow strict ISO8601', function () {
            const date = new Date();
            const re = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

            expect(date.toISOString()).to.match(re);
        });

        it('should not strip the milliseconds', function () {
            function len(ts) {
                const date = new Date(ts);
                return date.toISOString().length;
            }

            expect(len(0)).to.equal(24);
            expect(len(1)).to.equal(24);
            expect(len(Math.PI)).to.equal(24);
            expect(len(-1000)).to.equal(24);
        });
    });
});
