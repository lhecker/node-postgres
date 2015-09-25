'use strict';

function TypeParser$bool$text(reader) {
	return reader.getUInt8() === 0x74;
}

function TypeParser$bool$binary(reader) {
	return reader.getUInt8() !== 0x00;
}

function TypeParser$bytea$text(reader) {
	return new Buffer(reader.toString('ascii').slice(2), 'hex');
}

function TypeParser$bytea$binary(reader) {
	return reader.toBuffer();
}

function TypeParser$text$universal(reader) {
	return reader.toString();
}

function TypeParser$number$text(reader) {
	return Number(reader.toString('ascii')); // TODO: int8 support
}

function TypeParser$int2$binary(reader) {
	return reader.getInt16();
}

function TypeParser$int4$binary(reader) {
	return reader.getInt32();
}

function TypeParser$int8$binary(reader) {
	return reader.toBuffer(); // TODO: implement
}

function TypeParser$float4$binary(reader) {
	return reader.getFloat();
}

function TypeParser$float8$binary(reader) {
	return reader.getDouble();
}

function TypeParser$timestamp$text(reader) {
	return new Date(reader.toString('ascii'));
}

function TypeParser$timestamptz$text(reader) {
	/*
	 * postgres formats ISO dates as '2015-09-24 19:03:07.626+02'
	 * ---> v8 interprets '+02' as +2 minutes instead of hours
	 */
	return new Date(reader.toString('ascii') + ':00');
}

function TypeParser$timestamp$binary(reader) {
	return reader.toBuffer(); // TODO: implement
}


const _$_default_$_              = [TypeParser$text$universal,   TypeParser$bytea$binary    ];
const types = [];

