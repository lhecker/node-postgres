import Message from '../Message';

export default function Packet$Describe(this: Message, name: string, isPortal: boolean) {
    this.beginPacket('D');

    this.putChar(isPortal ? 'P' : 'S');
    this.putCString(name);
}
