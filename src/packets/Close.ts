import Message from '../Message';

export default function Packet$Close(this: Message, name: string, portalOnly: boolean) {
    this.beginPacket('C');

    // if `portalOnly` is false the prepared statement and all it's portals are deleted
    this.putChar(portalOnly ? 'P' : 'S');
    this.putCString(name);
}
