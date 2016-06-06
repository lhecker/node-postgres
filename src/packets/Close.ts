import MessageWriter from '../MessageWriter';

// Depending on the parameter `both` this will either close (i.e. delete)
// only the portal (if false) or portal and prepared statement (if true).
export default function Packet$Close(this: MessageWriter, name: string, both: boolean) {
    this.beginPacket('C');

    // if `portalOnly` is false the prepared statement and all it's portals are deleted
    this.putChar(both ? 'S' : 'P');
    this.putCString(name);
}
