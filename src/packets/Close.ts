import Message from '../Message';

export default function Packet$Close(this: Message, name: string, portalOnly: boolean) {
    this.beginPacket('C');

    this.putChar(portalOnly ? 'P' : 'S');
    this.putCString(name);
}
