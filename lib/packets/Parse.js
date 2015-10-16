'use strict';

function Packet$Parse(name, query, values, types) {
	this.beginPacket('P');

	this.putCString(name);
	this.putCString(query);
	this.putInt16(types.length);
	types.forEach(this.putInt32, this);
}


module.exports = Packet$Parse;
