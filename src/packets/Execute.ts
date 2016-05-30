import Message from '../Message';

export default function Packet$Execute(this: Message, name: string) {
    this.beginPacket('E');

    this.putCString(name);
    this.putInt32(0);
}
