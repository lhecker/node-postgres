'use strict';

(function () {
	const map = {
		'1': 'ParseComplete',
		'2': 'BindComplete',
		'3': 'CloseComplete',
		'A': 'NotificationResponse',
		'C': 'CommandComplete',
		'c': 'CopyDone',
		'd': 'CopyData',
		'D': 'DataRow',
		'E': 'ErrorResponse',
		'G': 'CopyInResponse',
		'H': 'CopyOutResponse',
		'I': 'EmptyQueryResponse',
		'K': 'BackendKeyData',
		'n': 'NoData',
		'N': 'NoticeResponse',
		'R': 'Authentication',
		'S': 'ParameterStatus',
		's': 'PortalSuspended',
		't': 'ParameterDescription',
		'T': 'RowDescription',
		'V': 'FunctionCallResponse',
		'W': 'CopyBothResponse',
		'Z': 'ReadyForQuery',
	};

	const baseDir = require('path').join(__dirname, './parsers/');

	for (let type in map) {
		const name = map[type];
		const parserName = `${name}Parser`;

		require('fs').writeFileSync(baseDir + name + '.js',
`'use strict';


function ${parserName}(data) {
	console.log('${parserName}');
	console.log(data);
	console.log();
}

${parserName}.type = '${type}';


module.exports = ${parserName};
`);
	}
})();



(function () {
	const map = {
		'B': 'Bind',
		'C': 'Close',
		'c': 'CopyDone',
		'd': 'CopyData',
		'D': 'Describe',
		'E': 'Execute',
		'f': 'CopyFail',
		'F': 'FunctionCall',
		'H': 'Flush',
		'P': 'Parse',
		'p': 'PasswordMessage',
		'Q': 'Query',
		'S': 'Sync',
		'X': 'Terminate',
	};

	const baseDir = require('path').join(__dirname, './packets/');

	for (let type in map) {
		const name = map[type];
		const packetName = `${name}Packet`;

		require('fs').writeFileSync(baseDir + name + '.js',
`'use strict';


function ${packetName}() {
	const type = '${type}';
	throw new Error('unimplemented');
}


module.exports = ${packetName};
`);
	}
})();
