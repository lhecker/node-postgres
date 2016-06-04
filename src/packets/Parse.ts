import MessageWriter from '../MessageWriter';

export default function Packet$Parse(this: MessageWriter, name: string, query: string, values: any[], types: number[]) {
    this.beginPacket('P');

    this.putCString(name); // prepared statement name
    this.putCString(query); // query string
    this.putInt16(types.length); // number of parameter data types
    types.forEach(this.putInt32, this); // parameter type IDs
}
