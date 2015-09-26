'use strict';

const PacketBuilder = require('../PacketBuilder');
const PacketTypes   = require('../PacketTypes');


function Packet$PasswordMessage(password) {
	const builder = new PacketBuilder('p');
	builder.putString(password);
	return new PacketTypes.Packet(builder.finish(), true);
}


module.exports = Packet$PasswordMessage;
