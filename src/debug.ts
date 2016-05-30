export interface Debugger {
    (message: any, ...args: any[]): void;
    enabled: boolean;
    namespace: string;
}

export default require('debug')('postgres') as Debugger;
