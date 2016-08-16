/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

const Bluebird = require('bluebird');
const connect = require('../lib/index').connect;
const expect = require('chai').expect;

describe('Connection', function () {
    const uri = process.env.PGURI;
    let conn;

    expect(uri).to.be.a('string', 'PGURI env var missing!');
    expect(uri).to.satisfy(uri => uri.startsWith('postgres'));

    it('#connect', function () {
        this.timeout(10000);

        return connect(uri, true).then(c => {
            conn = c;
        });
    });

    {
        const generate = function* (count) {
            for (let i = 0; i < count; i++) {
                yield conn.queryText(`SELECT '${i}'::int4 as col`);
            }
        };

        const query = function (count) {
            return Bluebird.all(generate(count)).then(arr => {
                for (let i = 0; i < count; i++) {
                    const res = arr[i];

                    expect(res)
                        .to.be.instanceof(Array)
                        .to.have.lengthOf(1);

                    expect(res[0])
                        .to.include.keys('rows');

                    expect(res[0].rows)
                        .to.deep.equal([{ col: i }]);
                }
            })
        };

        it('#queryText single', function () {
            return query(1);
        });

        it('#queryText multi', function () {
            return query(10);
        });
    }

    {
        const generate = function* (count) {
            for (let i = 0; i < count; i++) {
                yield conn.query(`SELECT $1 as col`, [i]);
            }
        };

        const query = function (count) {
            return Bluebird.all(generate(count)).then(arr => {
                for (let i = 0; i < count; i++) {
                    const res = arr[i];

                    expect(res)
                        .to.be.an('object')
                        .to.include.keys('rows');

                    expect(res.rows)
                        .to.deep.equal([{ col: i }]);
                }
            })
        };

        it('#query single', function () {
            return query(1);
        });

        it('#query multi', function () {
            return query(10);
        });
    }

    it('#end', function () {
        return conn.end();
    });
});
