var StreamedEmitter = require('../lib/streamedemitter.js');
var emitter = new StreamedEmitter({wildcard:true})
//
// Any error should be printed
//
emitter.on('error', function(err){
    console.error(err.stack)
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
emitter.on('streamedemitter.*', function() {console.log("EVENT!")})
emitter.emit('streamedemitter.test', 'hello world!');