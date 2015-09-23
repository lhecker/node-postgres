'use strict';

const kHighestOid = 3927; /* _int8range */


function createBufferParser(name) {
	const parserName = 'typeParser$' + name;

	return new Function(
`return function ${parserName}(reader, length) {
	return length >= 0 ? reader.getBytes(length) : null;
};`
	)();
}


const types = new Array(kHighestOid);

types[  16] = createBufferParser('bool');
types[  17] = createBufferParser('bytea');
types[  18] = createBufferParser('char');
types[  19] = createBufferParser('name');
types[  20] = createBufferParser('int8');
types[  21] = createBufferParser('int2');
types[  22] = createBufferParser('int2vector');
types[  23] = createBufferParser('int4');
types[  24] = createBufferParser('regproc');
types[  25] = createBufferParser('text');
types[  26] = createBufferParser('oid');
types[  27] = createBufferParser('tid');
types[  28] = createBufferParser('xid');
types[  29] = createBufferParser('cid');
types[  30] = createBufferParser('oidvector');
types[ 114] = createBufferParser('json');
types[ 142] = createBufferParser('xml');
types[ 143] = createBufferParser('_xml');
types[ 199] = createBufferParser('_json');
types[ 600] = createBufferParser('point');
types[ 601] = createBufferParser('lseg');
types[ 602] = createBufferParser('path');
types[ 603] = createBufferParser('box');
types[ 604] = createBufferParser('polygon');
types[ 628] = createBufferParser('line');
types[ 629] = createBufferParser('_line');
types[ 650] = createBufferParser('cidr');
types[ 651] = createBufferParser('_cidr');
types[ 700] = createBufferParser('float4');
types[ 701] = createBufferParser('float8');
types[ 702] = createBufferParser('abstime');
types[ 703] = createBufferParser('reltime');
types[ 704] = createBufferParser('tinterval');
types[ 705] = createBufferParser('unknown');
types[ 718] = createBufferParser('circle');
types[ 719] = createBufferParser('_circle');
types[ 790] = createBufferParser('money');
types[ 791] = createBufferParser('_money');
types[ 829] = createBufferParser('macaddr');
types[ 869] = createBufferParser('inet');
types[1000] = createBufferParser('_bool');
types[1001] = createBufferParser('_bytea');
types[1002] = createBufferParser('_char');
types[1003] = createBufferParser('_name');
types[1005] = createBufferParser('_int2');
types[1006] = createBufferParser('_int2vector');
types[1007] = createBufferParser('_int4');
types[1008] = createBufferParser('_regproc');
types[1009] = createBufferParser('_text');
types[1010] = createBufferParser('_tid');
types[1011] = createBufferParser('_xid');
types[1012] = createBufferParser('_cid');
types[1013] = createBufferParser('_oidvector');
types[1014] = createBufferParser('_bpchar');
types[1015] = createBufferParser('_varchar');
types[1016] = createBufferParser('_int8');
types[1017] = createBufferParser('_point');
types[1018] = createBufferParser('_lseg');
types[1019] = createBufferParser('_path');
types[1020] = createBufferParser('_box');
types[1021] = createBufferParser('_float4');
types[1022] = createBufferParser('_float8');
types[1023] = createBufferParser('_abstime');
types[1024] = createBufferParser('_reltime');
types[1025] = createBufferParser('_tinterval');
types[1027] = createBufferParser('_polygon');
types[1028] = createBufferParser('_oid');
types[1034] = createBufferParser('_aclitem');
types[1040] = createBufferParser('_macaddr');
types[1041] = createBufferParser('_inet');
types[1042] = createBufferParser('bpchar');
types[1043] = createBufferParser('varchar');
types[1082] = createBufferParser('date');
types[1083] = createBufferParser('time');
types[1114] = createBufferParser('timestamp');
types[1115] = createBufferParser('_timestamp');
types[1182] = createBufferParser('_date');
types[1183] = createBufferParser('_time');
types[1184] = createBufferParser('timestamptz');
types[1185] = createBufferParser('_timestamptz');
types[1186] = createBufferParser('interval');
types[1187] = createBufferParser('_interval');
types[1231] = createBufferParser('_numeric');
types[1263] = createBufferParser('_cstring');
types[1266] = createBufferParser('timetz');
types[1270] = createBufferParser('_timetz');
types[1560] = createBufferParser('bit');
types[1561] = createBufferParser('_bit');
types[1562] = createBufferParser('varbit');
types[1563] = createBufferParser('_varbit');
types[1700] = createBufferParser('numeric');
types[1790] = createBufferParser('refcursor');
types[2201] = createBufferParser('_refcursor');
types[2202] = createBufferParser('regprocedure');
types[2203] = createBufferParser('regoper');
types[2204] = createBufferParser('regoperator');
types[2205] = createBufferParser('regclass');
types[2206] = createBufferParser('regtype');
types[2207] = createBufferParser('_regprocedure');
types[2208] = createBufferParser('_regoper');
types[2209] = createBufferParser('_regoperator');
types[2210] = createBufferParser('_regclass');
types[2211] = createBufferParser('_regtype');
types[2949] = createBufferParser('_txid_snapshot');
types[2950] = createBufferParser('uuid');
types[2951] = createBufferParser('_uuid');
types[2970] = createBufferParser('txid_snapshot');
types[3220] = createBufferParser('pg_lsn');
types[3221] = createBufferParser('_pg_lsn');
types[3614] = createBufferParser('tsvector');
types[3615] = createBufferParser('tsquery');
types[3643] = createBufferParser('_tsvector');
types[3644] = createBufferParser('_gtsvector');
types[3645] = createBufferParser('_tsquery');
types[3734] = createBufferParser('regconfig');
types[3735] = createBufferParser('_regconfig');
types[3769] = createBufferParser('regdictionary');
types[3770] = createBufferParser('_regdictionary');
types[3802] = createBufferParser('jsonb');
types[3807] = createBufferParser('_jsonb');
types[3904] = createBufferParser('int4range');
types[3905] = createBufferParser('_int4range');
types[3906] = createBufferParser('numrange');
types[3907] = createBufferParser('_numrange');
types[3908] = createBufferParser('tsrange');
types[3909] = createBufferParser('_tsrange');
types[3910] = createBufferParser('tstzrange');
types[3911] = createBufferParser('_tstzrange');
types[3912] = createBufferParser('daterange');
types[3913] = createBufferParser('_daterange');
types[3926] = createBufferParser('int8range');
types[3927] = createBufferParser('_int8range');

console.assert(types.length === kHighestOid); // => remember to update kHighestOid
