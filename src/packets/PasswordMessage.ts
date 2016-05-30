import Message from '../Message';

export default function Packet$PasswordMessage(this: Message, password: string) {
    this.beginPacket('p');
    this.putCString(password);
}
