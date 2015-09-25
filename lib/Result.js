'use strict';

const Types = require('./Types');


/*
 * Improves performance by about 30-35%.
 */
function createRowParser(fields) {
	const parserVars = fields.map((field, idx) => 'p' + idx + ' = (Types[' + field.typeId + '] || Types.default)[' + field.formatCode + ']').join(', ');
	const rowObject  = fields.map((field, idx) => '"' + field.name + '": reader.parseDataColumn(p' + idx + ')').join(', ');
	const body       = 'var ' + parserVars + ';\nreturn function Parser$DataRow$Custom(reader) {\nreturn {' + rowObject + '};\n};';
	return new Function('Types', body)(Types);
}


class Result {
	constructor(fields) {
		if (fields && fields.length) {
			Object.defineProperty(this, '_parser', {
				value: createRowParser(fields),
			});
		}

		this.command = undefined;
		this.fields = fields || [];
		this.rows = [];
	}
}


module.exports = Result;
