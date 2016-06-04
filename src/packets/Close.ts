import MessageWriter from '../MessageWriter';

export default function Packet$Close(this: MessageWriter, name: string, portalOnly: boolean) {
    this.beginPacket('C');

    // if `portalOnly` is false the prepared statement and all it's portals are deleted
    this.putChar(portalOnly ? 'P' : 'S');
    this.putCString(name);
}
