'use strict';

function Packet$Query(query) {
	this.beginPacket('Q');
	this.putCString(query);
}


module.exports = Packet$Query;
