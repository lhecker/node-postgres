import MessageWriter from '../MessageWriter';

export default function Packet$Describe(this: MessageWriter, name: string, isPortal: boolean) {
    this.beginPacket('D');

    this.putChar(isPortal ? 'P' : 'S');
    this.putCString(name);
}
