import * as TypeWriters from '../TypeWriters';
import Message from '../Message';

export default function Packet$Bind(this: Message, name: string, values: any[], types: number[]) {
    this.beginPacket('B');

    this.putCString(name); // destination portal (cursor) name
    this.putCString(name); // source prepared statement name

    this.putInt16(1); // number of parameter format codes
    this.putInt16(0); // only text right now


    this.putInt16(values.length); // number of parameter values

    for (let value of values) {
        // TODO
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        } else {
            value = String(value);
        }

        this.putBytes(value, true);
    }


    this.putInt16(1); // number of result format codes
    this.putInt16(1); // only text right now
}
