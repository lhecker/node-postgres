'use strict';


function checkInt(val, lo, hi) {
	if (typeof val !== 'number' || val < lo || val > hi) {
		throw new TypeError('value is out of bounds');
	}
}


class MessageWriter {
	static createHeaderOnlyBuffer(type) {
		return new Buffer([type.charCodeAt(0), 0x00, 0x00, 0x00, 0x04]);
	}

	constructor() {
		this._clear();
	}

	_clear() {
		this._size         = 0;
		this._packets      = [];

		this._packetOffset = 0;
		this._packetType   = null;
		this._packetParts  = [];
	}

	_endPacket() {
		if (this._size > 0) {
			this._packets.push({
				offset: this._packetOffset,
				size  : this._size - this._packetOffset,
				type  : this._packetType,
				parts : this._packetParts,
			});
		}
	}

	beginPacket(type) {
		this._endPacket();

		this._packetType   = type;
		this._packetOffset = this._size;
		this._packetParts  = [];

		this._size += type ? 5 : 4;
	}

	finish() {
		this._endPacket();

		const buffer = new Buffer(this._size);

		for (let x = 0; x < this._packets.length; x++) {
			const packet = this._packets[x];
			const typeOffset = packet.type ? 1 : 0;

			if (typeOffset) {
				buffer.writeUInt8(packet.type.charCodeAt(0), packet.offset, true);
			}

			buffer.writeInt32BE(packet.size - typeOffset, packet.offset + typeOffset, true);

			for (let y = 0; y < packet.parts.length; y++) {
				packet.parts[y](buffer);
			}
		}

		this._clear();

		return buffer;
	}

	putBytes(data) {
		const offset = this._size;
		let length;
		let cb;

		if (Buffer.isBuffer(data)) {
			length = data.length;
			cb = (buffer) => {
				data.copy(buffer, offset);
			};
		} else {
			data = String(data);
			length = Buffer.byteLength(data);
			cb = (buffer) => {
				buffer.write(data, offset, length, 'utf8');
			};
		}

		this._packetParts.push(cb);
		this._size += length;
	}

	putChar(ch) {
		this.putUInt8(ch.charCodeAt(0));
	}

	putUInt8(data) {
		checkInt(data, 0x00, 0xff);

		const offset = this._size;
		this._packetParts.push((buffer) => {
			buffer.writeUInt8(data, offset, true);
		});
		this._size += 1;
	}

	putInt8(data) {
		checkInt(data, -0x80, 0x7f);

		const offset = this._size;
		this._packetParts.push((buffer) => {
			buffer.writeInt8(data, offset, true);
		});
		this._size += 1;
	}

	putInt16(data) {
		checkInt(data, -0x8000, 0x7fff);

		const offset = this._size;
		this._packetParts.push((buffer) => {
			buffer.writeInt16BE(data, offset, true);
		});
		this._size += 2;
	}

	putInt32(data) {
		checkInt(data, -0x80000000, 0x7fffffff);

		const offset = this._size;
		this._packetParts.push((buffer) => {
			buffer.writeInt32BE(data, offset, true);
		});
		this._size += 4;
	}

	putCString(data) {
		data = String(data);

		const offset = this._size;
		const length = Buffer.byteLength(data);

		this._packetParts.push((buffer) => {
			buffer.write(data, offset, length, 'utf8');
			buffer.writeInt8(0, offset + length, true);
		});
		this._size += length + 1;
	}
}


module.exports = MessageWriter;
