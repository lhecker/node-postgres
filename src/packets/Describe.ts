import MessageWriter from '../MessageWriter';

// Depending on the parameter `isPortal` this will either results in a  ParameterDescription
// of the prepared statement (if false) or in a RowDescription of the portal (if true).
export default function Packet$Describe(this: MessageWriter, name: string, isPortal: boolean) {
    this.beginPacket('D');

    this.putChar(isPortal ? 'P' : 'S');
    this.putCString(name);
}
