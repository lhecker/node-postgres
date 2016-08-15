/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

export default function* objectEntries<T>(o: { [s: string]: T }): IterableIterator<[string, T]> {
    if (typeof o === 'object') {
        for (let key in o) {
            yield [key, o[key]];
        }
    }
}
