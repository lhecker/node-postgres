'use strict';

const debug = require('../debug');
const TransactionState = require('../TransactionState');


ReadyForQueryParser.type = 'Z';
function ReadyForQueryParser(conn, reader) {
	const status = reader.getUInt8();
	let stateName;

	switch (status) {
		case 0x49 /* I */: stateName = 'IDLE';    break;
		case 0x54 /* T */: stateName = 'ONGOING'; break;
		case 0x45 /* E */: stateName = 'FAILED';  break;
		default:
			throw new Error('invalid transaction state');
	}

	debug.enabled && debug('>>>', `ReadyForQueryParser state=${stateName}`);

	conn._transactionState = TransactionState[stateName];
	conn.emit('drain');
}


module.exports = ReadyForQueryParser;
