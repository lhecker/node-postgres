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
    return new Date(reader.getString('ascii'));
}

function TypeReader$timestamp$binary(reader: MessageReader): Date {
    const date = TypeReader$timestamptz$binary(reader);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60000);
    return date;
}

function TypeReader$timestamptz$text(reader: MessageReader): Date {
    // postgres formats timestamp as '2015-01-01 15:16:17.567891+02'
    return new Date(reader.getString('ascii'));
}

function TypeReader$timestamptz$binary(reader: MessageReader): Date {
    // - Since JavaScript does not support 64 Bit integers we must use it's doubles.
    // - We must discard the µsecs since JavaScript's uses msecs.
    // - We do not use MessageReader's getInt64() method since we can improve the precision a
    //   thousandfold by applying the divisor on the 32 MSB directly instead of doing it later on.
    // - Finally shift from 2000-01-01 (PostgreSQL's date base value) to 1970-01-01 (JavaScript's base date value).
    return new Date((reader.getInt32() * 4294967.296) + (reader.getUInt32() / 1000) + 946684800000);
}

type TypeReader = (reader: MessageReader) => any;
type TypeReaderTuple = [TypeReader, TypeReader];

export const DEFAULT: TypeReaderTuple = [TypeReader$text$universal, TypeReader$bytea$binary];
export const types: TypeReaderTuple[] = [];

const ND: TypeReaderTuple = DEFAULT;

types[  16] /* bool           */ = [TypeReader$bool$text,        TypeReader$bool$binary       ];
types[  17] /* bytea          */ = [TypeReader$bytea$text,       TypeReader$bytea$binary      ];
types[  18] /* char           */ = [TypeReader$text$universal,   TypeReader$text$universal    ];
types[  19] /* name           */ = ND;
types[  20] /* int8           */ = [TypeReader$number$text,      TypeReader$int8$binary       ];
types[  21] /* int2           */ = [TypeReader$number$text,      TypeReader$int2$binary       ];
types[  22] /* int2vector     */ = ND;
types[  23] /* int4           */ = [TypeReader$number$text,      TypeReader$int4$binary       ];
types[  24] /* regproc        */ = ND;
types[  25] /* text           */ = [TypeReader$text$universal,   TypeReader$text$universal    ];
types[  26] /* oid            */ = [TypeReader$number$text,      TypeReader$int4$binary       ];
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
types[ 700] /* float4         */ = [TypeReader$number$text,      TypeReader$float4$binary     ];
types[ 701] /* float8         */ = [TypeReader$number$text,      TypeReader$float8$binary     ];
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
types[1042] /* bpchar         */ = [TypeReader$text$universal,   TypeReader$text$universal    ];
types[1043] /* varchar        */ = [TypeReader$text$universal,   TypeReader$text$universal    ];
types[1082] /* date           */ = [TypeReader$timestamp$text,   TypeReader$timestamp$binary  ];
types[1083] /* time           */ = [TypeReader$timestamp$text,   TypeReader$timestamp$binary  ];
types[1114] /* timestamp      */ = [TypeReader$timestamp$text,   TypeReader$timestamp$binary  ];
types[1115] /* _timestamp     */ = ND;
types[1182] /* _date          */ = ND;
types[1183] /* _time          */ = ND;
types[1184] /* timestamptz    */ = [TypeReader$timestamptz$text, TypeReader$timestamptz$binary];
types[1185] /* _timestamptz   */ = ND;
types[1186] /* interval       */ = ND;
types[1187] /* _interval      */ = ND;
types[1231] /* _numeric       */ = ND;
types[1263] /* _cstring       */ = ND;
types[1266] /* timetz         */ = [TypeReader$timestamptz$text, TypeReader$timestamptz$binary];
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
