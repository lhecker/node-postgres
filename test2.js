"use strict";

const o = {
    x: 0,
};

function test() {
    for (let i = 0; i < iters; i++) {
        o.x++;
    }
}

const iters = 1000 * 1000;
const beg = Date.now();
test();
const end = Date.now();
console.log(iters / ((end - beg)));
console.log(o.x);
