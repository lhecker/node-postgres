'use strict';

const EventEmitter = require('events');
const net = require('net');

const emit = EventEmitter.prototype.emit;

EventEmitter.prototype.emit = function () {
    if (console.log) console.log.apply(null, [this.__proto__.constructor.name + ':'].concat(Array.from(arguments)));
    emit.apply(this, arguments);
}

const s = net.connect(80, '216.58.214.67');
s.destroy();

setTimeout(() => {
    console.log('---')
    s.destroy();
}, 1000)
