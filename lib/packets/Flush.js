'use strict';

const EmptyPacket = require('../EmptyPacket');
const buffer      = new EmptyPacket('H');


function FlushPacket() {
	return buffer;
}


module.exports = FlushPacket;
