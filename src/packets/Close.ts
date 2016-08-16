/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import MessageWriter from '../MessageWriter';

// Depending on the parameter `both` this will either close (i.e. delete)
// only the portal (if false) or portal and prepared statement (if true).
export default function Packet$Close(this: MessageWriter, name: string, both: boolean) {
    this.beginPacket('C');

    // Closing the 'S'tatement also closes the 'P'ortal
    this.putChar(both ? 'S' : 'P');
    this.putCString(name);
}
