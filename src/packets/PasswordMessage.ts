import MessageWriter from '../MessageWriter';

export default function Packet$PasswordMessage(this: MessageWriter, password: string) {
    this.beginPacket('p');
    this.putCString(password);
}
