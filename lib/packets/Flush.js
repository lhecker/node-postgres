'use strict';

const EmptyPacket = require('../EmptyPacket');
const PacketTypes = require('../PacketTypes');

const buffer = new EmptyPacket('H');


function Packet$Flush() {
	return new PacketTypes.Packet(buffer);
}


module.exports = Packet$Flush;
