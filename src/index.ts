import * as Bluebird from 'bluebird';
import Connection from './Connection';
import { Options } from './ConnectionConfig';

export function connect(opts: string | Options, unbound: true): Bluebird<Connection>;
export function connect(opts: string | Options, unbound: false): Bluebird.Disposer<Connection>;
export function connect(opts: string | Options): Bluebird.Disposer<Connection>;
export function connect(opts: string | Options, unbound?: boolean): Bluebird.Disposer<Connection> {
    let conn: Connection;

    const p = new Bluebird<Connection>((resolve, reject) => {
        conn = new Connection(opts);

        function removeListeners() {
            conn.removeListener('connect', onConnected);
            conn.removeListener('error', onError);
        }

        function onError(err: any) {
            removeListeners();
            reject(err);
        }

        function onConnected() {
            removeListeners();
            resolve(conn);
        }

        conn.on('error', onError);
        conn.on('connect', onConnected);
    })

    if (unbound) {
        return p;
    } else {
        return p.disposer(() => {
            if (conn) {
                conn.end();
            }
        });
    }
}
