'use strict';

const PacketBuilder = require('../PacketBuilder');
const PacketTypes   = require('../PacketTypes');


function Packet$Query(query) {
	const builder = new PacketBuilder('Q');
	builder.putString(query);
	return new PacketTypes.Query(builder.finish(), true);
}


module.exports = Packet$Query;
