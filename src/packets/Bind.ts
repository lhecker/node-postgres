/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import * as TypeWriters from '../TypeWriters';
import MessageWriter from '../MessageWriter';
import { ExtendedQueryOptions } from '../QueryTypes';

export default function Packet$Bind(this: MessageWriter, opts: ExtendedQueryOptions) {
    this.beginPacket('B');

    this.putCString(opts.name); // destination portal (cursor) name
    this.putCString(opts.name); // source prepared statement name

    this.putInt16(1); // number of parameter format codes
    this.putInt16(1); // only binary right now

    this.putInt16(opts.values.length); // number of parameter values

    for (let i = 0; i < opts.values.length; i++) {
        TypeWriters.types[opts.types[i]][1](this, opts.values[i]);
    }

    this.putInt16(1); // number of result format codes
    this.putInt16(1); // only binary right now
}
