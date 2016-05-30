import Message from '../Message';

export default function Packet$Terminate(this: Message) {
    this.beginPacket('X');
}
