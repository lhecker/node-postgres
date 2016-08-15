/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

// This file includes type writers for the text format.
// They aren't actually needed but are still included
// to have support for the entire protocol.

import MessageWriter from './MessageWriter';

function TypeWriter$default$universal(writer: MessageWriter, value: any) {
    writer.putBytes(value instanceof Buffer ? value : String(value));
}

function TypeWriter$universal$text(writer: MessageWriter, value: any) {
    writer.putBytes(String(value));
}

function TypeWriter$bool$text(writer: MessageWriter, value: boolean) {
    // PostgreSQL uses 't' and 'f'
    writer.putUInt8(value ? 0x74 : 0x66);
}

function TypeWriter$bool$binary(writer: MessageWriter, value: boolean) {
    writer.putUInt8(value ? 0 : 1);
}

function TypeWriter$bytea$text(writer: MessageWriter, value: Buffer) {
    writer.putBytes('\\x' + value.toString('hex'));
}

function TypeWriter$bytea$binary(writer: MessageWriter, value: Buffer) {
    writer.putBytes(value);
}

function TypeWriter$text$universal(writer: MessageWriter, value: string) {
    writer.putBytes(value);
}

function TypeWriter$number$text(writer: MessageWriter, value: number) {
    writer.putBytes(String(value)); // TODO: int8 support
}

function TypeWriter$int2$binary(writer: MessageWriter, value: number) {
    writer.putInt16(value);
}

function TypeWriter$int4$binary(writer: MessageWriter, value: number) {
    writer.putInt32(value);
}

function TypeWriter$int8$binary(writer: MessageWriter, value: number) {
    // TODO: int8 support
    writer.putInt32(value / 4294967296);
    writer.putUInt32(value % 4294967296);
}

function TypeWriter$float4$binary(writer: MessageWriter, value: number) {
    writer.putFloat(value);
}

function TypeWriter$float8$binary(writer: MessageWriter, value: number) {
    writer.putDouble(value);
}

function TypeWriter$timestamp$text(writer: MessageWriter, value: Date) {
    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    writer.putBytes(localDate.toISOString().slice(0, -5));
}

function TypeWriter$timestamp$binary(writer: MessageWriter, value: Date) {
    const time = (value.getTime() - value.getTimezoneOffset() * 60000 - 946684800000) * 1000;
    TypeWriter$int8$binary(writer, time);
}

function TypeWriter$timestamptz$text(writer: MessageWriter, value: Date) {
    writer.putBytes(value.toISOString());
}

function TypeWriter$timestamptz$binary(writer: MessageWriter, value: Date) {
    const time = (value.getTime() - 946684800000) * 1000;
    TypeWriter$int8$binary(writer, time);
}

type TypeWriter = (writer: MessageWriter, value: any) => void;
type TypeWriterTuple = [TypeWriter, TypeWriter];

export const DEFAULT: TypeWriterTuple = [TypeWriter$text$universal, TypeWriter$bytea$binary];
export const types: TypeWriterTuple[] = [];

const ND: TypeWriterTuple = undefined as any as TypeWriterTuple;

