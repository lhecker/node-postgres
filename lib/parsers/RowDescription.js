'use strict';

const debug = require('../debug');


RowDescriptionParser.type = 'T';
function RowDescriptionParser(conn, reader) {
	const query = conn._activeQuery;
	const fieldCount = reader.getInt16();

	debug.enabled && debug('---', `RowDescriptionParser fieldCount=${fieldCount}`);

	for (let i = 0; i < fieldCount; i++) {
		const name            = reader.getString();
		const objectId        = reader.getInt32();
		const attributeNumber = reader.getInt16();
		const typeId          = reader.getInt32();
		const typeSize        = reader.getInt16();
		const typeModifier    = reader.getInt32();
		const formatCode      = reader.getInt16();

		query.fields.push({
			name,
			objectId,
			attributeNumber,
			typeId,
			typeSize,
			typeModifier,
			formatCode,
		});

		debug.enabled && debug('---', `RowDescriptionParser name=${name} objectId=${objectId} attributeNumber=${attributeNumber} typeId=${typeId} typeSize=${typeSize} typeModifier=${typeModifier} formatCode=${formatCode}`);
	}
}


module.exports = RowDescriptionParser;
