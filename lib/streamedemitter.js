var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var slice = [].slice;
var separator = '\n'.charCodeAt(0);

module.exports = StreamedEmitter;

function onLine(stream, callback) {
    var currentData = [];
    stream.on('data', function onData(data) {
        if(typeof data === 'string') {
            return onData(new Buffer(data));
        }
        var results;
        var l = data.length;
        var start = 0;
        for(var i = 0; i < l;) {
            if(data[i++] === separator) {
                if(currentData.length) {
                    var thisLine = currentData.join('') + data.slice(start, i);
                    currentData = [];
                }
                else {
                    var thisLine = data.slice(start, i).toString();
                }
                start = i;
                callback(thisLine);
            }
        }
        if (start != l) {
            currentData[currentData.length] = data;
        }
    });

    stream.on('end', function onEnd() {
        if (this.currentData.length) {
            callback(currentData.join(''));
        }
        currentData = [];
    });
}
function StreamedEmitter(options) {
    EventEmitter2.call(this, options);
    this.outputstreams = [];
}
util.inherits(StreamedEmitter, EventEmitter2);
StreamedEmitter.prototype.addInput = function addInput(inputstream) {
    var self = this;
    var exceptions = [inputstream];
    onLine(inputstream, function emit(data) {
        data = data+'';
        try {
            var args = JSON.parse(data);
            if(!Array.isArray(args)) {
                throw new Error('Expected Array from StreamEmitter input.');
            }
        }
        catch(e) {
            return self._emit('error', e);
        }
        return self._emitExcept.call(self, exceptions, args);
    });
}
StreamedEmitter.prototype.addOutput = function addOutput(outputstream) {
    var self = this;
    this.outputstreams.push(outputstream);
    outputstream.on('end', function() {
        self.outputstreams.splice(self.outputstreams.indexOf(outputstream),1);
    });
}
StreamedEmitter.prototype.addDuplex = function addDuplex(stream) {
    this.addInput(stream);
    this.addOutput(stream);
}
StreamedEmitter.prototype._SE_emit = StreamedEmitter.prototype.emit;
StreamedEmitter.prototype._SE_emitExcept = function _emitExcept(streams, args) {
    var outputs = this.outputstreams;
    if(streams && streams.length) {
        outputs = outputs.filter(function isNotException(output) {
            return streams.indexOf(output) === -1
        });
    }
    try {
        var str = JSON.stringify(args);
    }
    catch(e) {
        return this._emit('error', e);
    }
    var self = this;
    outputs.forEach(function(stream) {
        try {
            stream.write(str);
            stream.write('\n');
        }
        catch(e) {
            self._SE_emit('error', e);
        }
    });
    return this._SE_emit.apply(this, args);
}
StreamedEmitter.prototype.emit = function emit() {
    this._SE_emitExcept(undefined, slice.call(arguments));
}
