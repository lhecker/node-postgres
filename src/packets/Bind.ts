import * as TypeWriters from '../TypeWriters';
import MessageWriter from '../MessageWriter';
import {ExtendedQueryOptions} from '../QueryTypes';

export default function Packet$Bind(this: MessageWriter, opts: ExtendedQueryOptions) {
    this.beginPacket('B');

    this.putCString(opts.name); // destination portal (cursor) name
    this.putCString(opts.name); // source prepared statement name

    this.putInt16(1); // number of parameter format codes
    this.putInt16(0); // only text right now


    this.putInt16(opts.values.length); // number of parameter values

    for (let value of opts.values) {
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
