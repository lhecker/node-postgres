'use strict';

const TypeWriters = require('../TypeWriters');


function Packet$Bind(name, values, types) {
	this.beginPacket('B');

	this.putCString(name); // destination portal/coursor name
	this.putCString(name); // source prepared statement name

	// The number of parameter format codes => text only
	this.putInt16(0);

	// The number of parameter values
	this.putInt16(values.length);

	for (let i = 0; i < values.length; i++) {
		const buf = new Buffer(String(values), 'utf8');
		this.putInt32(buf.length);
		this.putBytes(buf);
	}

	// The number of result-column format codes
	this.putInt16(1);
	this.putInt16(1);
}


module.exports = Packet$Bind;
