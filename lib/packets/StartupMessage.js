'use strict';

const PacketBuilder = require('../PacketBuilder');


function StartupMessagePacket(options) {
	const builder = new PacketBuilder();

	builder.putInt32(196608);
	builder.putString('user');
	builder.putString(options.user);

	if (options.database) {
		builder.putString('database');
		builder.putString(options.database);
	}

	builder.putString('client_encoding');
	builder.putString("'UTF8'");
	builder.putInt8(0);

	return builder.finish();
}


module.exports = StartupMessagePacket;