types[  16] /* bool           */ = [TypeParser$bool$text,        TypeParser$bool$binary     ];
types[  17] /* bytea          */ = [TypeParser$bytea$text,       TypeParser$bytea$binary    ];
types[  18] /* char           */ = [TypeParser$text$universal,   TypeParser$text$universal  ];
types[  19] /* name           */ = _$_default_$_;
types[  20] /* int8           */ = [TypeParser$number$text,      TypeParser$int8$binary     ];
types[  21] /* int2           */ = [TypeParser$number$text,      TypeParser$int2$binary     ];
types[  22] /* int2vector     */ = _$_default_$_;
types[  23] /* int4           */ = [TypeParser$number$text,      TypeParser$int4$binary     ];
types[  24] /* regproc        */ = _$_default_$_;
types[  25] /* text           */ = [TypeParser$text$universal,   TypeParser$text$universal  ];
types[  26] /* oid            */ = [TypeParser$number$text,      TypeParser$int4$binary     ];
types[  27] /* tid            */ = _$_default_$_;
types[  28] /* xid            */ = _$_default_$_;
types[  29] /* cid            */ = _$_default_$_;
types[  30] /* oidvector      */ = _$_default_$_;
types[ 114] /* json           */ = _$_default_$_;
types[ 142] /* xml            */ = _$_default_$_;
types[ 143] /* _xml           */ = _$_default_$_;
types[ 199] /* _json          */ = _$_default_$_;
types[ 600] /* point          */ = _$_default_$_;
types[ 601] /* lseg           */ = _$_default_$_;
types[ 602] /* path           */ = _$_default_$_;
types[ 603] /* box            */ = _$_default_$_;
types[ 604] /* polygon        */ = _$_default_$_;
types[ 628] /* line           */ = _$_default_$_;
types[ 629] /* _line          */ = _$_default_$_;
types[ 650] /* cidr           */ = _$_default_$_;
types[ 651] /* _cidr          */ = _$_default_$_;
types[ 700] /* float4         */ = [TypeParser$number$text,      TypeParser$float4$binary   ];
types[ 701] /* float8         */ = [TypeParser$number$text,      TypeParser$float8$binary   ];
types[ 702] /* abstime        */ = _$_default_$_;
types[ 703] /* reltime        */ = _$_default_$_;
types[ 704] /* tinterval      */ = _$_default_$_;
types[ 705] /* unknown        */ = _$_default_$_;
types[ 718] /* circle         */ = _$_default_$_;
types[ 719] /* _circle        */ = _$_default_$_;
types[ 790] /* money          */ = _$_default_$_;
types[ 791] /* _money         */ = _$_default_$_;
types[ 829] /* macaddr        */ = _$_default_$_;
types[ 869] /* inet           */ = _$_default_$_;
types[1000] /* _bool          */ = _$_default_$_;
types[1001] /* _bytea         */ = _$_default_$_;
types[1002] /* _char          */ = _$_default_$_;
types[1003] /* _name          */ = _$_default_$_;
types[1005] /* _int2          */ = _$_default_$_;
types[1006] /* _int2vector    */ = _$_default_$_;
types[1007] /* _int4          */ = _$_default_$_;
types[1008] /* _regproc       */ = _$_default_$_;
types[1009] /* _text          */ = _$_default_$_;
types[1010] /* _tid           */ = _$_default_$_;
types[1011] /* _xid           */ = _$_default_$_;
types[1012] /* _cid           */ = _$_default_$_;
types[1013] /* _oidvector     */ = _$_default_$_;
types[1014] /* _bpchar        */ = _$_default_$_;
types[1015] /* _varchar       */ = _$_default_$_;
types[1016] /* _int8          */ = _$_default_$_;
types[1017] /* _point         */ = _$_default_$_;
types[1018] /* _lseg          */ = _$_default_$_;
types[1019] /* _path          */ = _$_default_$_;
types[1020] /* _box           */ = _$_default_$_;
types[1021] /* _float4        */ = _$_default_$_;
types[1022] /* _float8        */ = _$_default_$_;
types[1023] /* _abstime       */ = _$_default_$_;
types[1024] /* _reltime       */ = _$_default_$_;
types[1025] /* _tinterval     */ = _$_default_$_;
types[1027] /* _polygon       */ = _$_default_$_;
types[1028] /* _oid           */ = _$_default_$_;
types[1034] /* _aclitem       */ = _$_default_$_;
types[1040] /* _macaddr       */ = _$_default_$_;
types[1041] /* _inet          */ = _$_default_$_;
types[1042] /* bpchar         */ = [TypeParser$text$universal,   TypeParser$text$universal  ];
types[1043] /* varchar        */ = [TypeParser$text$universal,   TypeParser$text$universal  ];
types[1082] /* date           */ = [TypeParser$timestamp$text,   TypeParser$timestamp$binary];
types[1083] /* time           */ = [TypeParser$timestamp$text,   TypeParser$timestamp$binary];
types[1114] /* timestamp      */ = [TypeParser$timestamp$text,   TypeParser$timestamp$binary];
types[1115] /* _timestamp     */ = _$_default_$_;
types[1182] /* _date          */ = _$_default_$_;
types[1183] /* _time          */ = _$_default_$_;
types[1184] /* timestamptz    */ = [TypeParser$timestamptz$text, TypeParser$timestamp$binary];
types[1185] /* _timestamptz   */ = _$_default_$_;
types[1186] /* interval       */ = _$_default_$_;
types[1187] /* _interval      */ = _$_default_$_;
types[1231] /* _numeric       */ = _$_default_$_;
types[1263] /* _cstring       */ = _$_default_$_;
types[1266] /* timetz         */ = [TypeParser$timestamp$text,   TypeParser$timestamp$binary];
types[1270] /* _timetz        */ = _$_default_$_;
types[1560] /* bit            */ = _$_default_$_;
types[1561] /* _bit           */ = _$_default_$_;
types[1562] /* varbit         */ = _$_default_$_;
types[1563] /* _varbit        */ = _$_default_$_;
types[1700] /* numeric        */ = _$_default_$_;
types[1790] /* refcursor      */ = _$_default_$_;
types[2201] /* _refcursor     */ = _$_default_$_;
types[2202] /* regprocedure   */ = _$_default_$_;
types[2203] /* regoper        */ = _$_default_$_;
types[2204] /* regoperator    */ = _$_default_$_;
types[2205] /* regclass       */ = _$_default_$_;
types[2206] /* regtype        */ = _$_default_$_;
types[2207] /* _regprocedure  */ = _$_default_$_;
types[2208] /* _regoper       */ = _$_default_$_;
types[2209] /* _regoperator   */ = _$_default_$_;
types[2210] /* _regclass      */ = _$_default_$_;
types[2211] /* _regtype       */ = _$_default_$_;
types[2949] /* _txid_snapshot */ = _$_default_$_;
types[2950] /* uuid           */ = _$_default_$_;
types[2951] /* _uuid          */ = _$_default_$_;
types[2970] /* txid_snapshot  */ = _$_default_$_;
types[3220] /* pg_lsn         */ = _$_default_$_;
types[3221] /* _pg_lsn        */ = _$_default_$_;
types[3614] /* tsvector       */ = _$_default_$_;
types[3615] /* tsquery        */ = _$_default_$_;
types[3643] /* _tsvector      */ = _$_default_$_;
types[3644] /* _gtsvector     */ = _$_default_$_;
types[3645] /* _tsquery       */ = _$_default_$_;
types[3734] /* regconfig      */ = _$_default_$_;
types[3735] /* _regconfig     */ = _$_default_$_;
types[3769] /* regdictionary  */ = _$_default_$_;
types[3770] /* _regdictionary */ = _$_default_$_;
types[3802] /* jsonb          */ = _$_default_$_;
types[3807] /* _jsonb         */ = _$_default_$_;
types[3904] /* int4range      */ = _$_default_$_;
types[3905] /* _int4range     */ = _$_default_$_;
types[3906] /* numrange       */ = _$_default_$_;
types[3907] /* _numrange      */ = _$_default_$_;
types[3908] /* tsrange        */ = _$_default_$_;
types[3909] /* _tsrange       */ = _$_default_$_;
types[3910] /* tstzrange      */ = _$_default_$_;
types[3911] /* _tstzrange     */ = _$_default_$_;
types[3912] /* daterange      */ = _$_default_$_;
types[3913] /* _daterange     */ = _$_default_$_;
types[3926] /* int8range      */ = _$_default_$_;
types[3927] /* _int8range     */ = _$_default_$_;

types.default = _$_default_$_;

module.exports = types;
