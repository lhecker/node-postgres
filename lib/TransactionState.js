'use strict';

[
	'IDLE',
	'ONGOING',
	'FAILED',
].forEach((state) => {
	exports[state] = Symbol(state);
});
