/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import ConnectionConfig from '../ConnectionConfig';
import MessageWriter from '../MessageWriter';
import objectEntries from '../Object.entries';

export default function Packet$StartupMessage(this: MessageWriter, config: ConnectionConfig) {
    this.beginPacket();

    this.putInt32(196608);

    this.putCString('user');
    this.putCString(config.username);

    if (config.database) {
        this.putCString('database');
        this.putCString(config.database);
    }

    for (let [key, val] of objectEntries(config.options)) {
        this.putCString(key);
        this.putCString(val);
    }

    this.putInt8(0);
}
