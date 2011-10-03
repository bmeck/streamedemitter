var StreamedEmitter = require('../lib/streamedemitter.js');
var emitter = new StreamedEmitter()
//
// Any error should be printed
//
emitter.on('error', function(){
    console.error(arguments)
})
//
// Accept JSON arrays for creating events from stdin
//
emitter.addInput(process.openStdin());
//
// Send all emitted events to stdout as JSON arrays
//
emitter.addOutput(process.stdout);
//
// Emit a hello world! example that will be pushed to stdout
//
emitter.emit('streamedemitter::test', 'hello world!');