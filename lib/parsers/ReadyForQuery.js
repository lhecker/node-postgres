'use strict';

const TransactionState = require('./TransactionState');


ReadyForQueryParser.type = 'Z';
function ReadyForQueryParser(conn, reader) {
	const status = reader.getUInt8();
	let state;

	switch (status) {
		case 0x49 /* I */: state = TransactionState.IDLE;    break;
		case 0x54 /* T */: state = TransactionState.ONGOING; break;
		case 0x45 /* E */: state = TransactionState.FAILED;  break;
		default:
			throw new Error('invalid transaction state');
	}

	conn._transactionState = state;
}


module.exports = ReadyForQueryParser;
