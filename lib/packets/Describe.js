'use strict';

function Packet$Describe(name, isPortal) {
	this.beginPacket('D');

	this.putChar(isPortal ? 'P' : 'S');
	this.putCString(name);
}


module.exports = Packet$Describe;
