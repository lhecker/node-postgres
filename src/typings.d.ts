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
