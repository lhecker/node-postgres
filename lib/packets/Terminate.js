'use strict';

const EmptyPacket = require('../EmptyPacket');
const buffer      = new EmptyPacket('X');


function Packet$Terminate() {
	return buffer;
}


module.exports = Packet$Terminate;
