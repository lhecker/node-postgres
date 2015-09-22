'use strict';

const PacketBuilder = require('../PacketBuilder');


function StartupMessagePacket(conn) {
	const builder = new PacketBuilder();

	builder.putInt32(196608);
	builder.putString('user');
	builder.putString(conn.options.username);

	if (conn.options.database) {
		builder.putString('database');
		builder.putString(conn.options.database);
	}

	builder.putInt8(0);

	return builder.finish();
}


module.exports = StartupMessagePacket;
