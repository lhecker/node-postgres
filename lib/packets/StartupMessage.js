'use strict';

function Packet$StartupMessage(options) {
	this.beginPacket();

	this.putInt32(196608);
	this.putCString('user');
	this.putCString(options.user);

	if (options.database) {
		this.putCString('database');
		this.putCString(options.database);
	}

	this.putCString('client_encoding');
	this.putCString('UTF8');

	this.putCString('DateStyle');
	this.putCString('ISO, MDY');

	this.putInt8(0);
}


module.exports = Packet$StartupMessage;
