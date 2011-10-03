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
function StreamedEmitter() {
    EventEmitter2.call(this);
    this.outputstreams = [];
}
util.inherits(StreamedEmitter, EventEmitter2);
StreamedEmitter.prototype.addInput = function addInput(inputstream) {
    var self = this;
    onLine(inputstream, function emit(data) {
        try {
            var args = JSON.parse(data);
        }
        catch(e) {
            return self._emit('error', e);
        }
        return self.emit.apply(self, args);
    });
}
StreamedEmitter.prototype.addOutput = function addOutput(outputstream) {
    var self = this;
    this.outputstreams.push(outputstream);
    outputstream.on('end', function() {
        self.outputstreams.splice(self.outputstreams.indexOf(outputstream),1);
    });
}
StreamedEmitter.prototype._emit = StreamedEmitter.prototype.emit;
StreamedEmitter.prototype.emit = function emit() {
    try {
        var str = JSON.stringify(slice.apply(arguments));
    }
    catch(e) {
        return this._emit('error', e);
    }
    var self = this;
    this.outputstreams.forEach(function(stream) {
        try {
            stream.write(str);
            stream.write('\n');
        }
        catch(e) {
            self._emit('error', e);
        }
    });
    return this._emit.apply(this, arguments);
}
