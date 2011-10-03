# StreamedEmitter

A streamed emitter is an emitter that can send events over streams.
It is simple and lightweight using JSON arrays delimited by newlines.
The interface to a streamed emitter mimics the EventEmitter interface with 2 new methods.

This emitter can be used as the base to more complex libraries such as dnode or hook.io (those 2 are not built upon this however).

## addInput(inputstream)

Adds a stream that will be listened to for incoming JSON arrays.
These incoming arrays will be emitted on the StreamedEmitter.
If an error occurs during parsing a line it will be emitted on the StreamedEmitter.

## addOutput(outputstream)

Adds a stream to the list of streams to emit events to as JSON arrays.
When any emit(...) occurs on the StreamedEmitter it will be sent to all outputs.
For every error occuring during writes to output streams a new error will be emitted on the StreamedEmitter.

