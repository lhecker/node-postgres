'use strict';

const EmptyPacket = require('../EmptyPacket');
const buffer      = new EmptyPacket('c');


function CopyDonePacket() {
	return buffer;
}


module.exports = CopyDonePacket;
