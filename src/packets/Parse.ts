/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import MessageWriter from '../MessageWriter';
import { ExtendedQueryOptions } from '../QueryTypes';

export default function Packet$Parse(this: MessageWriter, opts: ExtendedQueryOptions) {
    this.beginPacket('P');

    this.putCString(opts.name); // prepared statement name
    this.putCString(opts.text); // query string
    this.putInt16(opts.types.length); // number of parameter data types
    opts.types.forEach(this.putInt32, this); // parameter type IDs
}
