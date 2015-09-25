'use strict';

const EmptyPacket = require('../EmptyPacket');
const buffer      = new EmptyPacket('H');


function Packet$Flush() {
	return buffer;
}


module.exports = Packet$Flush;
