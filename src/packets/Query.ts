import Message from '../Message';

export default function Packet$Query(this: Message, query: string) {
    this.beginPacket('Q');
    this.putCString(query);
}
