import MessageWriter from '../MessageWriter';

export default function Packet$Query(this: MessageWriter, query: string) {
    this.beginPacket('Q');
    this.putCString(query);
}
