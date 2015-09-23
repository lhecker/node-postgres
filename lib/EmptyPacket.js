'use strict';

class EmptyPacket extends SlowBuffer {
	constructor(type) {
		console.log(typeof type === 'string' && type.length === 1);

		super(5);

		this.writeUInt8(type.charCodeAt(0), 0);
		this.writeInt32BE(4, 1);
	}
}


module.exports = EmptyPacket;
