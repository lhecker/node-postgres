import * as TypeWriters from '../TypeWriters';
import Message from '../Message';

export default function Packet$Bind(this: Message, name: string, values: any[], types: number[]) {
    this.beginPacket('B');

    this.putCString(name); // destination portal/coursor name
    this.putCString(name); // source prepared statement name

    // The number of parameter format codes => text only
    this.putInt16(0);

    // The number of parameter values
    this.putInt16(values.length);

    for (let i = 0; i < values.length; i++) {
        let value = values[i];

        if (typeof value === 'object') {
            value = JSON.stringify(value);
        } else {
            value = String(value);
        }

        this.putString(value);
    }

    // The number of result-column format codes
    this.putInt16(1);
    this.putInt16(1);
}
