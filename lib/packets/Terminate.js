'use strict';

const EmptyPacket = require('../EmptyPacket');
const PacketTypes = require('../PacketTypes');

const buffer = new EmptyPacket('X');


function Packet$Terminate() {
	return new PacketTypes.Packet(buffer, true);
}


module.exports = Packet$Terminate;
