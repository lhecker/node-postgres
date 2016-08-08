/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import MessageWriter from '../MessageWriter';

// Depending on the parameter `isPortal` this will either results in a  ParameterDescription
// of the prepared statement (if false) or in a RowDescription of the portal (if true).
export default function Packet$Describe(this: MessageWriter, name: string, isPortal: boolean) {
    this.beginPacket('D');

    this.putChar(isPortal ? 'P' : 'S');
    this.putCString(name);
}
