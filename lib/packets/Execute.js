'use strict';

function Packet$Execute(name) {
	this.beginPacket('E');

	this.putCString(name);
	this.putInt32(0);
}


module.exports = Packet$Execute;
