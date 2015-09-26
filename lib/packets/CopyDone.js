'use strict';

const EmptyPacket = require('../EmptyPacket');
const PacketTypes = require('../PacketTypes');

const buffer = new EmptyPacket('c');


function Packet$CopyDone() {
	return new PacketTypes.Packet(buffer);
}


module.exports = Packet$CopyDone;
