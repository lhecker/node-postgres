/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */
require('source-map-support').install();

const connect = require('../lib/index').connect;
const expect = require('chai').expect;

describe('Connection', function () {
    const uri = process.env.PGURI;
    let conn;

    expect(uri).to.be.a('string', 'PGURI env var missing!');
    expect(uri).to.satisfy(uri => uri.startsWith('postgres'));

    beforeEach(function () {
        return connect(uri, true).then(c => {
            conn = c;
        });
    });

    afterEach(function () {
        return conn.end();
    });

    it('test', function () {
        return conn.query(`SELECT 'test' as col`)
            .then(res => {
                expect(res).to.include.keys('rows');
                expect(res.rows).to.deep.equal([
                    {
                        col: 'test',
                    }
                ]);
            })
    });
});
