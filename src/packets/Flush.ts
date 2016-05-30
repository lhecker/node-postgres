import Message from '../Message';

export default function Packet$Flush(this: Message) {
    this.beginPacket('H');
}
