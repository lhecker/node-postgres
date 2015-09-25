'use strict';

const PacketBuilder = require('../PacketBuilder');


function Packet$PasswordMessage(password) {
	const builder = new PacketBuilder('p');
	builder.putString(password);
	return builder.finish();
}


module.exports = Packet$PasswordMessage;
