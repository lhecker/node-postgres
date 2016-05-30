import Message from '../Message';

export default function Packet$Parse(this: Message, name: string, query: string, values: any[], types: number[]) {
    this.beginPacket('P');

    this.putCString(name);
    this.putCString(query);
    this.putInt16(types.length);
    types.forEach(this.putInt32, this);
}
