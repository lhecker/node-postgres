'use strict';

const perIdentifier = {
	S: 'severity',
	C: 'code',
	M: 'message',
	D: 'detail',
	H: 'hint',
	P: 'position',
	p: 'internalPosition',
	q: 'internalQuery',
	W: 'where',
	s: 'schemaName',
	t: 'tableName',
	c: 'columnName',
	d: 'dataTypeName',
	n: 'constraintName',
	F: 'file',
	L: 'line',
	R: 'routine',
};

const perName = {};
const uint8 = new Array(256);

for (let key in perIdentifier) {
	const value = perIdentifier[key];
	perName[value] = key;
	uint8[key.charCodeAt(0)] = value;
}


exports.perIdentifier    = perIdentifier;
exports.perName          = perName;
exports.uint8            = uint8;
