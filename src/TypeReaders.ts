/*!
 * Copyright 2015 The node-postgres Developers.
 *
 * Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
 * http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
 * http://opensource.org/licenses/MIT>, at your option. This file may not be
 * copied, modified, or distributed except according to those terms.
 */

import MessageReader from './MessageReader';

function TypeReader$bool$text(reader: MessageReader) {
    // PostgreSQL uses 't' and 'f' ---> check for 't'
    return reader.getUInt8() === 0x74;
}

function TypeReader$bool$binary(reader: MessageReader): boolean {
    return reader.getUInt8() !== 0x00;
}

function TypeReader$bytea$text(reader: MessageReader): Buffer {
    // The text representation of bytea starts with \x ---> slice it out
    return Buffer.from(reader.advance(2).getString('ascii'), 'hex');
}

function TypeReader$bytea$binary(reader: MessageReader): Buffer {
    return reader.toBuffer();
}

function TypeReader$text$universal(reader: MessageReader): string {
    return reader.getString('utf8');
}

function TypeReader$number$text(reader: MessageReader): number {
    return Number(reader.getString('ascii')); // TODO: int8 support
}

function TypeReader$int2$binary(reader: MessageReader): number {
    return reader.getInt16();
}

function TypeReader$int4$binary(reader: MessageReader): number {
    return reader.getInt32();
}

function TypeReader$int8$binary(reader: MessageReader): number {
    // FYI: JS code is executed left to right => we read the higher part first
    return reader.getInt32() * 4294967296 + reader.getUInt32(); // TODO: int8 support
}

function TypeReader$float4$binary(reader: MessageReader): number {
    return reader.getFloat();
}

function TypeReader$float8$binary(reader: MessageReader): number {
    return reader.getDouble();
}

function TypeReader$timestamp$text(reader: MessageReader): Date {
    // postgres formats timestamp as '2015-09-24 19:03:07.626'
    return new Date(reader.getString('ascii'));
}

function TypeReader$timestamp$binary(reader: MessageReader): Date {
    /*
     * - Since JavaScript does not support 64 Bit integers we must use it's doubles.
     * - We must discard the µsecs since JavaScript's uses msecs.
     * - We do not use MessageReader's getInt64() method since we can improve the precision a
     *   thousandfold by applying the divisor on the 32 MSB directly instead of doing it later on.
     * - Finally shift from 2000-01-01 (PostgreSQL's date base value) to 1970-01-01 (JavaScript's base date value).
     */
    return new Date((reader.getInt32() * 4294967.296) + (reader.getUInt32() / 1000) + 946684800000);
}

function TypeReader$timestamptz$text(reader: MessageReader): Date {
    return new Date(reader.getString('ascii'));
}

function TypeReader$timestamptz$binary(reader: MessageReader): Date {
    // same as for timestamp
    return new Date((reader.getInt32() * 4294967.296) + (reader.getUInt32() / 1000) + 946684800000);
}

type TypeReader = (reader: MessageReader) => any;
type TypeReaderTuple = [TypeReader, TypeReader];

export const DEFAULT: TypeReaderTuple = [TypeReader$text$universal, TypeReader$text$universal];
export const types: TypeReaderTuple[] = [];

types[16]   /* bool           */ = [TypeReader$bool$text, TypeReader$bool$binary];
types[17]   /* bytea          */ = [TypeReader$bytea$text, TypeReader$bytea$binary];
types[18]   /* char           */ = [TypeReader$text$universal, TypeReader$text$universal];
types[19]   /* name           */ = DEFAULT;
types[20]   /* int8           */ = [TypeReader$number$text, TypeReader$int8$binary];
types[21]   /* int2           */ = [TypeReader$number$text, TypeReader$int2$binary];
types[22]   /* int2vector     */ = DEFAULT;
types[23]   /* int4           */ = [TypeReader$number$text, TypeReader$int4$binary];
types[24]   /* regproc        */ = DEFAULT;
types[25]   /* text           */ = [TypeReader$text$universal, TypeReader$text$universal];
types[26]   /* oid            */ = [TypeReader$number$text, TypeReader$int4$binary];
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
types[700]  /* float4         */ = [TypeReader$number$text, TypeReader$float4$binary];
types[701]  /* float8         */ = [TypeReader$number$text, TypeReader$float8$binary];
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
types[1042] /* bpchar         */ = [TypeReader$text$universal, TypeReader$text$universal];
types[1043] /* varchar        */ = [TypeReader$text$universal, TypeReader$text$universal];
types[1082] /* date           */ = [TypeReader$timestamp$text, TypeReader$timestamp$binary];
types[1083] /* time           */ = [TypeReader$timestamp$text, TypeReader$timestamp$binary];
types[1114] /* timestamp      */ = [TypeReader$timestamp$text, TypeReader$timestamp$binary];
types[1115] /* _timestamp     */ = DEFAULT;
types[1182] /* _date          */ = DEFAULT;
types[1183] /* _time          */ = DEFAULT;
types[1184] /* timestamptz    */ = [TypeReader$timestamptz$text, TypeReader$timestamptz$binary];
types[1185] /* _timestamptz   */ = DEFAULT;
types[1186] /* interval       */ = DEFAULT;
types[1187] /* _interval      */ = DEFAULT;
types[1231] /* _numeric       */ = DEFAULT;
types[1263] /* _cstring       */ = DEFAULT;
types[1266] /* timetz         */ = [TypeReader$timestamptz$text, TypeReader$timestamptz$binary];
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
