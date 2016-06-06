import MessageWriter from '../MessageWriter';
import {ExtendedQueryOptions} from '../QueryTypes';

export default function Packet$Parse(this: MessageWriter, opts: ExtendedQueryOptions) {
    this.beginPacket('P');

    this.putCString(opts.name); // prepared statement name
    this.putCString(opts.text); // query string
    this.putInt16(opts.types.length); // number of parameter data types
    opts.types.forEach(this.putInt32, this); // parameter type IDs
}
