import MessageWriter from '../MessageWriter';

export default function Packet$Flush(this: MessageWriter) {
    this.beginPacket('H');
}
