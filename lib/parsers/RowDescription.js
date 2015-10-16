'use strict';

const debug   = require('../debug');
const Result  = require('../Result');


Parser$RowDescription.type = 'T';
function Parser$RowDescription(conn, reader) {
	const fieldCount = reader.getInt16();

	debug.enabled && debug('---', `Parser$RowDescription fieldCount=${fieldCount}`);

	const fields = [];

	for (let i = 0; i < fieldCount; i++) {
		const name            = reader.getCString();
		const objectId        = reader.getInt32();
		const attributeNumber = reader.getInt16();
		const typeId          = reader.getInt32();
		const typeSize        = reader.getInt16();
		const typeModifier    = reader.getInt32();
		const formatCode      = reader.getInt16();

		fields.push({
			name,
			objectId,
			attributeNumber,
			typeId,
			typeSize,
			typeModifier,
			formatCode,
		});

		debug.enabled && debug('---', `Parser$RowDescription name=${name} objectId=${objectId} attributeNumber=${attributeNumber} typeId=${typeId} typeSize=${typeSize} typeModifier=${typeModifier} formatCode=${formatCode}`);
	}

	conn._queuePeek().results.push(new Result(fields));
}


module.exports = Parser$RowDescription;
