'use strict';

const PacketBuilder = require('../PacketBuilder');


function Packet$Query(query) {
	const builder = new PacketBuilder('Q');
	builder.putString(query);
	return builder.finish();
}


module.exports = Packet$Query;
