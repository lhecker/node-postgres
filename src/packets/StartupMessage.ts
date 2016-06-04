import ConnectionConfig from '../ConnectionConfig';
import MessageWriter from '../MessageWriter';

export default function Packet$StartupMessage(this: MessageWriter, config: ConnectionConfig) {
    this.beginPacket();

    this.putInt32(196608);

    if (config.user) {
        this.putCString('user');
        this.putCString(config.user);
    }

    if (config.database) {
        this.putCString('database');
        this.putCString(config.database);
    }

    this.putCString('client_encoding');
    this.putCString('UTF8');

    this.putCString('DateStyle');
    this.putCString('ISO, MDY');

    this.putInt8(0);
}
