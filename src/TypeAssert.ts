/*
 * This file makes sure (on a basic level) that TypeReaders.js and TypeWriters.js
 * have been written correctly and can be used interchangeably.
 */
const keys = {
    TypeReaders: Object.keys(require('./TypeReaders').types),
    TypeWriters: Object.keys(require('./TypeWriters').types),
};

function assert(a: string, b: string) {
    const diff = (<string[]>keys[a]).filter(type => keys[b].indexOf(type) === -1);
    console.assert(diff.length === 0, `${a} contains types ${diff} not found in ${b}`);
}

assert('TypeReaders', 'TypeWriters');
assert('TypeWriters', 'TypeReaders');