types[  16] /* bool           */ = [TypeWriter$bool$text,        TypeWriter$bool$binary       ];
types[  17] /* bytea          */ = [TypeWriter$bytea$text,       TypeWriter$bytea$binary      ];
types[  18] /* char           */ = ND;
types[  19] /* name           */ = ND;
types[  20] /* int8           */ = [TypeWriter$number$text,      TypeWriter$int8$binary       ];
types[  21] /* int2           */ = [TypeWriter$number$text,      TypeWriter$int2$binary       ];
types[  22] /* int2vector     */ = ND;
types[  23] /* int4           */ = [TypeWriter$number$text,      TypeWriter$int4$binary       ];
types[  24] /* regproc        */ = ND;
types[  25] /* text           */ = [TypeWriter$text$universal,   TypeWriter$text$universal    ];
types[  26] /* oid            */ = ND;
types[  27] /* tid            */ = ND;
types[  28] /* xid            */ = ND;
types[  29] /* cid            */ = ND;
types[  30] /* oidvector      */ = ND;
types[ 114] /* json           */ = ND;
types[ 142] /* xml            */ = ND;
types[ 143] /* _xml           */ = ND;
types[ 199] /* _json          */ = ND;
types[ 600] /* point          */ = ND;
types[ 601] /* lseg           */ = ND;
types[ 602] /* path           */ = ND;
types[ 603] /* box            */ = ND;
types[ 604] /* polygon        */ = ND;
types[ 628] /* line           */ = ND;
types[ 629] /* _line          */ = ND;
types[ 650] /* cidr           */ = ND;
types[ 651] /* _cidr          */ = ND;
types[ 700] /* float4         */ = [TypeWriter$number$text,      TypeWriter$float4$binary     ];
types[ 701] /* float8         */ = [TypeWriter$number$text,      TypeWriter$float8$binary     ];
types[ 702] /* abstime        */ = ND;
types[ 703] /* reltime        */ = ND;
types[ 704] /* tinterval      */ = ND;
types[ 705] /* unknown        */ = ND;
types[ 718] /* circle         */ = ND;
types[ 719] /* _circle        */ = ND;
types[ 790] /* money          */ = ND;
types[ 791] /* _money         */ = ND;
types[ 829] /* macaddr        */ = ND;
types[ 869] /* inet           */ = ND;
types[1000] /* _bool          */ = ND;
types[1001] /* _bytea         */ = ND;
types[1002] /* _char          */ = ND;
types[1003] /* _name          */ = ND;
types[1005] /* _int2          */ = ND;
types[1006] /* _int2vector    */ = ND;
types[1007] /* _int4          */ = ND;
types[1008] /* _regproc       */ = ND;
types[1009] /* _text          */ = ND;
types[1010] /* _tid           */ = ND;
types[1011] /* _xid           */ = ND;
types[1012] /* _cid           */ = ND;
types[1013] /* _oidvector     */ = ND;
types[1014] /* _bpchar        */ = ND;
types[1015] /* _varchar       */ = ND;
types[1016] /* _int8          */ = ND;
types[1017] /* _point         */ = ND;
types[1018] /* _lseg          */ = ND;
types[1019] /* _path          */ = ND;
types[1020] /* _box           */ = ND;
types[1021] /* _float4        */ = ND;
types[1022] /* _float8        */ = ND;
types[1023] /* _abstime       */ = ND;
types[1024] /* _reltime       */ = ND;
types[1025] /* _tinterval     */ = ND;
types[1027] /* _polygon       */ = ND;
types[1028] /* _oid           */ = ND;
types[1034] /* _aclitem       */ = ND;
types[1040] /* _macaddr       */ = ND;
types[1041] /* _inet          */ = ND;
types[1042] /* bpchar         */ = ND;
types[1043] /* varchar        */ = ND;
types[1082] /* date           */ = ND;
types[1083] /* time           */ = ND;
types[1114] /* timestamp      */ = [TypeWriter$timestamp$text,   TypeWriter$timestamp$binary  ];
types[1115] /* _timestamp     */ = ND;
types[1182] /* _date          */ = ND;
types[1183] /* _time          */ = ND;
types[1184] /* timestamptz    */ = [TypeWriter$timestamptz$text, TypeWriter$timestamptz$binary];
types[1185] /* _timestamptz   */ = ND;
types[1186] /* interval       */ = ND;
types[1187] /* _interval      */ = ND;
types[1231] /* _numeric       */ = ND;
types[1263] /* _cstring       */ = ND;
types[1266] /* timetz         */ = ND;
types[1270] /* _timetz        */ = ND;
types[1560] /* bit            */ = ND;
types[1561] /* _bit           */ = ND;
types[1562] /* varbit         */ = ND;
types[1563] /* _varbit        */ = ND;
types[1700] /* numeric        */ = ND;
types[1790] /* refcursor      */ = ND;
types[2201] /* _refcursor     */ = ND;
types[2202] /* regprocedure   */ = ND;
types[2203] /* regoper        */ = ND;
types[2204] /* regoperator    */ = ND;
types[2205] /* regclass       */ = ND;
types[2206] /* regtype        */ = ND;
types[2207] /* _regprocedure  */ = ND;
types[2208] /* _regoper       */ = ND;
types[2209] /* _regoperator   */ = ND;
types[2210] /* _regclass      */ = ND;
types[2211] /* _regtype       */ = ND;
types[2949] /* _txid_snapshot */ = ND;
types[2950] /* uuid           */ = ND;
types[2951] /* _uuid          */ = ND;
types[2970] /* txid_snapshot  */ = ND;
types[3220] /* pg_lsn         */ = ND;
types[3221] /* _pg_lsn        */ = ND;
types[3614] /* tsvector       */ = ND;
types[3615] /* tsquery        */ = ND;
types[3643] /* _tsvector      */ = ND;
types[3644] /* _gtsvector     */ = ND;
types[3645] /* _tsquery       */ = ND;
types[3734] /* regconfig      */ = ND;
types[3735] /* _regconfig     */ = ND;
types[3769] /* regdictionary  */ = ND;
types[3770] /* _regdictionary */ = ND;
types[3802] /* jsonb          */ = ND;
types[3807] /* _jsonb         */ = ND;
types[3904] /* int4range      */ = ND;
types[3905] /* _int4range     */ = ND;
types[3906] /* numrange       */ = ND;
types[3907] /* _numrange      */ = ND;
types[3908] /* tsrange        */ = ND;
types[3909] /* _tsrange       */ = ND;
types[3910] /* tstzrange      */ = ND;
types[3911] /* _tstzrange     */ = ND;
types[3912] /* daterange      */ = ND;
types[3913] /* _daterange     */ = ND;
types[3926] /* int8range      */ = ND;
types[3927] /* _int8range     */ = ND;

function typeOfObject(val: Object): number {
    let ret = 114; // json

    if (val === null) {
        ret = 0; // undefined
    } else if (val instanceof Buffer) {
        ret = 17; // bytea
    } else if (val instanceof Date) {
        ret = 1184; // timestamptz
    }

    return ret;
}

export function typeOf(val: any): number {
    const type = typeof val;

    switch (type) {
        case 'boolean':
            return 16; // bool
        case 'number':
            return Number.isInteger(val) ? 23 /* int4 */ : Number.isSafeInteger(val) ? 20 /* int8 */ : 701 /* float8 */;
        case 'object':
            return typeOfObject(val);
        case 'string':
            return 25; // text
        case 'undefined':
            return 0; // undefined
        default:
            throw new TypeError(`type "${type}" unsupported`);
    }
}
