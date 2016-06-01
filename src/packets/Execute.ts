import Message from '../Message';

export default function Packet$Execute(this: Message, name: string) {
    this.beginPacket('E');

    this.putCString(name); // portal (cursor) name
    this.putInt32(0); // max. number of rows to return = infinite
}
