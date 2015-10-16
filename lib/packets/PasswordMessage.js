'use strict';

function Packet$PasswordMessage(password) {
	this.beginPacket('p');
	this.putCString(password);
}


module.exports = Packet$PasswordMessage;
