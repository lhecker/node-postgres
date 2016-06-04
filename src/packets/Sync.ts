import MessageWriter from '../MessageWriter';

export default function Packet$Sync(this: MessageWriter) {
    this.beginPacket('S');
}
