'use strict';

exports.S = 'severity';
exports.C = 'code';
exports.M = 'message';
exports.D = 'detail';
exports.H = 'hint';
exports.P = 'position';
exports.p = 'internalPosition';
exports.q = 'internalQuery';
exports.W = 'where';
exports.s = 'schemaName';
exports.t = 'tableName';
exports.c = 'columnName';
exports.d = 'dataTypeName';
exports.n = 'constraintName';
exports.F = 'file';
exports.L = 'line';
exports.R = 'routine';


const UINT8 = new Array(256);

for (let key in exports) {
	UINT8[key.charCodeAt(0)] = exports[key];
}

exports.UINT8 = UINT8;
