'use strict';

const PacketBuilder = require('../PacketBuilder');


function Packet$StartupMessage(options) {
	const builder = new PacketBuilder();

	builder.putInt32(196608);
	builder.putString('user');
	builder.putString(options.user);

	if (options.database) {
		builder.putString('database');
		builder.putString(options.database);
	}

	builder.putString('client_encoding');
	builder.putString("UTF8");
	builder.putString('DateStyle');
	builder.putString("ISO, MDY");

	builder.putInt8(0);

	return builder.finish();
}


module.exports = Packet$StartupMessage;
