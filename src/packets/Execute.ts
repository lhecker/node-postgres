/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import MessageWriter from '../MessageWriter';

export default function Packet$Execute(this: MessageWriter, name: string) {
    this.beginPacket('E');

    this.putCString(name); // portal (cursor) name
    this.putInt32(0); // max. number of rows to return = infinite
}
