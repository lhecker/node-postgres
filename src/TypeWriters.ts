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

export const DEFAULT: TypeWriterTuple = [TypeWriter$default$universal, TypeWriter$default$universal];
export const types: TypeWriterTuple[] = [];

types[16]   /* bool           */ = [TypeWriter$bool$text, TypeWriter$bool$binary];
types[17]   /* bytea          */ = [TypeWriter$bytea$text, TypeWriter$bytea$binary];
types[18]   /* char           */ = DEFAULT;
types[19]   /* name           */ = DEFAULT;
types[20]   /* int8           */ = [TypeWriter$number$text, TypeWriter$int8$binary];
types[21]   /* int2           */ = [TypeWriter$number$text, TypeWriter$int2$binary];
types[22]   /* int2vector     */ = DEFAULT;
types[23]   /* int4           */ = [TypeWriter$number$text, TypeWriter$int4$binary];
types[24]   /* regproc        */ = DEFAULT;
types[25]   /* text           */ = [TypeWriter$text$universal, TypeWriter$text$universal];
types[26]   /* oid            */ = DEFAULT;
types[27]   /* tid            */ = DEFAULT;
types[28]   /* xid            */ = DEFAULT;
types[29]   /* cid            */ = DEFAULT;
types[30]   /* oidvector      */ = DEFAULT;
types[114]  /* json           */ = DEFAULT;
types[142]  /* xml            */ = DEFAULT;
types[143]  /* _xml           */ = DEFAULT;
types[199]  /* _json          */ = DEFAULT;
types[600]  /* point          */ = DEFAULT;
types[601]  /* lseg           */ = DEFAULT;
types[602]  /* path           */ = DEFAULT;
types[603]  /* box            */ = DEFAULT;
types[604]  /* polygon        */ = DEFAULT;
types[628]  /* line           */ = DEFAULT;
types[629]  /* _line          */ = DEFAULT;
types[650]  /* cidr           */ = DEFAULT;
types[651]  /* _cidr          */ = DEFAULT;
types[700]  /* float4         */ = [TypeWriter$number$text, TypeWriter$float4$binary];
types[701]  /* float8         */ = [TypeWriter$number$text, TypeWriter$float8$binary];
types[702]  /* abstime        */ = DEFAULT;
types[703]  /* reltime        */ = DEFAULT;
types[704]  /* tinterval      */ = DEFAULT;
types[705]  /* unknown        */ = DEFAULT;
types[718]  /* circle         */ = DEFAULT;
types[719]  /* _circle        */ = DEFAULT;
types[790]  /* money          */ = DEFAULT;
types[791]  /* _money         */ = DEFAULT;
types[829]  /* macaddr        */ = DEFAULT;
types[869]  /* inet           */ = DEFAULT;
types[1000] /* _bool          */ = DEFAULT;
types[1001] /* _bytea         */ = DEFAULT;
types[1002] /* _char          */ = DEFAULT;
types[1003] /* _name          */ = DEFAULT;
types[1005] /* _int2          */ = DEFAULT;
types[1006] /* _int2vector    */ = DEFAULT;
types[1007] /* _int4          */ = DEFAULT;
types[1008] /* _regproc       */ = DEFAULT;
types[1009] /* _text          */ = DEFAULT;
types[1010] /* _tid           */ = DEFAULT;
types[1011] /* _xid           */ = DEFAULT;
types[1012] /* _cid           */ = DEFAULT;
types[1013] /* _oidvector     */ = DEFAULT;
types[1014] /* _bpchar        */ = DEFAULT;
types[1015] /* _varchar       */ = DEFAULT;
types[1016] /* _int8          */ = DEFAULT;
types[1017] /* _point         */ = DEFAULT;
types[1018] /* _lseg          */ = DEFAULT;
types[1019] /* _path          */ = DEFAULT;
types[1020] /* _box           */ = DEFAULT;
types[1021] /* _float4        */ = DEFAULT;
types[1022] /* _float8        */ = DEFAULT;
types[1023] /* _abstime       */ = DEFAULT;
types[1024] /* _reltime       */ = DEFAULT;
types[1025] /* _tinterval     */ = DEFAULT;
types[1027] /* _polygon       */ = DEFAULT;
types[1028] /* _oid           */ = DEFAULT;
types[1034] /* _aclitem       */ = DEFAULT;
types[1040] /* _macaddr       */ = DEFAULT;
types[1041] /* _inet          */ = DEFAULT;
types[1042] /* bpchar         */ = DEFAULT;
types[1043] /* varchar        */ = DEFAULT;
types[1082] /* date           */ = DEFAULT;
types[1083] /* time           */ = DEFAULT;
types[1114] /* timestamp      */ = [TypeWriter$timestamp$text, TypeWriter$timestamp$binary];
types[1115] /* _timestamp     */ = DEFAULT;
types[1182] /* _date          */ = DEFAULT;
types[1183] /* _time          */ = DEFAULT;
types[1184] /* timestamptz    */ = [TypeWriter$timestamptz$text, TypeWriter$timestamptz$binary];
types[1185] /* _timestamptz   */ = DEFAULT;
types[1186] /* interval       */ = DEFAULT;
types[1187] /* _interval      */ = DEFAULT;
types[1231] /* _numeric       */ = DEFAULT;
types[1263] /* _cstring       */ = DEFAULT;
types[1266] /* timetz         */ = DEFAULT;
types[1270] /* _timetz        */ = DEFAULT;
types[1560] /* bit            */ = DEFAULT;
types[1561] /* _bit           */ = DEFAULT;
types[1562] /* varbit         */ = DEFAULT;
types[1563] /* _varbit        */ = DEFAULT;
types[1700] /* numeric        */ = DEFAULT;
types[1790] /* refcursor      */ = DEFAULT;
types[2201] /* _refcursor     */ = DEFAULT;
types[2202] /* regprocedure   */ = DEFAULT;
types[2203] /* regoper        */ = DEFAULT;
types[2204] /* regoperator    */ = DEFAULT;
types[2205] /* regclass       */ = DEFAULT;
types[2206] /* regtype        */ = DEFAULT;
types[2207] /* _regprocedure  */ = DEFAULT;
types[2208] /* _regoper       */ = DEFAULT;
types[2209] /* _regoperator   */ = DEFAULT;
types[2210] /* _regclass      */ = DEFAULT;
types[2211] /* _regtype       */ = DEFAULT;
types[2949] /* _txid_snapshot */ = DEFAULT;
types[2950] /* uuid           */ = DEFAULT;
types[2951] /* _uuid          */ = DEFAULT;
types[2970] /* txid_snapshot  */ = DEFAULT;
types[3220] /* pg_lsn         */ = DEFAULT;
types[3221] /* _pg_lsn        */ = DEFAULT;
types[3614] /* tsvector       */ = DEFAULT;
types[3615] /* tsquery        */ = DEFAULT;
types[3643] /* _tsvector      */ = DEFAULT;
types[3644] /* _gtsvector     */ = DEFAULT;
types[3645] /* _tsquery       */ = DEFAULT;
types[3734] /* regconfig      */ = DEFAULT;
types[3735] /* _regconfig     */ = DEFAULT;
types[3769] /* regdictionary  */ = DEFAULT;
types[3770] /* _regdictionary */ = DEFAULT;
types[3802] /* jsonb          */ = DEFAULT;
types[3807] /* _jsonb         */ = DEFAULT;
types[3904] /* int4range      */ = DEFAULT;
types[3905] /* _int4range     */ = DEFAULT;
types[3906] /* numrange       */ = DEFAULT;
types[3907] /* _numrange      */ = DEFAULT;
types[3908] /* tsrange        */ = DEFAULT;
types[3909] /* _tsrange       */ = DEFAULT;
types[3910] /* tstzrange      */ = DEFAULT;
types[3911] /* _tstzrange     */ = DEFAULT;
types[3912] /* daterange      */ = DEFAULT;
types[3913] /* _daterange     */ = DEFAULT;
types[3926] /* int8range      */ = DEFAULT;
types[3927] /* _int8range     */ = DEFAULT;

function typeOfObject(val: Object): number {
    let ret = 114 /* json */;

    if (val === null) {
        ret = -1;
    } else if (val instanceof Buffer) {
        ret = 17 /* bytea */;
    } else if (val instanceof Date) {
        ret = 1184 /* timestamptz */;
    }

    return ret;
}

export function typeOf(val: any): number {
    const type = typeof val;

    switch (type) {
        case 'boolean':
            return 16 /* bool */;
        case 'number':
            return ~~val === val ? 23 /* int4 */ : 701 /* float8 */;
        case 'object':
            return typeOfObject(val);
        case 'string':
            return 25 /* text */;
        case 'undefined':
            return -1;
        default:
            throw new TypeError(`type "${type}" unsupported`);
    }
}
