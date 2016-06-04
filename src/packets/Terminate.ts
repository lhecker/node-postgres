import MessageWriter from '../MessageWriter';

export default function Packet$Terminate(this: MessageWriter) {
    this.beginPacket('X');
}
