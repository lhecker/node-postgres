'use strict';


function QueryPacket(query) {
	const builder = new PacketBuilder('Q');
	builder.putString(query);
	return builder.finish();
}


module.exports = QueryPacket;
