'use strict';

const EmptyPacket = require('../EmptyPacket');
const buffer      = new EmptyPacket('c');


function Packet$CopyDone() {
	return buffer;
}


module.exports = Packet$CopyDone;
