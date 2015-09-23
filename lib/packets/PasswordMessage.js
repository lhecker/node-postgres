'use strict';

const PacketBuilder = require('../PacketBuilder');


function PasswordMessagePacket(password) {
	const builder = new PacketBuilder('p');
	builder.putString(password);
	return builder.finish();
}


module.exports = PasswordMessagePacket;
