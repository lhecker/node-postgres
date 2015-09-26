'use strict';

const debug            = require('../debug');
const TransactionState = require('../TransactionState');


Parser$ReadyForQuery.type = 'Z';
function Parser$ReadyForQuery(conn, reader) {
	const query = conn._queuePeek(true);
	const status = reader.getUInt8();
	let stateName;

	switch (status) {
		case 0x49 /* I */: stateName = 'IDLE';    break;
		case 0x54 /* T */: stateName = 'ONGOING'; break;
		case 0x45 /* E */: stateName = 'FAILED';  break;
		default:
			throw new Error('invalid transaction state');
	}

	debug.enabled && debug('>>>', `Parser$ReadyForQuery state=${stateName}`);

	conn._transactionState = TransactionState[stateName];
	conn._authenticated = true;

	if (query && query.waitsForReady) {
		conn._queueShift();
		conn._processPendingQueue();

		query.resolve();
	}
}


module.exports = Parser$ReadyForQuery;
