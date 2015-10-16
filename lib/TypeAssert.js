'use strict';

/*
 * This file makes sure (on a basic level) that TypeReaders.js and TypeWriters.js
 * have been written correctly and can be used interchangeably.
 */
function getKeys(arr) {
	const ret = [];

	for (let i = 0; i < arr.length; i++) {
		if (arr[i]) {
			ret.push(i);
		}
	}

	return ret;
}

const keys = {
	TypeReaders: getKeys(require('./TypeReaders')),
	TypeWriters: getKeys(require('./TypeWriters')),
};

function assert(a, b) {
	const diff = keys[a].filter(type => keys[b].indexOf(type) === -1);
	console.assert(diff.length === 0, `${a} contains types ${diff} not found in ${b}`);
}

assert('TypeReaders', 'TypeWriters');
assert('TypeWriters', 'TypeReaders');
