'use strict';

function Packet$Close(name, portalOnly) {
	this.beginPacket('C');

	this.putChar(portalOnly ? 'P' : 'S');
	this.putCString(name);
}


module.exports = Packet$Close;
