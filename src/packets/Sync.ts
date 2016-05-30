import Message from '../Message';

export default function Packet$Sync(this: Message) {
    this.beginPacket('S');
}
