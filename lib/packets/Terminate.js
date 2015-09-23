'use strict';

const EmptyPacket = require('../EmptyPacket');
const buffer      = new EmptyPacket('X');


function TerminatePacket() {
	return buffer;
}


module.exports = TerminatePacket;
