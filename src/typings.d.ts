/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

declare module 'double-ended-queue' {
    class Deque<T> {
        constructor();
        constructor(items: T[]);
        constructor(capacity: number);

        length: number;

        push(...items: T[]): void;
        unshift(...items: T[]): void;
        pop(): T | undefined;
        shift(): T | undefined;
        toArray(): T[];
        peekBack(): T | undefined;
        peekFront(): T | undefined;
        get(index: number): T | undefined;
        isEmpty(): boolean;
        clear(): void;
    }

    namespace Deque { }
    export = Deque;
}
